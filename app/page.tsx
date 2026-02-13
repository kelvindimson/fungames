"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generatePlayerId } from "@/lib/game-logic";

const C = {
  bg: "#0b0e1a",
  c1: "#141829",
  c2: "#1a1f35",
  bdr: "#252b45",
  gold: "#f5a623",
  ylw: "#eab308",
  gry: "#334155",
  txt: "#e2e8f0",
  txtD: "#94a3b8",
  txtM: "#64748b",
  red: "#ef4444",
  wht: "#fff",
  acc: "#818cf8",
};

function getPlayerId(): string {
  if (typeof window === "undefined") return generatePlayerId();
  let id = sessionStorage.getItem("lingo-pid");
  if (!id) {
    id = generatePlayerId();
    sessionStorage.setItem("lingo-pid", id);
  }
  return id;
}

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [roundTime, setRoundTime] = useState(30);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!name.trim()) {
      setErr("Enter your name");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const pid = getPlayerId();
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: name.trim(), playerId: pid, roundTime }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Failed to create game");
        return;
      }
      sessionStorage.setItem("lingo-name", name.trim());
      sessionStorage.setItem("lingo-role", "gm");
      router.push(`/game/${data.code}`);
    } catch {
      setErr("Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  const join = async () => {
    if (!name.trim()) {
      setErr("Enter your name");
      return;
    }
    const c = joinCode.trim().toUpperCase();
    if (c.length !== 4) {
      setErr("Enter 4-letter code");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const pid = getPlayerId();
      const res = await fetch(`/api/game/${c}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: name.trim(), playerId: pid }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Game not found");
        return;
      }
      sessionStorage.setItem("lingo-name", name.trim());
      sessionStorage.setItem("lingo-role", data.gameState.gmId === pid ? "gm" : "player");
      router.push(`/game/${c}`);
    } catch {
      setErr("Failed to join game");
    } finally {
      setLoading(false);
    }
  };

  const card = {
    background: C.c1,
    border: `1px solid ${C.bdr}`,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 480,
  };

  const inp = {
    background: C.c2,
    border: `2px solid ${C.bdr}`,
    borderRadius: 10,
    padding: "12px 16px",
    color: C.txt,
    fontSize: 16,
    width: "100%",
    fontFamily: "'Nunito', sans-serif",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const btn = (c = C.gold, dis = false) => ({
    background: dis ? C.gry : c,
    color: c === C.gold ? C.bg : C.wht,
    border: "none",
    borderRadius: 10,
    padding: "13px 24px",
    fontFamily: "'Russo One', sans-serif",
    fontSize: 14,
    cursor: dis ? "default" : "pointer",
    width: "100%",
    letterSpacing: 1,
    opacity: dis ? 0.5 : 1,
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.txt,
        fontFamily: "'Nunito', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 16px",
      }}
    >
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "'Russo One', sans-serif",
            fontSize: 36,
            margin: 0,
            background: `linear-gradient(135deg, ${C.gold}, ${C.ylw})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: 4,
          }}
        >
          LINGO
        </h1>
      </div>

      <div className="animate-pop-in" style={card}>
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              fontSize: 11,
              color: C.txtD,
              letterSpacing: 1,
              marginBottom: 6,
              display: "block",
            }}
          >
            YOUR NAME
          </label>
          <input
            style={inp}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            maxLength={20}
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
            onFocus={(e) => (e.target.style.borderColor = C.gold)}
            onBlur={(e) => (e.target.style.borderColor = C.bdr)}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              fontSize: 11,
              color: C.txtD,
              letterSpacing: 1,
              marginBottom: 8,
              display: "block",
            }}
          >
            ROUND TIMER
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            {[30, 40, 50, 60].map((t) => (
              <button
                key={t}
                onClick={() => setRoundTime(t)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 8,
                  border: `2px solid ${roundTime === t ? C.gold : C.bdr}`,
                  background: roundTime === t ? `${C.gold}18` : C.c2,
                  color: roundTime === t ? C.gold : C.txtD,
                  fontFamily: "'Russo One', sans-serif",
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {t}s
              </button>
            ))}
          </div>
        </div>
        {err && (
          <div
            style={{
              color: C.red,
              fontSize: 13,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            {err}
          </div>
        )}
        <button
          style={{ ...btn(), marginBottom: 10 }}
          onClick={create}
          disabled={loading}
        >
          🎮 CREATE NEW GAME
        </button>
        <div
          style={{
            textAlign: "center",
            color: C.txtM,
            fontSize: 13,
            margin: "14px 0",
          }}
        >
          — or join —
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={{
              ...inp,
              flex: 1,
              textTransform: "uppercase",
              letterSpacing: 6,
              textAlign: "center",
              fontWeight: 800,
            }}
            value={joinCode}
            onChange={(e) =>
              setJoinCode(e.target.value.toUpperCase().slice(0, 4))
            }
            placeholder="CODE"
            maxLength={4}
            onKeyDown={(e) => e.key === "Enter" && join()}
            onFocus={(e) => (e.target.style.borderColor = C.gold)}
            onBlur={(e) => (e.target.style.borderColor = C.bdr)}
          />
          <button
            style={{
              ...btn(C.acc),
              width: "auto",
              padding: "12px 20px",
            }}
            onClick={join}
            disabled={loading}
          >
            JOIN
          </button>
        </div>
      </div>

      <div
        style={{
          marginTop: 32,
          fontSize: 10,
          color: C.txtM,
          letterSpacing: 2,
        }}
      >
        LINGO &bull; FRIDAY GAMES - BY ENCHILADAS TEAM
      </div>
    </div>
  );
}
