// Lightweight audio manager for study sounds using Web Audio API
// Generates continuous pink/brown noise and a soft synth pad.

export type StudyPreset = 'pink-noise' | 'brown-noise' | 'soft-pad';

class AudioManager {
  private static _instance: AudioManager | null = null;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentPreset: StudyPreset = 'pink-noise';
  private isPlaying = false;

  // Nodes for noise
  private noiseSource: AudioBufferSourceNode | null = null;

  // Nodes for pad
  private padGains: GainNode[] = [];
  private padOscs: OscillatorNode[] = [];
  private padFilter: BiquadFilterNode | null = null;

  static get instance() {
    if (!this._instance) this._instance = new AudioManager();
    return this._instance;
  }

  get audioContextState() {
    return this.ctx?.state ?? 'suspended';
  }

  setPreset(preset: StudyPreset) {
    this.currentPreset = preset;
    if (this.isPlaying) {
      this.stop(0.1);
      this.play(0.2);
    }
  }

  async ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.6;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  setVolume(vol: number) {
    if (this.masterGain) {
      const t = this.ctx!.currentTime;
      this.masterGain.gain.cancelScheduledValues(t);
      this.masterGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, vol)), t + 0.1);
    }
  }

  async play(fadeSeconds = 0.3) {
    await this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    // Guard: already playing
    if (this.isPlaying) return;

    // Reset master gain to 0 then fade in
    const t = this.ctx.currentTime;
    const target = this.masterGain.gain.value || 0.6;
    this.masterGain.gain.setValueAtTime(0.0001, t);

    if (this.currentPreset === 'pink-noise' || this.currentPreset === 'brown-noise') {
      this.startNoise(this.currentPreset);
    } else {
      this.startPad();
    }

    this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.05, target), t + fadeSeconds);
    this.isPlaying = true;

    // Media Session metadata (best-effort)
    try {
      // @ts-ignore
      if ('mediaSession' in navigator) {
        // @ts-ignore
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `Study Sounds – ${this.labelForPreset(this.currentPreset)}`,
          artist: 'Your Study App',
          album: 'Focus Collection',
        });
      }
    } catch {}
  }

  stop(fadeSeconds = 0.3) {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const endT = t + fadeSeconds;
    this.masterGain.gain.cancelScheduledValues(t);
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, endT);
    setTimeout(() => this.cleanupSources(), Math.max(10, fadeSeconds * 1000 + 10));
    this.isPlaying = false;
  }

  private cleanupSources() {
    try {
      if (this.noiseSource) {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
      }
    } catch {}
    this.noiseSource = null;

    this.padOscs.forEach((o) => {
      try { o.stop(); o.disconnect(); } catch {}
    });
    this.padGains.forEach((g) => {
      try { g.disconnect(); } catch {}
    });
    this.padOscs = [];
    this.padGains = [];
    if (this.padFilter) {
      try { this.padFilter.disconnect(); } catch {}
    }
    this.padFilter = null;
  }

  private createNoiseBuffer(type: 'pink' | 'brown'): AudioBuffer {
    const ctx = this.ctx!;
    const length = ctx.sampleRate * 2; // 2 seconds
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'pink') {
      // Voss-McCartney pink noise approximation
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        data[i] = pink * 0.11; // normalize
      }
    } else {
      // Brownian noise
      let lastOut = 0.0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        const brown = (lastOut + 0.02 * white) / 1.02;
        lastOut = brown;
        data[i] = brown * 3.5; // normalize
      }
    }

    return buffer;
  }

  private startNoise(preset: StudyPreset) {
    if (!this.ctx || !this.masterGain) return;
    const type = preset === 'pink-noise' ? 'pink' : 'brown';
    const buffer = this.createNoiseBuffer(type as any);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    // Gentle lowpass to smooth top end
    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = type === 'pink' ? 6000 : 3000;

    src.connect(lpf).connect(this.masterGain);
    src.start();
    this.noiseSource = src;
  }

  private startPad() {
    if (!this.ctx || !this.masterGain) return;

    // Build a simple ambient pad: 3 oscillators in a chord through a lowpass filter
    const baseFreq = 220; // A3
    const freqs = [baseFreq, baseFreq * 5/4, baseFreq * 3/2]; // A major-ish

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.7;
    filter.connect(this.masterGain);
    this.padFilter = filter;

    freqs.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f;

      const gain = this.ctx!.createGain();
      gain.gain.value = 0.0;

      // Slow attack and slight LFO via periodic detune sweep
      const now = this.ctx!.currentTime;
      gain.gain.linearRampToValueAtTime(0.15, now + 2.5 + i * 0.2);

      // Slow gentle filter sweep
      filter.frequency.cancelScheduledValues(now);
      filter.frequency.linearRampToValueAtTime(1500, now + 8);
      filter.frequency.linearRampToValueAtTime(900, now + 16);

      osc.connect(gain).connect(filter);
      osc.start();

      this.padOscs.push(osc);
      this.padGains.push(gain);
    });
  }

  labelForPreset(p: StudyPreset) {
    switch (p) {
      case 'pink-noise': return 'Pink Noise';
      case 'brown-noise': return 'Brown Noise';
      case 'soft-pad': return 'Soft Pad';
    }
  }
}

export default AudioManager;
