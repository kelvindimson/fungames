import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players, rounds } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const game = await db.query.games.findFirst({
      where: (g, { eq }) => eq(g.code, code.toUpperCase()),
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const playerList = await db
      .select()
      .from(players)
      .where(eq(players.gameCode, code.toUpperCase()));

    let roundData = null;
    if (game.currentRound > 0) {
      const rd = await db.query.rounds.findFirst({
        where: (r, { eq: e, and: a }) =>
          a(e(r.gameCode, code.toUpperCase()), e(r.roundNum, game.currentRound)),
      });
      roundData = rd || null;
    }

    const gameState = {
      code: game.code,
      gmId: game.gmId,
      status: game.status,
      currentRound: game.currentRound,
      words: game.words,
      roundTime: game.roundTime,
      roundStartTime: game.roundStartTime,
    };

    return NextResponse.json({
      gameState,
      players: playerList,
      roundData,
    });
  } catch (err) {
    console.error("Poll error:", err);
    return NextResponse.json({ error: "Failed to fetch game" }, { status: 500 });
  }
}
