/**
 * Web Audio API based chimes for restaurant orders and kitchen notifications.
 * Works without relying on external media files.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Play a welcoming kitchen order chime (two harmonic bells)
 */
export function playNewOrderSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Bell 1: 587.33 Hz (D5)
  playTone(ctx, 587.33, now, 0.35, 'triangle');
  // Bell 2: 880 Hz (A5)
  playTone(ctx, 880, now + 0.15, 0.5, 'sine');
  // Bell 3: 1174.66 Hz (D6)
  playTone(ctx, 1174.66, now + 0.3, 0.6, 'sine');
}

/**
 * Play an "order ready" chime for waiters / clients
 */
export function playOrderReadySound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  playTone(ctx, 523.25, now, 0.2, 'sine'); // C5
  playTone(ctx, 659.25, now + 0.1, 0.2, 'sine'); // E5
  playTone(ctx, 783.99, now + 0.2, 0.4, 'sine'); // G5
  playTone(ctx, 1046.50, now + 0.35, 0.6, 'triangle'); // C6
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine'
) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch {
    // Audio playback error caught safely
  }
}
