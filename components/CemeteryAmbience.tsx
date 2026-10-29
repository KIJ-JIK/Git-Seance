'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Professional Creepy Cemetery Audio Track Engine
 * 
 * Features:
 * - Shivering ghost wind with dynamic howling gusts (no leaves crackle)
 * - Haunted iron gate creak
 * - Deep inharmonic crypt chimes / church bells
 * - Authentic synthesized distant wolf howl in the middle
 * - Eerie chain rattles and hollow echoes
 * - Automatic audio ducking when ghost speaks
 */
export default function CemeteryAmbience() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const sfxGainRef = useRef<GainNode | null>(null);
  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scheduledTimersRef = useRef<NodeJS.Timeout[]>([]);
  const hasStartedRef = useRef(false);
  const activeVoiceSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize or resume audio system
  const initAudio = async () => {
    if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
      setIsPlaying(true);
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      audioCtxRef.current = ctx;

      // Master output node
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(1.0, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Dedicated Ambient Track Gain (boosted to 0.45 for clear audible presence)
      const ambientGain = ctx.createGain();
      ambientGain.gain.setValueAtTime(0.45, ctx.currentTime);
      ambientGain.connect(masterGain);
      ambientGainRef.current = ambientGain;

      // Dedicated SFX Sound Cue Gain (prominent & crisp: 0.85)
      const sfxGain = ctx.createGain();
      sfxGain.gain.setValueAtTime(0.85, ctx.currentTime);
      sfxGain.connect(masterGain);
      sfxGainRef.current = sfxGain;

      // Start the atmospheric creepy graveyard composition
      startAtmosphericComposition(ctx, ambientGain);

      setIsPlaying(true);
      hasStartedRef.current = true;
    } catch (e) {
      console.warn('Audio auto-start waiting for interaction:', e);
    }
  };

  /**
   * Continuous atmospheric creepy graveyard timeline (120 seconds seamless loop)
   */
  const startAtmosphericComposition = (ctx: AudioContext, ambientDest: GainNode) => {
    // Clear any previous timers
    scheduledTimersRef.current.forEach((t) => clearTimeout(t));
    scheduledTimersRef.current = [];
    if (loopTimerRef.current) clearTimeout(loopTimerRef.current);

    // Continuous Evolving Ghostly Wind Bed
    startEvolvingWindBed(ctx, ambientDest);

    // Schedule the eerie graveyard sound events
    const timeline = [
      { time: 2500, action: () => playGhostWindShiver(ctx, ambientDest, 0.55) },
      { time: 14000, action: () => playGateCreak(ctx, ambientDest) },
      { time: 26000, action: () => playCryptBell(ctx, ambientDest, 110, 0.7) },
      { time: 38000, action: () => playGhostWindShiver(ctx, ambientDest, 0.6) },
      { time: 52000, action: () => playWolfHowl(ctx, ambientDest, 0.45) }, // Wolf howl in the middle
      { time: 68000, action: () => playChainsRattle(ctx, ambientDest, 0.6) },
      { time: 80000, action: () => playCryptBell(ctx, ambientDest, 146.83, 0.7) },
      { time: 94000, action: () => playGateCreak(ctx, ambientDest) },
      { time: 104000, action: () => playWolfHowl(ctx, ambientDest, 0.35) }, // Distant echo wolf response
      { time: 114000, action: () => playGhostWindShiver(ctx, ambientDest, 0.5) },
    ];

    timeline.forEach((event) => {
      const timer = setTimeout(() => {
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
          event.action();
        }
      }, event.time);
      scheduledTimersRef.current.push(timer);
    });

    // Seamless loop every 120,000 ms
    loopTimerRef.current = setTimeout(() => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        startAtmosphericComposition(ctx, ambientDest);
      }
    }, 120000);
  };

  /**
   * Continuous Ghostly Wind Bed (Deep howling resonance)
   */
  const startEvolvingWindBed = (ctx: AudioContext, dest: GainNode) => {
    const bufferSize = ctx.sampleRate * 8;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 1.8;
    }

    const windSrc = ctx.createBufferSource();
    windSrc.buffer = noiseBuffer;
    windSrc.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(360, ctx.currentTime);

    // Slow breathing LFO for rolling gusts
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.05, ctx.currentTime);
    lfoGain.gain.setValueAtTime(180, ctx.currentTime);
    lfo.connect(filter.frequency);
    lfo.start();

    const bedGain = ctx.createGain();
    bedGain.gain.setValueAtTime(0.7, ctx.currentTime);

    windSrc.connect(filter);
    filter.connect(bedGain);
    bedGain.connect(dest);
    windSrc.start();
  };

  // ── SOUND FX BUILDERS ──

  // 1. Shivering Ghost Wind (Eerie swept bandpass with shivering tremolo)
  const playGhostWindShiver = (ctx: AudioContext, dest: GainNode, volume = 0.5) => {
    const now = ctx.currentTime;
    const dur = 4.5;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const ch = buffer.getChannelData(0);
    for (let i = 0; i < ch.length; i++) {
      ch[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;

    // Dual resonant bandpass filter for howling wind tone
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(280, now);
    filter.frequency.exponentialRampToValueAtTime(850, now + 1.8);
    filter.frequency.exponentialRampToValueAtTime(240, now + dur);
    filter.Q.setValueAtTime(6.0, now);

    // Shivering tremolo LFO (5.5 Hz shivering wind effect)
    const shiverLfo = ctx.createOscillator();
    const shiverGain = ctx.createGain();
    shiverLfo.frequency.setValueAtTime(5.5, now);
    shiverGain.gain.setValueAtTime(volume * 0.4, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    shiverLfo.connect(gain.gain);
    shiverLfo.start(now);
    shiverLfo.stop(now + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    src.start(now);
    src.stop(now + dur);
  };

  // 2. Distant Eerie Wolf Howl (280Hz -> 560Hz -> 220Hz with vibrato & formant filter)
  const playWolfHowl = (ctx: AudioContext, dest: GainNode, volume = 0.4) => {
    const now = ctx.currentTime;
    const dur = 5.2;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';

    // Pitch envelope: climbs mournfully then slowly falls
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(560, now + 1.6);
    osc.frequency.setValueAtTime(560, now + 2.5);
    osc.frequency.exponentialRampToValueAtTime(220, now + dur);

    // Subtle natural vibrato on howl
    const vibLfo = ctx.createOscillator();
    const vibGain = ctx.createGain();
    vibLfo.frequency.setValueAtTime(4.8, now);
    vibGain.gain.setValueAtTime(14, now); // +/- 14Hz pitch modulation
    vibLfo.connect(osc.frequency);
    vibLfo.start(now);
    vibLfo.stop(now + dur);

    // Formant filter (simulates hollow vocal tract / wolf throat)
    const formant = ctx.createBiquadFilter();
    formant.type = 'bandpass';
    formant.frequency.setValueAtTime(720, now);
    formant.frequency.exponentialRampToValueAtTime(850, now + 2.0);
    formant.frequency.exponentialRampToValueAtTime(620, now + dur);
    formant.Q.setValueAtTime(5.0, now);

    // Distant lowpass smoothing
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1600, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 1.2);
    gain.gain.setValueAtTime(volume * 0.9, now + 2.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(formant);
    formant.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + dur);
  };

  // 3. Ancient Haunted Iron Gate Creak
  const playGateCreak = (ctx: AudioContext, dest: GainNode) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(270, now + 0.8);
    osc.frequency.linearRampToValueAtTime(130, now + 1.8);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(390, now);
    filter.Q.setValueAtTime(8.5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 2.0);
  };

  // 4. Distant Crypt Bell / Church Chime (Rich inharmonic bell resonance)
  const playCryptBell = (ctx: AudioContext, dest: GainNode, fundamental = 146.83, volume = 0.35) => {
    const now = ctx.currentTime;
    // Bell harmonic ratios: 1x, 2.76x, 4.07x
    const partials = [
      { ratio: 1.0, gainMult: 0.6, decay: 5.0 },
      { ratio: 2.76, gainMult: 0.3, decay: 3.5 },
      { ratio: 4.07, gainMult: 0.15, decay: 2.2 },
    ];

    partials.forEach(({ ratio, gainMult, decay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * ratio, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume * gainMult, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + decay + 0.1);
    });
  };

  // 5. Chains Stir / Clinks
  const playChainsRattle = (ctx: AudioContext, dest: GainNode, volume = 0.25) => {
    const now = ctx.currentTime;
    const clinks = 4;
    for (let i = 0; i < clinks; i++) {
      const t = now + i * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600 + Math.random() * 600, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(volume, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.15);
    }
  };

  // 6. Bat Wings Fluttering
  const playBatFlutter = (ctx: AudioContext, dest: GainNode, volume = 0.3) => {
    const now = ctx.currentTime;
    const flaps = 6;
    for (let i = 0; i < flaps; i++) {
      const t = now + i * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 40, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.05);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(volume, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.06);
    }
  };

  // 7. Terminal Cold Wind Cue
  const playTerminalWindCue = (ctx: AudioContext, dest: GainNode) => {
    playGhostWindShiver(ctx, dest, 0.6);
  };

  // Expose global controller for sound cues and ducking
  useEffect(() => {
    // 1. Play dramatic sound cue from terminal clause (e.g. "A cold wind passes...")
    (window as any).__playCemeterySoundCue = async (cueDescription: string) => {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        await initAudio();
      }
      if (!audioCtxRef.current || !sfxGainRef.current) return;
      const ctx = audioCtxRef.current;
      const dest = sfxGainRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const lower = cueDescription.toLowerCase();
      if (lower.includes('wind') || lower.includes('chill') || lower.includes('cold') || lower.includes('breeze') || lower.includes('shiver') || lower.includes('echo')) {
        playTerminalWindCue(ctx, dest);
      } else if (lower.includes('chain') || lower.includes('rattle') || lower.includes('clink')) {
        playChainsRattle(ctx, dest, 0.45);
      } else if (lower.includes('bat') || lower.includes('flutter')) {
        playBatFlutter(ctx, dest, 0.45);
      } else {
        playCryptBell(ctx, dest, 185, 0.45);
      }
    };

    // 2. Duck background ambience when ghost speaks so voice is 100% intelligible
    (window as any).__setAmbientDucking = (isSpeaking: boolean) => {
      if (!audioCtxRef.current || !ambientGainRef.current) return;
      const ctx = audioCtxRef.current;
      const gain = ambientGainRef.current.gain;
      const now = ctx.currentTime;
      gain.cancelScheduledValues(now);
      if (isSpeaking) {
        // Duck ambient down to 0.08 during voice speech
        gain.linearRampToValueAtTime(0.08, now + 0.3);
      } else {
        // Restore ambient back to 0.45 after speech
        gain.linearRampToValueAtTime(0.45, now + 1.2);
      }
    };

    // 3. Play ghost speech audio stream through the active Web Audio context
    (window as any).__playGhostVoiceAudio = async (
      arrayBuffer: ArrayBuffer,
      onEnded?: () => void
    ): Promise<boolean> => {
      try {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          await initAudio();
        }
        if (!audioCtxRef.current) return false;
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          await ctx.resume().catch(() => {});
        }

        // Stop any currently playing voice
        if (activeVoiceSourceRef.current) {
          try {
            activeVoiceSourceRef.current.stop();
          } catch {}
          activeVoiceSourceRef.current = null;
        }

        // Native Web Audio MP3 decoder
        const decodedBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
        const source = ctx.createBufferSource();
        source.buffer = decodedBuffer;

        const voiceGain = ctx.createGain();
        voiceGain.gain.value = 1.0;
        source.connect(voiceGain);
        voiceGain.connect(ctx.destination);

        activeVoiceSourceRef.current = source;

        // Auto-duck ambient background while ghost speaks
        if ((window as any).__setAmbientDucking) {
          (window as any).__setAmbientDucking(true);
        }

        source.onended = () => {
          if (activeVoiceSourceRef.current === source) {
            activeVoiceSourceRef.current = null;
          }
          if ((window as any).__setAmbientDucking) {
            (window as any).__setAmbientDucking(false);
          }
          if (onEnded) onEnded();
        };

        source.start(0);

        // If context remains suspended pending gesture, queue resume on next interaction
        if (ctx.state === 'suspended') {
          const resumeOnGesture = () => {
            if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
              audioCtxRef.current.resume().catch(() => {});
            }
            window.removeEventListener('click', resumeOnGesture);
            window.removeEventListener('keydown', resumeOnGesture);
          };
          window.addEventListener('click', resumeOnGesture, { once: true });
          window.addEventListener('keydown', resumeOnGesture, { once: true });
          return false;
        }

        return true;
      } catch (err) {
        console.error('[git-seance] Web Audio decode error:', err);
        return false;
      }
    };

    (window as any).__resumeAudioContext = async () => {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        await initAudio();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume().catch(() => {});
      }
    };

    (window as any).__stopGhostVoiceAudio = () => {
      if (activeVoiceSourceRef.current) {
        try {
          activeVoiceSourceRef.current.stop();
        } catch {}
        activeVoiceSourceRef.current = null;
      }
      if ((window as any).__setAmbientDucking) {
        (window as any).__setAmbientDucking(false);
      }
    };

    return () => {
      delete (window as any).__playCemeterySoundCue;
      delete (window as any).__setAmbientDucking;
      delete (window as any).__playGhostVoiceAudio;
      delete (window as any).__resumeAudioContext;
      delete (window as any).__stopGhostVoiceAudio;
    };
  }, []);

  // Auto-start ambient track on first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasStartedRef.current) {
        initAudio();
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      scheduledTimersRef.current.forEach((t) => clearTimeout(t));
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  const toggleAudio = () => {
    if (isPlaying) {
      if (audioCtxRef.current) {
        audioCtxRef.current.suspend();
      }
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      scheduledTimersRef.current.forEach((t) => clearTimeout(t));
      setIsPlaying(false);
    } else {
      initAudio();
    }
  };

  return (
    <button
      onClick={toggleAudio}
      className="btn-ghost"
      title="Cemetery Atmospheric Audio"
      suppressHydrationWarning
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.75rem',
        borderColor: isPlaying ? 'var(--amber)' : 'var(--ash)',
        color: isPlaying ? 'var(--amber)' : 'var(--ash)',
        cursor: 'pointer',
      }}
    >
      <span>{isPlaying ? '🦇' : '🔇'}</span>
      <span>{isPlaying ? 'Graveyard: Haunted' : 'Graveyard: Silent'}</span>
    </button>
  );
}
