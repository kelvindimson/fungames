"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef,useState } from "react";

import { CountdownOverlay } from "@/components/game/CountdownOverlay";
import { GameInput } from "@/components/game/GameInput";
import { GuessGrid } from "@/components/game/GuessGrid";
import { Leaderboard } from "@/components/game/Leaderboard";
import { TimerBar } from "@/components/game/TimerBar";
import {
  deobfuscate,
  generatePlayerId,
  getFeedback,
  MAX_GUESSES,
  POLL_MS,
  ROUND_TIME,
  SCORE_MAP,
  TOTAL_ROUNDS,
} from "@/lib/game-logic";
import type { GameState, Player } from "@/lib/types";
import { useSound } from "@/lib/use-sound";
// ROUND_TIME is the fallback default; actual roundTime comes from game state
import { VALID_WORDS } from "@/lib/words";

const C = {
  bg: "#0b0e1a",
  c1: "#141829",
  c2: "#1a1f35",
  bdr: "#252b45",
  gold: "#f5a623",
  ylw: "#eab308",
  grn: "#22c55e",
  gry: "#334155",
  txt: "#e2e8f0",
  txtD: "#94a3b8",
  txtM: "#64748b",
  red: "#ef4444",
  wht: "#fff",
  acc: "#818cf8",
};

type Screen = "lobby" | "countdown" | "playing" | "roundResult" | "gameOver";

