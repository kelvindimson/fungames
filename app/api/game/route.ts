import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, players } from "@/db/schema";
import { generateCode, pickWords, obfuscate, TOTAL_ROUNDS } from "@/lib/game-logic";

export async function POST(req: Request) {
  try {
    const { playerName, playerId, roundTime: rt } = await req.json();
    const roundTime = [30, 40, 50, 60].includes(rt) ? rt : 30;

    if (!playerName?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Generate unique code (retry on collision)
    let code = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await db.query.games.findFirst({
        where: (g, { eq }) => eq(g.code, code),
      });
      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    const words = pickWords(TOTAL_ROUNDS).map(obfuscate);

    await db.insert(games).values({
      code,
      gmId: playerId,
      status: "lobby",
      currentRound: 0,
      words,
      roundTime,
      roundStartTime: null,
    });

    await db.insert(players).values({
      id: playerId,
      gameCode: code,
      name: playerName.trim(),
      totalScore: 0,
    });

    const gameState = {
      code,
      gmId: playerId,
      status: "lobby",
      currentRound: 0,
      words,
      roundTime,
      roundStartTime: null,
    };

    return NextResponse.json({
      code,
      gameState,
      players: [{ id: playerId, gameCode: code, name: playerName.trim(), totalScore: 0 }],
    });
  } catch (err) {
    console.error("Create game error:", err);
    return NextResponse.json({ error: "Failed to create game" }, { status: 500 });
  }
}
