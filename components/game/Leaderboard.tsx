"use client";

import type { Player } from "@/lib/types";

const C = {
  c1: "#141829",
  bdr: "#252b45",
  gold: "#f5a623",
  grn: "#22c55e",
  txt: "#e2e8f0",
  txtM: "#64748b",
};

interface LeaderboardProps {
  players: Player[];
  roundScores?: Record<string, number>;
  showRound?: boolean;
  myId: string;
}

export function Leaderboard({ players, roundScores, showRound, myId }: LeaderboardProps) {
  const sorted = [...players].sort((a, b) => b.totalScore - a.totalScore);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div
      style={{
        background: C.c1,
        borderRadius: 14,
        border: `1px solid ${C.bdr}`,
        padding: 16,
        width: "100%",
      }}
    >
      <div
        style={{
          fontFamily: "'Russo One', sans-serif",
          fontSize: 13,
          color: C.gold,
          marginBottom: 12,
          letterSpacing: 2,
        }}
      >
        LEADERBOARD
      </div>
      {sorted.map((p, i) => {
        const rs = roundScores?.[p.id];
        const me = p.id === myId;
        return (
          <div
            key={p.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 12px",
              borderRadius: 8,
              marginBottom: 3,
              background: me ? `${C.gold}12` : "transparent",
              border: me ? `1px solid ${C.gold}35` : "1px solid transparent",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16, width: 26, textAlign: "center" }}>
                {i < 3 ? medals[i] : `${i + 1}.`}
              </span>
              <span
                style={{
                  color: C.txt,
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: me ? 800 : 600,
                  fontSize: 14,
                }}
              >
                {p.name}
                {me ? " (you)" : ""}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {showRound && rs !== undefined && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: rs > 0 ? C.grn : C.txtM,
                    background: rs > 0 ? `${C.grn}20` : "transparent",
                    padding: "2px 8px",
                    borderRadius: 6,
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  +{rs}
                </span>
              )}
              <span
                style={{
                  fontFamily: "'Russo One', sans-serif",
                  fontSize: 15,
                  color: C.gold,
                  minWidth: 36,
                  textAlign: "right",
                }}
              >
                {p.totalScore}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
