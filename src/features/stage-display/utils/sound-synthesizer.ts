/**
 * Web Audio API synthesizer for stage sound effects.
 * Synthesizes suspense drumrolls, reveal chimes, and victory fanfares
 * completely client-side without external audio assets or network latency.
 */

let globalAudioCtx: AudioContext | null = null;
let isMutedState = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  if (!globalAudioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
    }
  }

  return globalAudioCtx;
}

export function isAudioSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext,
  );
}

export async function initAudio(): Promise<boolean> {
  const ctx = getAudioContext();
  if (!ctx) return false;

  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return false;
    }
  }

  return ctx.state === "running";
}

export function setAudioMuted(muted: boolean): void {
  isMutedState = muted;
}

export function getAudioMuted(): boolean {
  return isMutedState;
}

/**
 * Play a low-frequency suspense/tension drone to build anticipation before a reveal.
 */
export function playTensionDrone(durationMs = 1500): void {
  if (isMutedState) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== "running") return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(65.41, now); // C2 low drone
  osc.frequency.exponentialRampToValueAtTime(73.42, now + durationMs / 1000); // D2 rising tension

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + durationMs / 1000);
}

/**
 * Play a bright crystal chime/gong for runner-up rank reveals.
 */
export function playRevealChime(): void {
  if (isMutedState) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== "running") return;

  const now = ctx.currentTime;
  const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chime chord

  for (const [index, freq] of frequencies.entries()) {
    if (!ctx) break;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + index * 0.04);

    gain.gain.setValueAtTime(0.001, now + index * 0.04);
    gain.gain.linearRampToValueAtTime(0.15, now + index * 0.04 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.04 + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + index * 0.04);
    osc.stop(now + index * 0.04 + 1.25);
  }
}

/**
 * Play a triumphant fanfare chord progression when the Champion / Title Winner is crowned.
 */
export function playVictoryFanfare(): void {
  if (isMutedState) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== "running") return;

  const now = ctx.currentTime;

  // Staggered triumphant fanfare notes: G4 -> C5 -> E5 -> G5 (held chord)
  const notes = [
    { freq: 392.0, time: 0.0, dur: 0.2 },
    { freq: 523.25, time: 0.2, dur: 0.2 },
    { freq: 659.25, time: 0.4, dur: 0.25 },
    { freq: 783.99, time: 0.65, dur: 1.8 },
    { freq: 1046.5, time: 0.65, dur: 1.8 }, // C6 octave overlay
  ];

  for (const { freq, time, dur } of notes) {
    if (!ctx) break;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + time);

    gain.gain.setValueAtTime(0.001, now + time);
    gain.gain.linearRampToValueAtTime(0.2, now + time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + time);
    osc.stop(now + time + dur);
  }
}
