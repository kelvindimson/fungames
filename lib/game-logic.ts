import { ulid } from "ulid";

import { ANSWER_WORDS } from "./words";

export const TOTAL_ROUNDS = 8;
export const MAX_GUESSES = 6;
export const ROUND_TIME = 30;
export const POLL_MS = 1500;
export const SCORE_MAP: Record<number, number> = {
  1: 100,
  2: 80,
  3: 60,
  4: 40,
  5: 20,
  6: 10,
};

export function getFeedback(guess: string, answer: string): number[] {
  const r = [0, 0, 0, 0]; // 0=absent, 1=present, 2=correct
  const a = [...answer];
  const g = [...guess.toUpperCase()];
  for (let i = 0; i < 4; i++) {
    if (g[i] === a[i]) {
      r[i] = 2;
      a[i] = "";
      g[i] = "";
    }
  }
  for (let i = 0; i < 4; i++) {
    if (g[i] && a.includes(g[i])) {
      r[i] = 1;
      a[a.indexOf(g[i])] = "";
    }
  }
  return r;
}

export function obfuscate(word: string): string {
  return btoa(word).split("").reverse().join("");
}

export function deobfuscate(encoded: string): string {
  try {
    return atob(encoded.split("").reverse().join(""));
  } catch {
    return "";
  }
}

export function pickWords(n: number): string[] {
  const shuffled = [...ANSWER_WORDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export function generatePlayerId(): string {
  return ulid();
}
