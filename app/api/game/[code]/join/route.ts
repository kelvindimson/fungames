import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { playerName, playerId } = await req.json();
    const upperCode = code.toUpperCase();

    if (!playerName?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const game = await db.query.games.findFirst({
      where: (g, { eq }) => eq(g.code, upperCode),
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Check if player already exists (rejoin)
    const existing = await db.query.players.findFirst({
      where: (p, { eq: e, and: a }) =>
        a(e(p.id, playerId), e(p.gameCode, upperCode)),
    });

    if (!existing) {
      await db.insert(players).values({
        id: playerId,
        gameCode: upperCode,
        name: playerName.trim(),
        totalScore: 0,
      });
    }

    const playerList = await db
      .select()
      .from(players)
      .where(eq(players.gameCode, upperCode));

    const gameState = {
      code: game.code,
      gmId: game.gmId,
      status: game.status,
      currentRound: game.currentRound,
      words: game.words,
      roundTime: game.roundTime,
      roundStartTime: game.roundStartTime,
    };

    return NextResponse.json({ gameState, players: playerList });
  } catch (err) {
    console.error("Join error:", err);
    return NextResponse.json({ error: "Failed to join game" }, { status: 500 });
  }
}