function getPlayerId(): string {
  if (typeof window === "undefined") return generatePlayerId();
  let id = sessionStorage.getItem("lingo-pid");
  if (!id) {
    id = generatePlayerId();
    sessionStorage.setItem("lingo-pid", id);
  }
  return id;
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();
  const [pid] = useState(getPlayerId);

  const [screen, setScreen] = useState<Screen>("lobby");
  const [gs, setGs] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rd, setRd] = useState<{ results: Record<string, { score: number; guesses: number }> } | null>(null);
  const [role, setRole] = useState<"gm" | "player">("player");

  const [input, setInput] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [fbs, setFbs] = useState<number[][]>([]);
  const [solved, setSolved] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [cdNum, setCdNum] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState("");
  const snd = useSound();

  const solvedR = useRef(false);
  const gcR = useRef(0);
  const timerR = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollR = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundEndedR = useRef(false);
  const lastStatusR = useRef<string>("");

  const roundTime = gs?.roundTime || ROUND_TIME;
  const answer =
    gs?.words && gs.currentRound > 0
      ? deobfuscate(gs.words[gs.currentRound - 1])
      : "";
  const firstLetter = answer?.[0] || "";

  // Submit score to API
  const submitScore = useCallback(
    async (score: number) => {
      try {
        await fetch(`/api/game/${code}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId: pid,
            action: "submitScore",
            payload: { score, guessCount: gcR.current },
          }),
        });
      } catch (e) {
        console.error("Submit score error:", e);
      }
    },
    [code, pid]
  );

  // Start timer
  const startTimer = useCallback(
    (roundStart: number, rt: number) => {
      setTimeLeft(rt);
      if (timerR.current) clearInterval(timerR.current);
      timerR.current = setInterval(() => {
        const rem = Math.max(
          0,
          rt - Math.floor((Date.now() - roundStart) / 1000)
        );
        setTimeLeft((prev) => {
          if (rem !== prev && rem > 0 && rem <= 5) snd.warn();
          return rem;
        });
        if (rem <= 0) {
          clearInterval(timerR.current!);
          if (!solvedR.current && !roundEndedR.current) {
            roundEndedR.current = true;
            submitScore(0);
          }
        }
      }, 250);
    },
    [submitScore, snd]
  );

  // Trigger countdown
  const triggerCD = useCallback(
    (roundStart: number, rt: number) => {
      setSolved(false);
      solvedR.current = false;
      roundEndedR.current = false;
      setGuesses([]);
      setFbs([]);
      setInput("");
      gcR.current = 0;
      setCdNum(3);
      setScreen("countdown");
      snd.tick();
      setTimeout(() => { setCdNum(2); snd.tick(); }, 1000);
      setTimeout(() => { setCdNum(1); snd.tick(); }, 2000);
      setTimeout(() => {
        setCdNum(0);
        snd.go();
        setTimeout(() => {
          setCdNum(null);
          setScreen("playing");
          startTimer(roundStart, rt);
        }, 500);
      }, 3000);
    },
    [startTimer, snd]
  );

  // Polling
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/game/${code}`);
        if (!res.ok) return;
        const data = await res.json();

        const g: GameState = data.gameState;
        setGs(g);
        setPlayers(data.players || []);
        if (data.roundData) setRd(data.roundData);

        // Determine role
        if (g.gmId === pid) setRole("gm");

        const prevStatus = lastStatusR.current;
        lastStatusR.current = g.status;

        const rt = g.roundTime || ROUND_TIME;

        // Detect state transitions
        if (prevStatus && prevStatus !== g.status) {
          if (g.status === "countdown" && prevStatus !== "countdown") {
            triggerCD(g.roundStartTime || Date.now() + 4000, rt);
          }
          if (g.status === "roundEnd") {
            if (timerR.current) clearInterval(timerR.current);
            snd.roundEnd();
            setScreen("roundResult");
          }
          if (g.status === "gameOver") {
            if (timerR.current) clearInterval(timerR.current);
            snd.gameOver();
            setScreen("gameOver");
          }
        }

        // Initial state on first poll
        if (!prevStatus) {
          if (g.status === "lobby") setScreen("lobby");
          else if (g.status === "countdown") triggerCD(g.roundStartTime || Date.now() + 4000, rt);
          else if (g.status === "playing") {
            setScreen("playing");
            startTimer(g.roundStartTime || Date.now(), rt);
          }
          else if (g.status === "roundEnd") setScreen("roundResult");
          else if (g.status === "gameOver") setScreen("gameOver");
        }
      } catch (e) {
        console.error("Poll error:", e);
      }
    };

    poll();
    pollR.current = setInterval(poll, POLL_MS);
    return () => {
      if (pollR.current) clearInterval(pollR.current);
    };
  }, [code, pid, triggerCD, startTimer, snd]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerR.current) clearInterval(timerR.current);
    };
  }, []);

  // GM actions
  const startRound = async () => {
    try {
      await fetch(`/api/game/${code}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: pid, action: "startRound" }),
      });
    } catch (e) {
      console.error("Start round error:", e);
    }
  };

  const endRound = async () => {
    if (timerR.current) clearInterval(timerR.current);
    try {
      await fetch(`/api/game/${code}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: pid, action: "endRound" }),
      });
    } catch (e) {
      console.error("End round error:", e);
    }
  };

  // Submit guess
  const submitGuess = useCallback(async () => {
    if (solved || timeLeft <= 0 || guesses.length >= MAX_GUESSES) return;
    if (input.length !== 3) return;
    const g = (firstLetter + input).toUpperCase();
    if (!VALID_WORDS.has(g)) {
      setShake(true);
      setErr("Not a valid word!");
      snd.wrong();
      setTimeout(() => {
        setShake(false);
        setErr("");
      }, 600);
      setInput("");
      return;
    }
    const fb = getFeedback(g, answer);
    const ng = [...guesses, g];
    const nf = [...fbs, fb];
    setGuesses(ng);
    setFbs(nf);
    setInput("");
    gcR.current = ng.length;

    if (g === answer) {
      setSolved(true);
      solvedR.current = true;
      setFlash("green");
      snd.correct();
      setTimeout(() => setFlash(""), 800);
      await submitScore(SCORE_MAP[ng.length] || 10);
    } else if (ng.length >= MAX_GUESSES) {
      roundEndedR.current = true;
      snd.wrong();
      await submitScore(0);
    }
  }, [input, guesses, fbs, solved, timeLeft, firstLetter, answer, submitScore, snd]);

  // Build round scores map
  const rsMap: Record<string, number> = {};
  if (rd?.results) {
    Object.entries(rd.results).forEach(([id, r]) => {
      rsMap[id] = r.score;
    });
  }

  const card = {
    background: C.c1,
    border: `1px solid ${C.bdr}`,
    borderRadius: 16,
    padding: 28,
    width: "100%",
    maxWidth: 480,
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
      {/* Header */}
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
        <div
          style={{
            fontSize: 11,
            color: C.txtM,
            marginTop: 4,
            letterSpacing: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <span>
            CODE:{" "}
            <span style={{ color: C.gold, fontWeight: 800 }}>{code}</span>
          </span>
          <button
            onClick={snd.toggle}
            style={{
              background: "none",
              border: `1px solid ${C.bdr}`,
              borderRadius: 6,
              padding: "2px 6px",
              cursor: "pointer",
              fontSize: 14,
              lineHeight: 1,
            }}
            title={snd.muted ? "Unmute" : "Mute"}
          >
            {snd.muted ? "\uD83D\uDD07" : "\uD83D\uDD0A"}
          </button>
        </div>
      </div>

      {/* LOBBY */}
      {screen === "lobby" && (
        <div className="animate-pop-in" style={card}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div
              style={{
                fontSize: 11,
                color: C.txtM,
                letterSpacing: 1,
                marginBottom: 6,
              }}
            >
              SHARE THIS CODE
            </div>
            <div
              className="animate-glow"
              style={{
                display: "inline-block",
                background: C.c2,
                borderRadius: 12,
                padding: "12px 28px",
                fontFamily: "'Russo One', sans-serif",
                fontSize: 32,
                letterSpacing: 8,
                color: C.gold,
                border: `1px solid ${C.gold}30`,
              }}
            >
              {code}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 11,
                color: C.txtD,
                letterSpacing: 1,
                marginBottom: 10,
              }}
            >
              PLAYERS ({players.length})
            </div>
            {players.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 12px",
                  background: C.c2,
                  borderRadius: 8,
                  marginBottom: 4,
                  border:
                    p.id === pid
                      ? `1px solid ${C.gold}35`
                      : "1px solid transparent",
                }}
              >
                <span style={{ fontSize: 18 }}>
                  {i === 0 ? "👑" : "🎮"}
                </span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                {p.id === pid && (
                  <span
                    style={{
                      fontSize: 10,
                      color: C.gold,
                      marginLeft: "auto",
                    }}
                  >
                    YOU
                  </span>
                )}
              </div>
            ))}
          </div>
          {role === "gm" ? (
            <button
              style={btn(C.grn, players.length < 1)}
              onClick={startRound}
            >
              🚀 START ROUND 1
            </button>
          ) : (
            <div
              className="animate-pulse-text"
              style={{
                textAlign: "center",
                color: C.txtD,
                fontSize: 14,
              }}
            >
              Waiting for Game Master...
            </div>
          )}
        </div>
      )}

      {/* COUNTDOWN */}
      {screen === "countdown" && <CountdownOverlay num={cdNum} />}

      {/* PLAYING */}
      {screen === "playing" && (
        <div
          className="animate-pop-in"
          style={{
            ...card,
            maxWidth: 480,
            boxShadow:
              flash === "green" ? `0 0 40px ${C.grn}50` : undefined,
            transition: "box-shadow 0.5s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Russo One', sans-serif",
                fontSize: 13,
                color: C.gold,
                letterSpacing: 1,
              }}
            >
              ROUND {gs?.currentRound}/{TOTAL_ROUNDS}
            </span>
            <span
              className={timeLeft <= 5 ? "animate-pulse-text" : ""}
              style={{
                fontFamily: "'Russo One', sans-serif",
                fontSize: 20,
                color:
                  timeLeft <= 5 ? C.red : timeLeft <= 10 ? C.ylw : C.txt,
              }}
            >
              {timeLeft}s
            </span>
          </div>
          <TimerBar left={timeLeft} total={roundTime} />

          <GuessGrid
            guesses={guesses}
            feedbacks={fbs}
            input={input}
            firstLetter={firstLetter}
            solved={solved}
            timeLeft={timeLeft}
          />

          {!solved && timeLeft > 0 && guesses.length < MAX_GUESSES && (
            <GameInput
              firstLetter={firstLetter}
              input={input}
              setInput={setInput}
              onSubmit={submitGuess}
              error={err}
              shake={shake}
              guessCount={guesses.length}
            />
          )}

          {solved && (
            <div className="animate-pop-in" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32 }}>🎉</div>
              <div
                style={{
                  fontFamily: "'Russo One', sans-serif",
                  color: C.grn,
                  fontSize: 18,
                  marginTop: 4,
                }}
              >
                +{SCORE_MAP[guesses.length] || 10} POINTS
              </div>
              <div
                style={{ color: C.txtD, fontSize: 13, marginTop: 4 }}
              >
                Solved in {guesses.length} guess
                {guesses.length > 1 ? "es" : ""}!
              </div>
              {role === "gm" && (
                <button
                  style={{ ...btn(C.acc), marginTop: 16 }}
                  onClick={endRound}
                >
                  END ROUND →
                </button>
              )}
              {role !== "gm" && (
                <div
                  className="animate-pulse-text"
                  style={{
                    color: C.txtD,
                    fontSize: 13,
                    marginTop: 12,
                  }}
                >
                  Waiting for GM to end round...
                </div>
              )}
            </div>
          )}

          {(timeLeft <= 0 ||
            (guesses.length >= MAX_GUESSES && !solved)) &&
            !solved && (
              <div
                className="animate-pop-in"
                style={{ textAlign: "center" }}
              >
                <div style={{ fontSize: 32 }}>😅</div>
                <div
                  style={{
                    fontFamily: "'Russo One', sans-serif",
                    color: C.red,
                    fontSize: 14,
                    marginTop: 4,
                  }}
                >
                  {timeLeft <= 0 ? "TIME'S UP!" : "OUT OF GUESSES!"}
                </div>
                <div
                  style={{
                    color: C.ylw,
                    fontFamily: "'Russo One', sans-serif",
                    fontSize: 20,
                    marginTop: 8,
                  }}
                >
                  {answer}
                </div>
                {role === "gm" && (
                  <button
                    style={{ ...btn(C.acc), marginTop: 16 }}
                    onClick={endRound}
                  >
                    END ROUND →
                  </button>
                )}
                {role !== "gm" && (
                  <div
                    className="animate-pulse-text"
                    style={{
                      color: C.txtD,
                      fontSize: 13,
                      marginTop: 12,
                    }}
                  >
                    Waiting for GM to end round...
                  </div>
                )}
              </div>
            )}
        </div>
      )}

      {/* ROUND RESULT */}
      {screen === "roundResult" && (
        <div
          className="animate-pop-in"
          style={{ width: "100%", maxWidth: 480 }}
        >
          <div
            style={{
              ...card,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: C.txtM,
                letterSpacing: 1,
              }}
            >
              ROUND {gs?.currentRound} COMPLETE
            </div>
            <div
              style={{
                fontFamily: "'Russo One', sans-serif",
                fontSize: 22,
                color: C.ylw,
                margin: "8px 0",
              }}
            >
              The word was: {answer}
            </div>
          </div>
          <Leaderboard
            players={players}
            roundScores={rsMap}
            showRound
            myId={pid}
          />
          {role === "gm" &&
            gs &&
            gs.currentRound < TOTAL_ROUNDS && (
              <button
                style={{ ...btn(C.grn), marginTop: 16 }}
                onClick={startRound}
              >
                🚀 START ROUND {gs.currentRound + 1}
              </button>
            )}
          {role === "gm" &&
            gs &&
            gs.currentRound >= TOTAL_ROUNDS && (
              <button
                style={{ ...btn(C.gold), marginTop: 16 }}
                onClick={endRound}
              >
                🏆 SHOW FINAL RESULTS
              </button>
            )}
          {role !== "gm" && (
            <div
              className="animate-pulse-text"
              style={{
                textAlign: "center",
                color: C.txtD,
                fontSize: 14,
                marginTop: 16,
              }}
            >
              Waiting for Game Master...
            </div>
          )}
        </div>
      )}

      {/* GAME OVER */}
      {screen === "gameOver" && (
        <div
          className="animate-pop-in"
          style={{ width: "100%", maxWidth: 480 }}
        >
          <div
            style={{
              ...card,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 52 }}>🏆</div>
            <div
              style={{
                fontFamily: "'Russo One', sans-serif",
                fontSize: 24,
                color: C.gold,
                letterSpacing: 3,
                marginTop: 8,
              }}
            >
              GAME OVER
            </div>
            {players.length > 0 &&
              (() => {
                const w = [...players].sort(
                  (a, b) => b.totalScore - a.totalScore
                )[0];
                return (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 13, color: C.txtD }}>
                      Winner
                    </div>
                    <div
                      style={{
                        fontFamily: "'Russo One', sans-serif",
                        fontSize: 26,
                        color: C.gold,
                        marginTop: 4,
                      }}
                    >
                      {w.name}
                    </div>
                    <div style={{ fontSize: 16, color: C.ylw }}>
                      {w.totalScore} points
                    </div>
                  </div>
                );
              })()}
          </div>
          <Leaderboard
            players={players}
            showRound={false}
            myId={pid}
          />
          {role === "gm" && (
            <button
              style={{ ...btn(C.acc), marginTop: 16 }}
              onClick={() => router.push("/")}
            >
              🎮 NEW GAME
            </button>
          )}
        </div>
      )}

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
