"use client";

interface TileProps {
  letter?: string;
  status?: number; // 0=absent, 1=present, 2=correct
  hint?: boolean;
}

const C = {
  grn: "#22c55e",
  ylw: "#eab308",
  gry: "#334155",
  gryM: "#475569",
  bdr: "#252b45",
  c2: "#1a1f35",
  gold: "#f5a623",
  wht: "#fff",
};

export function Tile({ letter, status, hint }: TileProps) {
  const bg = hint
    ? C.c2
    : status === 2
      ? C.grn
      : status === 1
        ? C.ylw
        : status === 0
          ? C.gry
          : "transparent";
  const bd = hint
    ? C.gold
    : status === 2
      ? C.grn
      : status === 1
        ? C.ylw
        : status === 0
          ? C.gryM
          : C.bdr;

  return (
    <div
      className={`${letter && status === undefined ? "animate-pop-in" : ""} ${status !== undefined ? "animate-flip-in" : ""}`}
      style={{
        width: 56,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `2px solid ${bd}`,
        borderRadius: 8,
        background: bg,
        fontFamily: "'Russo One', sans-serif",
        fontSize: 24,
        color: C.wht,
        transition: "all 0.2s",
        letterSpacing: 1,
      }}
    >
      {letter || ""}
    </div>
  );
}
