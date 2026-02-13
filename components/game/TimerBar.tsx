"use client";

const C = {
  grn: "#22c55e",
  ylw: "#eab308",
  red: "#ef4444",
  gry: "#334155",
};

interface TimerBarProps {
  left: number;
  total: number;
}

export function TimerBar({ left, total }: TimerBarProps) {
  const pct = (left / total) * 100;
  const col = left <= 5 ? C.red : left <= 10 ? C.ylw : C.grn;
  return (
    <div
      style={{
        width: "100%",
        height: 6,
        background: C.gry,
        borderRadius: 3,
        overflow: "hidden",
        marginTop: 8,
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: col,
          borderRadius: 3,
          transition: "width 0.5s linear, background 0.3s",
        }}
      />
    </div>
  );
}
