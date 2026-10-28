/**
 * components/CandleIcon.tsx
 * Animated SVG candle with flickering flame.
 */

interface Props {
  size?: number;
}

export default function CandleIcon({ size = 48 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Flame */}
      <g className="candle-flame">
        <ellipse cx="24" cy="14" rx="6" ry="10" fill="#FFB800" opacity="0.9" />
        <ellipse cx="24" cy="17" rx="3.5" ry="6" fill="#FF6B00" opacity="0.85" />
        <ellipse cx="24" cy="20" rx="2" ry="3" fill="#FFF3D4" opacity="0.7" />
      </g>
      {/* Glow */}
      <ellipse cx="24" cy="16" rx="10" ry="8" fill="#FFB800" opacity="0.08" />
      {/* Wick */}
      <line x1="24" y1="23" x2="24" y2="27" stroke="#4A4A5A" strokeWidth="1.5" strokeLinecap="round" />
      {/* Wax body */}
      <rect x="16" y="27" width="16" height="44" rx="2" fill="#2D3142" />
      <rect x="16" y="27" width="16" height="4" rx="1" fill="#4A4A5A" opacity="0.5" />
      {/* Wax drip */}
      <path d="M16 35 Q12 37 13 42 Q14 44 16 43 Z" fill="#2D3142" opacity="0.7" />
      <path d="M32 38 Q36 40 35 46 Q34 48 32 47 Z" fill="#2D3142" opacity="0.6" />
    </svg>
  );
}
