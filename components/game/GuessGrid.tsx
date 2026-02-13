"use client";

import { GuessRow } from "./GuessRow";
import { MAX_GUESSES } from "@/lib/game-logic";

interface GuessGridProps {
  guesses: string[];
  feedbacks: number[][];
  input: string;
  firstLetter: string;
  solved: boolean;
  timeLeft: number;
}

export function GuessGrid({
  guesses,
  feedbacks,
  input,
  firstLetter,
  solved,
  timeLeft,
}: GuessGridProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "20px 0",
      }}
    >
      {Array.from({ length: MAX_GUESSES }).map((_, i) => (
        <GuessRow
          key={i}
          guess={guesses[i]}
          feedback={feedbacks[i]}
          isActive={i === guesses.length && !solved && timeLeft > 0}
          input={i === guesses.length ? input : ""}
          firstLetter={firstLetter}
        />
      ))}
    </div>
  );
}
