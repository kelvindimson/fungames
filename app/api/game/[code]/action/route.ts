import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players, rounds } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { TOTAL_ROUNDS } from "@/lib/game-logic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { playerId, action, payload } = await req.json();
    const upperCode = code.toUpperCase();

    const game = await db.query.games.findFirst({
      where: (g, { eq }) => eq(g.code, upperCode),
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (action === "startRound") {
      if (playerId !== game.gmId) {
        return NextResponse.json({ error: "Only GM can start rounds" }, { status: 403 });
      }

      const newRound = game.currentRound + 1;
      const roundStartTime = Date.now() + 4000; // 4s for countdown

      await db
        .update(games)
        .set({
          status: "countdown",
          currentRound: newRound,
          roundStartTime,
          updatedAt: new Date(),
        })
        .where(eq(games.code, upperCode));

      // Create round record
      await db.insert(rounds).values({
        gameCode: upperCode,
        roundNum: newRound,
        results: {},
      });

      const updatedGame = await db.query.games.findFirst({
        where: (g, { eq }) => eq(g.code, upperCode),
      });

      const playerList = await db
        .select()
        .from(players)
        .where(eq(players.gameCode, upperCode));

      return NextResponse.json({
        gameState: {
          code: updatedGame!.code,
          gmId: updatedGame!.gmId,
          status: updatedGame!.status,
          currentRound: updatedGame!.currentRound,
          words: updatedGame!.words,
          roundTime: updatedGame!.roundTime,
          roundStartTime: updatedGame!.roundStartTime,
        },
        players: playerList,
      });
    }

    if (action === "endRound") {
      if (playerId !== game.gmId) {
        return NextResponse.json({ error: "Only GM can end rounds" }, { status: 403 });
      }

      const newStatus = game.currentRound >= TOTAL_ROUNDS ? "gameOver" : "roundEnd";

      await db
        .update(games)
        .set({
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(games.code, upperCode));

      const updatedGame = await db.query.games.findFirst({
        where: (g, { eq }) => eq(g.code, upperCode),
      });

      const playerList = await db
        .select()
        .from(players)
        .where(eq(players.gameCode, upperCode));

      return NextResponse.json({
        gameState: {
          code: updatedGame!.code,
          gmId: updatedGame!.gmId,
          status: updatedGame!.status,
          currentRound: updatedGame!.currentRound,
          words: updatedGame!.words,
          roundTime: updatedGame!.roundTime,
          roundStartTime: updatedGame!.roundStartTime,
        },
        players: playerList,
      });
    }

    if (action === "submitScore") {
      const { score, guessCount } = payload;

      // Update round results
      const round = await db.query.rounds.findFirst({
        where: (r, { eq: e, and: a }) =>
          a(e(r.gameCode, upperCode), e(r.roundNum, game.currentRound)),
      });

      if (round) {
        const results = { ...round.results, [playerId]: { score, guesses: guessCount } };
        await db
          .update(rounds)
          .set({ results })
          .where(
            and(
              eq(rounds.gameCode, upperCode),
              eq(rounds.roundNum, game.currentRound)
            )
          );
      }

      // Update player total score
      await db
        .update(players)
        .set({
          totalScore: sql`${players.totalScore} + ${score}`,
        })
        .where(eq(players.id, playerId));

      const playerList = await db
        .select()
        .from(players)
        .where(eq(players.gameCode, upperCode));

      const updatedRound = await db.query.rounds.findFirst({
        where: (r, { eq: e, and: a }) =>
          a(e(r.gameCode, upperCode), e(r.roundNum, game.currentRound)),
      });

      return NextResponse.json({
        gameState: {
          code: game.code,
          gmId: game.gmId,
          status: game.status,
          currentRound: game.currentRound,
          words: game.words,
          roundTime: game.roundTime,
          roundStartTime: game.roundStartTime,
        },
        players: playerList,
        roundData: updatedRound,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Action error:", err);
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
  }
}
