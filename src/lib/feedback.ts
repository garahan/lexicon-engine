/**
 * Client-only micro-feedback: short Web Audio tones + haptics.
 * All calls are no-ops on the server or when the APIs are unavailable, so they
 * are safe to invoke from event handlers without guards everywhere.
 */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, durationMs: number, type: OscillatorType = "sine", gain = 0.06) {
  const ac = audio();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(ac.destination);
  const now = ac.currentTime;
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
  osc.start(now);
  osc.stop(now + durationMs / 1000);
}

export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  }
}

/** Rising two-note "ding" that climbs with the current combo level. */
export function playCorrect(comboLevel = 1) {
  const base = 520 + Math.min(comboLevel, 4) * 70;
  tone(base, 90, "sine", 0.05);
  setTimeout(() => tone(base * 1.5, 110, "sine", 0.05), 70);
  vibrate(12);
}

export function playWrong() {
  tone(180, 160, "sawtooth", 0.04);
  vibrate([10, 40, 10]);
}

export function playLevelUp() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 160, "triangle", 0.06), i * 90));
  vibrate([20, 30, 20, 30, 40]);
}

export function playComplete() {
  [659, 784, 988].forEach((f, i) => setTimeout(() => tone(f, 200, "sine", 0.06), i * 120));
  vibrate([15, 25, 15]);
}
