// Lightweight audio manager for study sounds using Web Audio API
// Generates continuous pink/brown noise and a soft synth pad.

export type StudyPreset = 
  | 'pink-noise' | 'brown-noise' | 'white-noise' | 'violet-noise' | 'blue-noise' | 'gray-noise'
  | 'binaural-alpha' | 'binaural-theta'
  | 'rain-simulation' | 'ocean-waves' | 'forest-ambience' | 'crickets'
  | 'soft-pad' | 'sine-drone' | 'wind-chimes' | 'breathing-rhythm';

export interface SoundCategory {
  id: string;
  name: string;
  presets: StudyPreset[];
}

export const SOUND_CATEGORIES: SoundCategory[] = [
  {
    id: 'noise-therapy',
    name: 'Noise Therapy',
    presets: ['pink-noise', 'brown-noise', 'white-noise', 'violet-noise', 'blue-noise', 'gray-noise']
  },
  {
    id: 'binaural-focus',
    name: 'Binaural Focus',
    presets: ['binaural-alpha', 'binaural-theta']
  },
  {
    id: 'nature-sounds',
    name: 'Nature Sounds',
    presets: ['rain-simulation', 'ocean-waves', 'forest-ambience', 'crickets']
  },
  {
    id: 'ambient-tones',
    name: 'Ambient Tones',
    presets: ['soft-pad', 'sine-drone', 'wind-chimes', 'breathing-rhythm']
  }
];

class AudioManager {
  private static _instance: AudioManager | null = null;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentPreset: StudyPreset = 'pink-noise';
  private isPlaying = false;

  // Generic nodes for all sound types
  private sources: (AudioBufferSourceNode | OscillatorNode)[] = [];
  private gains: GainNode[] = [];
  private filters: (BiquadFilterNode | DelayNode)[] = [];
  private lfoOscs: OscillatorNode[] = [];

  static get instance() {
    if (!this._instance) this._instance = new AudioManager();
    return this._instance;
  }

  get audioContextState() {
    return this.ctx?.state ?? 'suspended';
  }

