// Simple sound effect utilities using Web Audio API
// No external files needed

let audioContext: AudioContext | null = null;
let enabled = true;

interface WindowWithWebKitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

const getContext = (): AudioContext => {
  if (!audioContext) {
    const Ctx = window.AudioContext ?? (window as WindowWithWebKitAudio).webkitAudioContext;
    if (!Ctx) {
      throw new Error("Web Audio API not supported");
    }
    audioContext = new Ctx();
  }
  return audioContext;
};

const playTone = (frequency: number, duration: number, type: OscillatorType = "sine", volume: number = 0.15) => {
  if (!enabled) return;
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Web Audio not supported
  }
};

export const SoundEffects = {
  setEnabled: (val: boolean) => { enabled = val; },
  getEnabled: () => enabled,
  toggle: () => { enabled = !enabled; return enabled; },

  add: () => playTone(600, 0.12, "sine", 0.12),
  complete: () => {
    playTone(880, 0.1, "sine", 0.12);
    setTimeout(() => playTone(1100, 0.15, "sine", 0.1), 80);
  },
  uncomplete: () => playTone(440, 0.1, "sine", 0.1),
  delete: () => playTone(300, 0.15, "sawtooth", 0.08),
  edit: () => playTone(520, 0.08, "sine", 0.1),
  error: () => {
    playTone(200, 0.2, "square", 0.08);
    setTimeout(() => playTone(180, 0.25, "square", 0.08), 150);
  },
  clear: () => {
    playTone(400, 0.08, "sine", 0.1);
    setTimeout(() => playTone(300, 0.12, "sine", 0.08), 100);
  },
  celebrate: () => {
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, "sine", 0.1), i * 100);
    });
  },
  shortcut: () => playTone(700, 0.06, "sine", 0.08),
};
