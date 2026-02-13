"use client";

import { MAX_GUESSES } from "@/lib/game-logic";

const C = {
  c2: "#1a1f35",
  bdr: "#252b45",
  gold: "#f5a623",
  bg: "#0b0e1a",
  gry: "#334155",
  txt: "#e2e8f0",
  txtM: "#64748b",
  red: "#ef4444",
  wht: "#fff",
};

interface GameInputProps {
  firstLetter: string;
  input: string;
  setInput: (val: string) => void;
  onSubmit: () => void;
  error: string;
  shake: boolean;
  guessCount: number;
}

export function GameInput({
  firstLetter,
  input,
  setInput,
  onSubmit,
  error,
  shake,
  guessCount,
}: GameInputProps) {
  return (
    <div className={shake ? "animate-shake" : ""}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: C.c2,
            border: `2px solid ${C.gold}`,
            borderRadius: 8,
            fontFamily: "'Russo One', sans-serif",
            fontSize: 22,
            color: C.gold,
            flexShrink: 0,
          }}
        >
          {firstLetter}
        </div>
        <input
          style={{
            background: C.c2,
            border: `2px solid ${C.bdr}`,
            borderRadius: 10,
            padding: "12px 16px",
            color: C.txt,
            fontSize: 22,
            flex: 1,
            fontFamily: "'Nunito', sans-serif",
            outline: "none",
            boxSizing: "border-box",
            textTransform: "uppercase",
            letterSpacing: 6,
            textAlign: "center",
            fontWeight: 800,
          }}
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
                .replace(/[^a-zA-Z]/g, "")
                .toUpperCase()
                .slice(0, 3)
            )
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
          onFocus={(e) => (e.target.style.borderColor = C.gold)}
          onBlur={(e) => (e.target.style.borderColor = C.bdr)}
          placeholder="···"
          maxLength={3}
          autoFocus
        />
        <button
          style={{
            background: input.length !== 3 ? C.gry : C.gold,
            color: input.length !== 3 ? C.wht : C.bg,
            border: "none",
            borderRadius: 10,
            padding: "14px 24px",
            fontFamily: "'Russo One', sans-serif",
            fontSize: 20,
            flexShrink: 0,
            cursor: input.length !== 3 ? "default" : "pointer",
            letterSpacing: 1,
            opacity: input.length !== 3 ? 0.5 : 1,
          }}
          onClick={onSubmit}
          disabled={input.length !== 3}
        >
          ↵
        </button>
      </div>
      {error && (
        <div
          style={{
            color: C.red,
            fontSize: 13,
            textAlign: "center",
            marginTop: 6,
          }}
        >
          {error}
        </div>
      )}
      <div
        style={{
          textAlign: "center",
          color: C.txtM,
          fontSize: 12,
          marginTop: 8,
        }}
      >
        {MAX_GUESSES - guessCount} guesses left &bull; First letter is locked
      </div>
    </div>
  );
}