  setPreset(preset: StudyPreset) {
    this.currentPreset = preset;
    // Only restart if already playing - let the UI handle transitions
    if (this.isPlaying) {
      this.cleanupSources();
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

    // Ensure clean state before starting
    this.cleanupSources();

    // Reset master gain to 0 then fade in
    const t = this.ctx.currentTime;
    const target = this.masterGain.gain.value || 0.6;
    this.masterGain.gain.setValueAtTime(0.0001, t);

    this.startPreset(this.currentPreset);

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
    [...this.sources, ...this.lfoOscs].forEach((node) => {
      try { 
        if ('stop' in node) node.stop();
        node.disconnect(); 
      } catch {}
    });
    [...this.gains, ...this.filters].forEach((node) => {
      try { node.disconnect(); } catch {}
    });
    this.sources = [];
    this.gains = [];
    this.filters = [];
    this.lfoOscs = [];
  }

  private createNoiseBuffer(type: 'pink' | 'brown' | 'white' | 'violet' | 'blue' | 'gray'): AudioBuffer {
    const ctx = this.ctx!;
    const length = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }
    } else if (type === 'pink') {
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
        data[i] = pink * 0.11;
      }
    } else if (type === 'brown') {
      let lastOut = 0.0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        const brown = (lastOut + 0.02 * white) / 1.02;
        lastOut = brown;
        data[i] = brown * 3.5;
      }
    } else if (type === 'violet') {
      let lastOut = 0.0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        const violet = white - lastOut;
        lastOut = white;
        data[i] = violet * 0.5;
      }
    } else if (type === 'blue') {
      let lastOut = 0.0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        const blue = (white + lastOut) * 0.5;
        lastOut = white;
        data[i] = blue * 0.7;
      }
    } else if (type === 'gray') {
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        const freq = (i / length) * (ctx.sampleRate / 2);
        const weight = 1 / Math.sqrt(freq + 1);
        data[i] = white * weight * 0.4;
      }
    }

    return buffer;
  }

  private startPreset(preset: StudyPreset) {
    if (!this.ctx || !this.masterGain) return;

    const noiseTypes = ['pink-noise', 'brown-noise', 'white-noise', 'violet-noise', 'blue-noise', 'gray-noise'];
    const binauralTypes = ['binaural-alpha', 'binaural-theta'];
    const natureTypes = ['rain-simulation', 'ocean-waves', 'forest-ambience', 'crickets'];
    const ambientTypes = ['soft-pad', 'sine-drone', 'wind-chimes', 'breathing-rhythm'];

    if (noiseTypes.includes(preset)) {
      this.startNoise(preset as any);
    } else if (binauralTypes.includes(preset)) {
      this.startBinaural(preset);
    } else if (natureTypes.includes(preset)) {
      this.startNature(preset);
    } else if (ambientTypes.includes(preset)) {
      this.startAmbient(preset);
    }
  }

  private startNoise(preset: StudyPreset) {
    const typeMap: Record<string, string> = {
      'pink-noise': 'pink', 'brown-noise': 'brown', 'white-noise': 'white',
      'violet-noise': 'violet', 'blue-noise': 'blue', 'gray-noise': 'gray'
    };
    const type = typeMap[preset];
    const buffer = this.createNoiseBuffer(type as any);
    const src = this.ctx!.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const lpf = this.ctx!.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = type === 'pink' ? 6000 : type === 'white' ? 8000 : 3000;

    src.connect(lpf).connect(this.masterGain!);
    src.start();
    this.sources.push(src);
    this.filters.push(lpf);
  }

  private startBinaural(preset: StudyPreset) {
    const baseFreq = 200;
    const beatFreq = preset === 'binaural-alpha' ? 10 : 6;
    
    ['left', 'right'].forEach((channel, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = baseFreq + (i === 0 ? 0 : beatFreq);
      
      const gain = this.ctx!.createGain();
      gain.gain.value = 0.3;
      
      const panner = this.ctx!.createStereoPanner();
      panner.pan.value = i === 0 ? -1 : 1;
      
      osc.connect(gain).connect(panner).connect(this.masterGain!);
      osc.start();
      this.sources.push(osc);
      this.gains.push(gain);
    });
  }

  private startNature(preset: StudyPreset) {
    if (preset === 'rain-simulation') {
      // Multiple noise sources with different filtering for rain effect
      for (let i = 0; i < 3; i++) {
        const src = this.ctx!.createBufferSource();
        src.buffer = this.createNoiseBuffer('white');
        src.loop = true;
        
        const hpf = this.ctx!.createBiquadFilter();
        hpf.type = 'highpass';
        hpf.frequency.value = 800 + i * 400;
        
        const gain = this.ctx!.createGain();
        gain.gain.value = 0.1 * (1 - i * 0.2);
        
        src.connect(hpf).connect(gain).connect(this.masterGain!);
        src.start();
        this.sources.push(src);
        this.filters.push(hpf);
        this.gains.push(gain);
      }
    } else if (preset === 'ocean-waves') {
      const src = this.ctx!.createBufferSource();
      src.buffer = this.createNoiseBuffer('brown');
      src.loop = true;
      
      const lpf = this.ctx!.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = 800;
      
      const lfo = this.ctx!.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.3;
      
      const lfoGain = this.ctx!.createGain();
      lfoGain.gain.value = 200;
      
      lfo.connect(lfoGain).connect(lpf.frequency);
      lfo.start();
      
      src.connect(lpf).connect(this.masterGain!);
      src.start();
      this.sources.push(src);
      this.filters.push(lpf);
      this.lfoOscs.push(lfo);
      this.gains.push(lfoGain);
    } else if (preset === 'forest-ambience') {
      const src = this.ctx!.createBufferSource();
      src.buffer = this.createNoiseBuffer('brown');
      src.loop = true;
      
      const bpf = this.ctx!.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.value = 1200;
      bpf.Q.value = 2;
      
      src.connect(bpf).connect(this.masterGain!);
      src.start();
      this.sources.push(src);
      this.filters.push(bpf);
    } else if (preset === 'crickets') {
      for (let i = 0; i < 5; i++) {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = 2000 + Math.random() * 1000;
        
        const gain = this.ctx!.createGain();
        gain.gain.value = 0;
        
        const now = this.ctx!.currentTime;
        const interval = 1 + Math.random() * 2;
        this.scheduleCricketChirp(gain, now, interval);
        
        osc.connect(gain).connect(this.masterGain!);
        osc.start();
        this.sources.push(osc);
        this.gains.push(gain);
      }
    }
  }

  private scheduleCricketChirp(gain: GainNode, startTime: number, interval: number) {
    const chirpDuration = 0.1;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.05, startTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, startTime + chirpDuration);
    
    setTimeout(() => {
      if (this.isPlaying) {
        this.scheduleCricketChirp(gain, this.ctx!.currentTime + interval, interval);
      }
    }, interval * 1000);
  }

  private startAmbient(preset: StudyPreset) {
    if (preset === 'soft-pad') {
      const baseFreq = 220;
      const freqs = [baseFreq, baseFreq * 5/4, baseFreq * 3/2];
      
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200;
      filter.Q.value = 0.7;
      filter.connect(this.masterGain!);
      this.filters.push(filter);
      
      freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.value = f;
        
        const gain = this.ctx!.createGain();
        gain.gain.value = 0.0;
        
        const now = this.ctx!.currentTime;
        gain.gain.linearRampToValueAtTime(0.15, now + 2.5 + i * 0.2);
        
        osc.connect(gain).connect(filter);
        osc.start();
        
        this.sources.push(osc);
        this.gains.push(gain);
      });
    } else if (preset === 'sine-drone') {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 110;
      
      const gain = this.ctx!.createGain();
      gain.gain.value = 0.4;
      
      osc.connect(gain).connect(this.masterGain!);
      osc.start();
      this.sources.push(osc);
      this.gains.push(gain);
    } else if (preset === 'wind-chimes') {
      const frequencies = [523, 659, 784, 880, 1047];
      frequencies.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const gain = this.ctx!.createGain();
        gain.gain.value = 0;
        
        const now = this.ctx!.currentTime;
        this.scheduleChime(gain, now + i * 2, 3 + Math.random() * 4);
        
        osc.connect(gain).connect(this.masterGain!);
        osc.start();
        this.sources.push(osc);
        this.gains.push(gain);
      });
    } else if (preset === 'breathing-rhythm') {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 200;
      
      const gain = this.ctx!.createGain();
      gain.gain.value = 0;
      
      const lfo = this.ctx!.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.2; // 12 breaths per minute
      
      const lfoGain = this.ctx!.createGain();
      lfoGain.gain.value = 0.2;
      
      lfo.connect(lfoGain).connect(gain.gain);
      lfo.start();
      
      osc.connect(gain).connect(this.masterGain!);
      osc.start();
      this.sources.push(osc);
      this.gains.push(gain);
      this.lfoOscs.push(lfo);
    }
  }

  private scheduleChime(gain: GainNode, startTime: number, interval: number) {
    const chimeDuration = 2;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + chimeDuration);
    
    setTimeout(() => {
      if (this.isPlaying) {
        this.scheduleChime(gain, this.ctx!.currentTime + interval, interval);
      }
    }, interval * 1000);
  }


  labelForPreset(p: StudyPreset) {
    const labels: Record<StudyPreset, string> = {
      'pink-noise': 'Pink Noise',
      'brown-noise': 'Brown Noise',
      'white-noise': 'White Noise',
      'violet-noise': 'Violet Noise',
      'blue-noise': 'Blue Noise',
      'gray-noise': 'Gray Noise',
      'binaural-alpha': 'Alpha Waves (10Hz)',
      'binaural-theta': 'Theta Waves (6Hz)',
      'rain-simulation': 'Rain Simulation',
      'ocean-waves': 'Ocean Waves',
      'forest-ambience': 'Forest Ambience',
      'crickets': 'Crickets',
      'soft-pad': 'Soft Pad',
      'sine-drone': 'Sine Drone',
      'wind-chimes': 'Wind Chimes',
      'breathing-rhythm': 'Breathing Rhythm'
    };
    return labels[p];
  }
}

export default AudioManager;
