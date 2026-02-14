"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Sound } from "./sounds";

export function useSound() {
  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("lingo-muted") === "1";
  });

  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const toggle = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      sessionStorage.setItem("lingo-muted", next ? "1" : "0");
      return next;
    });
  }, []);

  const s = useCallback((fn: () => void) => {
    if (!mutedRef.current) fn();
  }, []);

  return {
    muted,
    toggle,
    tick: useCallback(() => s(Sound.tick), [s]),
    go: useCallback(() => s(Sound.go), [s]),
    correct: useCallback(() => s(Sound.correct), [s]),
    wrong: useCallback(() => s(Sound.wrong), [s]),
    key: useCallback(() => s(Sound.key), [s]),
    warn: useCallback(() => s(Sound.warn), [s]),
    roundEnd: useCallback(() => s(Sound.roundEnd), [s]),
    gameOver: useCallback(() => s(Sound.gameOver), [s]),
  };
}
