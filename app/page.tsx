'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CemeteryAmbience from '@/components/CemeteryAmbience';
import DynamicGhostBackground from '@/components/DynamicGhostBackground';
import PixelGhostMascot from '@/components/PixelGhostMascot';
import PixelGraveyardCard from '@/components/PixelGraveyardCard';
import ModeToggle from '@/components/ModeToggle';

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Item #50 & #56: Pre-fill URL from query parameters (e.g. from Graveyard Summon button)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('url');
      if (urlParam) {
        setUrl(urlParam.trim());
      }
    }
  }, []);

  // Item #81: Clean and format input when user leaves field
  const handleBlur = () => {
    if (!url.trim()) return;
    let cleaned = url.trim();
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://') && cleaned.includes('github.com')) {
      cleaned = `https://${cleaned}`;
    }
    setUrl(cleaned);
  };

  const handleSummon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'The spirits are unsettled. Try again.');
        setLoading(false);
        return;
      }

      // Store repo data in sessionStorage for the séance chamber
      sessionStorage.setItem('seance_repo', JSON.stringify(data));
      sessionStorage.setItem('seance_url', url.trim());
      router.push('/seance');
    } catch {
      setError('The connection to the beyond has been severed. Check your URL.');
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Preserved High-Fidelity 144-Frame Dynamic Ghost Background */}
      <DynamicGhostBackground isSummoning={loading} opacity={0.6} />

      {/* Ambience Audio Control & Theme Toggle Header - Placed in-flow above the bento frame to prevent overlap */}
      <header className="w-full max-w-4xl flex items-center justify-end gap-3 mb-4 relative z-30">
        <ModeToggle />
        <CemeteryAmbience />
      </header>

      {/* Image 1 Bento Master Frame Container */}
      <div className="bento-master-frame w-full max-w-4xl relative z-10 p-6 sm:p-10 flex flex-col items-center">
        
        {/* Top Pill Status Badge */}
        <div className="bento-pill mb-6">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--phosphor)' }} />
          <span>GHOST IN THE MACHINE · HACKTOBERFEST</span>
        </div>

        {/* Mascot Header — Image 4 Pixel Ghost replacing old candles */}
        <div className="mb-4">
          <PixelGhostMascot size={88} glow={true} />
        </div>

        {/* Title & Tagline in Image 2 Distressed Typography & Colors */}
        <div className="text-center mb-8 max-w-xl">
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--spectral)',
              fontSize: 'clamp(3rem, 7vw, 5rem)',
              letterSpacing: '0.04em',
              lineHeight: 1.05,
              textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 30px rgba(255, 107, 43, 0.45)',
              margin: '0 0 0.75rem',
            }}
          >
            Git Séance
          </h1>

          <p
            style={{
              color: 'var(--ash)',
              fontFamily: 'var(--font-ui)',
              fontWeight: 500,
              fontSize: '0.95rem',
              lineHeight: 1.6,
            }}
          >
            Every abandoned repository has a ghost.<br />
            Every ghost has something left to say.<br />
            <span style={{ color: 'var(--phosphor)', fontWeight: 700 }}>
              Dare to listen?
            </span>
          </p>
        </div>

        {/* Inner Bento Grid: Left Terminal, Right Graveyard Preview */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Action Terminal Card */}
          <div className="lg:col-span-8 flex flex-col justify-between">
            <form onSubmit={handleSummon} className="w-full h-full flex flex-col justify-between">
              <div className="terminal flex-1 flex flex-col justify-between mb-4">
                <div>
                  <div className="flex items-center justify-between mb-3 border-b pb-2" style={{ borderColor: 'var(--surface-border)' }}>
                    <span
                      style={{
                        color: 'var(--amber)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        letterSpacing: '0.08em',
                        fontWeight: 600,
                      }}
                    >
                      ENTER ABANDONED REPOSITORY URL
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--ash)' }}>v0.1.0</span>
                  </div>

                  <div className="flex items-center mt-3 gap-2">
                    <span style={{ color: 'var(--phosphor)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {'>'}
                    </span>
                    <input
                      type="url"
                      inputMode="url"
                      aria-label="GitHub repository URL"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onBlur={handleBlur}
                      placeholder="https://github.com/owner/abandoned-repo"
                      disabled={loading}
                      autoComplete="url"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      suppressHydrationWarning
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--spectral)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1rem',
                        width: '100%',
                        caretColor: 'var(--phosphor)',
                      }}
                    />
                    {!url && <span className="cursor" aria-hidden="true" style={{ color: 'var(--phosphor)' }} />}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t flex items-center justify-between text-[11px] font-mono" style={{ borderColor: 'var(--surface-border)', color: 'var(--ash)' }}>
                  <span>🔒 Local Open-Weight Intelligence</span>
                  <span>OLLAMA / GROQ</span>
                </div>
              </div>

              {error && (
                <p
                  style={{
                    color: 'var(--amber)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    marginBottom: '0.75rem',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 107, 43, 0.1)',
                    border: '1px solid rgba(255, 107, 43, 0.4)',
                  }}
                >
                  ⚠ {error}
                </p>
              )}

              {/* Action Buttons in Image 1 Rounded Pill Style */}
              <div className="flex flex-wrap gap-3 mt-2">
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  suppressHydrationWarning
                >
                  {loading ? (
                    <span className="crossing-veil">Crossing the veil…</span>
                  ) : (
                    <>
                      <span>👻</span>
                      <span>Summon the Ghost</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => router.push('/graveyard')}
                  suppressHydrationWarning
                >
                  🪦 View Graveyard
                </button>
              </div>
            </form>
          </div>

          {/* Right Bento Card: Image 3 Pixel Graveyard Scene */}
          <div className="lg:col-span-4 flex">
            <PixelGraveyardCard className="w-full h-full flex flex-col justify-between" />
          </div>
        </div>

        {/* Quick Select Haunted Repositories */}
        <div className="mt-8 pt-6 border-t w-full text-center" style={{ borderColor: 'var(--surface-border)' }}>
          <p
            style={{
              color: 'var(--ash)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
            }}
          >
            — Haunted Repositories Awaiting Summons —
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLE_REPOS.map((r) => (
              <button
                key={r.url}
                onClick={() => setUrl(r.url)}
                suppressHydrationWarning
                className="bento-card inline-flex items-center justify-center"
                style={{
                  color: 'var(--spectral)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  padding: '0.65rem 1rem',
                  minHeight: '44px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer in Subtle Cream & Orange */}
      <footer
        className="relative z-10 mt-6 text-center"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--ash)',
          letterSpacing: '0.12em',
        }}
      >
        POWERED BY GEMMA · OPEN-SOURCE AI · HACKTOBERFEST 2026
      </footer>
    </main>
  );
}

const EXAMPLE_REPOS = [
  { label: 'autozest', url: 'https://github.com/wayneeseguin/autozest' },
  { label: 'ambitious_activeldap', url: 'https://github.com/defunkt/ambitious_activeldap' },
  { label: 'blerb-core', url: 'https://github.com/hornbeck/blerb-core' },
  { label: 'alogr', url: 'https://github.com/wayneeseguin/alogr' },
  { label: 'credit_card_tools', url: 'https://github.com/up_the_irons/credit_card_tools' },
];
