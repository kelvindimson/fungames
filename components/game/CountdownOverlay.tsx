"use client";

const C = {
  gold: "#f5a623",
};

interface CountdownOverlayProps {
  num: number | null;
}

export function CountdownOverlay({ num }: CountdownOverlayProps) {
  if (num === null) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.88)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
    >
      <div
        key={num}
        className="animate-pop-in"
        style={{
          fontFamily: "'Russo One', sans-serif",
          fontSize: 130,
          color: C.gold,
          textShadow: `0 0 60px ${C.gold}50`,
        }}
      >
        {num === 0 ? "GO!" : num}
      </div>
    </div>
  );
}
