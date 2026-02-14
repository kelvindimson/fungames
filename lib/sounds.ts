// Procedural game sounds using Web Audio API — no files needed

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function play(
  freq: number,
  type: OscillatorType,
  dur: number,
  vol = 0.3,
  delay = 0
) {
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, c.currentTime + delay);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(c.currentTime + delay);
  o.stop(c.currentTime + delay + dur);
}

export const Sound = {
  /** Countdown tick (3, 2, 1) */
  tick() {
    play(800, "sine", 0.1, 0.2);
  },

  /** Countdown GO! */
  go() {
    play(1200, "sine", 0.15, 0.3);
    play(1600, "sine", 0.2, 0.3, 0.1);
  },

  /** Correct guess — ascending chime */
  correct() {
    play(523, "sine", 0.15, 0.25);
    play(659, "sine", 0.15, 0.25, 0.1);
    play(784, "sine", 0.25, 0.3, 0.2);
  },

  /** Wrong guess — short buzz */
  wrong() {
    play(200, "square", 0.15, 0.15);
  },

  /** Key press — subtle click */
  key() {
    play(1400, "sine", 0.04, 0.08);
  },

  /** Timer warning — last 5 seconds pulse */
  warn() {
    play(440, "triangle", 0.1, 0.15);
  },

  /** Round end — descending notes */
  roundEnd() {
    play(784, "sine", 0.15, 0.2);
    play(659, "sine", 0.15, 0.2, 0.15);
    play(523, "sine", 0.3, 0.25, 0.3);
  },

  /** Game over — fanfare */
  gameOver() {
    play(523, "sine", 0.12, 0.25);
    play(659, "sine", 0.12, 0.25, 0.12);
    play(784, "sine", 0.12, 0.25, 0.24);
    play(1047, "sine", 0.4, 0.3, 0.36);
  },
};
