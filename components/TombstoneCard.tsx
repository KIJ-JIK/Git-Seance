'use client';

import { useRef } from 'react';
import type { RepoIngestion } from '@/lib/github';
import type { GhostPersona } from '@/lib/ghost';

interface Props {
  repo: RepoIngestion;
  persona: GhostPersona;
}

export default function TombstoneCard({ repo, persona }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  const exportPNG = async () => {
    if (!cardRef.current) return;
    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#2D3142',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `${repo.metadata.name}-tombstone.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      console.error('Export failed');
    }
  };

  const lastCommitYear = repo.commits[0]?.date
    ? new Date(repo.commits[0].date).getFullYear()
    : '????';

  const createdYear = new Date(repo.metadata.createdAt).getFullYear();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Tombstone card */}
      <div ref={cardRef} className="tombstone" style={{ width: 280 }}>
        {/* Cross / decoration */}
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            color: 'var(--ash)',
            marginBottom: '0.5rem',
          }}
        >
          ✝
        </div>

        {/* Repo name */}
        <div className="repo-name">{repo.metadata.name}</div>

        {/* Dates */}
        <div
          style={{
            fontFamily: 'var(--font-epitaph)',
            fontSize: '0.8rem',
            color: 'var(--ash)',
            marginBottom: '0.75rem',
            letterSpacing: '0.05em',
          }}
        >
          {createdYear} — {lastCommitYear}
        </div>

        {/* Divider */}
        <div
          style={{
            width: '60%',
            height: 1,
            background: 'var(--ash)',
            margin: '0 auto 0.75rem',
            opacity: 0.5,
          }}
        />

        {/* Ghost name */}
        <div className="ghost-name">
          Haunted by {persona.name}
        </div>

        {/* Language */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            color: 'var(--phosphor-dim)',
            marginBottom: '1rem',
            letterSpacing: '0.1em',
          }}
        >
          {repo.metadata.language ?? 'Unknown Language'}
        </div>

        {/* Epitaph */}
        <div className="epitaph">
          {persona.epitaph}
        </div>

        {/* Stars */}
        {repo.metadata.stars > 0 && (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--ash)',
              marginTop: '1rem',
              opacity: 0.6,
            }}
          >
            ★ {repo.metadata.stars} stars · {repo.metadata.forks} forks
          </div>
        )}
      </div>

      {/* Export button */}
      <button onClick={exportPNG} className="btn-ghost" style={{ fontSize: '0.8rem' }}>
        📸 Export as PNG
      </button>
    </div>
  );
}
