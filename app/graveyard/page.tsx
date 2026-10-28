'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Tombstone } from '@/lib/mongodb';
import PixelGhostMascot from '@/components/PixelGhostMascot';
import DynamicGhostBackground from '@/components/DynamicGhostBackground';
import ModeToggle from '@/components/ModeToggle';

export default function GraveyardPage() {
  const router = useRouter();
  const [tombstones, setTombstones] = useState<Tombstone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/graveyard')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setTombstones(data.tombstones ?? []);
      })
      .catch(() => setError('The graveyard is unreachable tonight.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main
      className="min-h-screen px-4 sm:px-8 py-10 relative overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Preserved Background Animation */}
      <DynamicGhostBackground opacity={0.4} />

      {/* Bento Master Frame */}
      <div className="bento-master-frame max-w-6xl mx-auto p-6 sm:p-10 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 pb-6 border-b" style={{ borderColor: 'var(--surface-border)' }}>
          <div className="flex items-center gap-4">
            <PixelGhostMascot size={56} glow={true} />
            <div>
              <div className="bento-pill mb-2">
                <span>Interred Repositories</span>
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--spectral)',
                  fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
                  margin: 0,
                  textShadow: '0 0 25px var(--candle-glow)',
                }}
              >
                The Graveyard
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  color: 'var(--ash)',
                  fontSize: '0.85rem',
                  margin: '0.25rem 0 0',
                }}
              >
                Where abandoned repositories rest in peace. {tombstones.length} souls interred.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <button onClick={() => router.push('/')} className="btn-primary flex items-center gap-2">
              <span>👻</span>
              <span>New Séance</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading && (
          <p className="crossing-veil text-center my-24 font-mono text-sm text-[#FF6B2B]">
            Summoning the graveyard keeper…
          </p>
        )}

        {error && (
          <p
            style={{
              color: 'var(--amber)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875rem',
              textAlign: 'center',
              marginTop: '4rem',
            }}
          >
            ⚠ {error}
          </p>
        )}

        {!loading && !error && tombstones.length === 0 && (
          <div className="bento-card text-center p-12 my-12 max-w-md mx-auto">
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                color: 'var(--ash)',
                fontSize: '1.05rem',
                lineHeight: 1.6,
              }}
            >
              The graveyard is empty.<br />No séances have concluded yet.
            </p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary mt-6 inline-flex items-center gap-2"
            >
              <span>👻</span>
              <span>Be the first to summon a ghost</span>
            </button>
          </div>
        )}

        {/* Tombstone grid */}
        {!loading && tombstones.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tombstones.map((t, i) => (
              <div
                key={i}
                className="bento-card p-6 flex flex-col justify-between cursor-pointer group"
                onClick={() => router.push(`/?url=${encodeURIComponent(t.repo_url)}`)}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs font-mono text-[#FF6B2B]">
                    <span>🪦 Interred</span>
                    <span>{t.language || 'Code'}</span>
                  </div>

                  <h3
                    className="text-lg font-bold text-[#FFF3D6] group-hover:text-[#FF6B2B] transition-colors break-words mb-1"
                    style={{ fontFamily: 'var(--font-ui)' }}
                  >
                    {t.repo_name}
                  </h3>

                  <p
                    className="text-xs text-[#A89B8C] font-mono italic mb-4"
                  >
                    by {t.ghost_name || 'Unknown Maintainer'} ({t.ghost_era || 'Past Era'})
                  </p>

                  <p className="text-xs text-[#D8CEBC] font-mono line-clamp-3 leading-relaxed">
                    "{t.epitaph}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#FF6B2B]/20 flex items-center justify-between text-[10px] font-mono text-[#A89B8C]">
                  <span>Last active: {t.last_commit_date ? new Date(t.last_commit_date).getFullYear() : 'Ancient'}</span>
                  <span className="text-[#FF6B2B] font-bold">Summon →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
