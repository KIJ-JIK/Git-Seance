'use client';

interface Props {
  size?: number;
  className?: string;
  glow?: boolean;
}

export default function PixelGhostMascot({ size = 72, className = '', glow = true }: Props) {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, var(--candle-glow) 0%, transparent 70%)',
          }}
        />
      )}
      <div
        className="relative z-10 w-full h-full rounded-2xl overflow-hidden border shadow-lg bg-black/60 transition-transform duration-300 hover:scale-105"
        style={{
          borderColor: 'var(--surface-border)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.7), 0 0 20px var(--candle-glow)',
        }}
      >
        <img
          src="/assets/pixel-ghost.jpg"
          alt="Git Séance Mascot"
          className="w-full h-full object-contain p-1 mix-blend-screen"
        />
      </div>
    </div>
  );
}
