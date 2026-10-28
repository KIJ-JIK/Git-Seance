'use client';

import { useState, useEffect, useRef } from 'react';

export default function SpookyAmbience() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAmbience = async () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      audioCtxRef.current = ctx;

      // ── Subterranean Graveyard Drone (Hearable Low-Mid Frequencies) ──
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const droneGain = ctx.createGain();
      droneGainRef.current = droneGain;

      // Noticeable haunted minor third drone (110Hz A2 + 130.8Hz C3)
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(110, ctx.currentTime);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(130.81, ctx.currentTime);

      // Low pass filter with slight resonance to give that hollow crypt acoustic
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      droneGain.gain.setValueAtTime(0.35, ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      // Trigger an immediate sound on click so the user instantly hears it!
      playRandomGhostSound(ctx);

      // ── Randomized Ghostly Wind Gusts & Bell Tolls every 6 seconds ──
      intervalRef.current = setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        playRandomGhostSound(audioCtxRef.current);
      }, 7000);

      setIsPlaying(true);
    } catch (e) {
      console.warn('Audio context initialization failed:', e);
    }
  };

  const playRandomGhostSound = (ctx: AudioContext) => {
    const soundType = Math.random();

    if (soundType < 0.6) {
      // 1. Ghostly Wind Gust (clearly audible breath of wind)
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(350, ctx.currentTime);
      windFilter.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.2);
      windFilter.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 3);
      windFilter.Q.setValueAtTime(3.0, ctx.currentTime);

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0.01, ctx.currentTime);
      windGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 1);
      windGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 3);

      whiteNoise.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(ctx.destination);
      whiteNoise.start();
    } else {
      // 2. Distant Cemetery Crypt Bell Toll
      const bellOsc = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(220, ctx.currentTime); // Eerie A3 toll
      bellGain.gain.setValueAtTime(0.3, ctx.currentTime);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.5);

      bellOsc.connect(bellGain);
      bellGain.connect(ctx.destination);
      bellOsc.start();
      bellOsc.stop(ctx.currentTime + 3.6);
    }
  };

  const stopAmbience = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
  };

  const toggleAmbience = () => {
    if (isPlaying) {
      stopAmbience();
    } else {
      startAmbience();
    }
  };

  useEffect(() => {
    return () => {
      stopAmbience();
    };
  }, []);

  return (
    <button
      onClick={toggleAmbience}
      className="btn-ghost"
      title="Toggle Haunted Cemetery Ambience"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.75rem',
        borderColor: isPlaying ? 'var(--amber)' : 'var(--ash)',
        color: isPlaying ? 'var(--amber)' : 'var(--ash)',
      }}
    >
      <span>{isPlaying ? '🦇' : '🔇'}</span>
      <span>{isPlaying ? 'Ambience: Haunted' : 'Ambience: Silent'}</span>
    </button>
  );
}
