'use client';

interface Props {
  className?: string;
}

export default function PixelGraveyardCard({ className = '' }: Props) {
  return (
    <div
      className={`bento-card overflow-hidden relative group p-3 sm:p-4 max-w-sm ${className}`}
    >
      <div className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden border shadow-inner" style={{ borderColor: 'var(--surface-border)' }}>
        <img
          src="/assets/pixel-graveyard.jpg"
          alt="Pixel Cemetery Moonlit Vigil"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
        <span className="absolute bottom-2 left-2 bento-pill text-[10px] py-0.5 px-2.5 bg-black/70 backdrop-blur-md">
          🌕 Graveyard Vigil
        </span>
      </div>
      <div className="mt-3 px-1">
        <h4
          className="text-sm font-bold tracking-wide"
          style={{ fontFamily: 'var(--font-ui)', color: 'var(--spectral)' }}
        >
          Spectral Realm
        </h4>
        <p className="text-[11px] mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--ash)' }}>
          Where forgotten commits whisper under the pixel moon.
        </p>
      </div>
    </div>
  );
}
