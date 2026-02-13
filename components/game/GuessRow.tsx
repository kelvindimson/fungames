"use client";

import { Tile } from "./Tile";

interface GuessRowProps {
  guess?: string;
  feedback?: number[];
  isActive?: boolean;
  input?: string;
  firstLetter: string;
}

export function GuessRow({ guess, feedback, isActive, input, firstLetter }: GuessRowProps) {
  const cells = [];
  for (let i = 0; i < 4; i++) {
    if (guess) {
      cells.push(<Tile key={i} letter={guess[i]} status={feedback?.[i]} />);
    } else if (isActive) {
      if (i === 0) {
        cells.push(<Tile key={i} letter={firstLetter} hint />);
      } else {
        const ch = input?.[i - 1] || "";
        cells.push(<Tile key={i} letter={ch} />);
      }
    } else {
      cells.push(
        <Tile key={i} letter={i === 0 ? firstLetter : ""} hint={i === 0} />
      );
    }
  }
  return <div style={{ display: "flex", gap: 6, marginBottom: 5 }}>{cells}</div>;
}
