'use client';

import { useState } from 'react';
import type { RepoIngestion } from '@/lib/github';
import type { GhostPersona } from '@/lib/ghost';

interface Props {
  repo: RepoIngestion;
  persona: GhostPersona;
  onSpeak?: (text: string) => void;
}

export default function CommitHistory({ repo, persona, onSpeak }: Props) {
  const [lore, setLore] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const loadLore = async (sha: string, message: string, date: string, author: string) => {
    if (lore[sha] || loading) return;
    setLoading(sha);
    try {
      const res = await fetch('/api/ghost/commit-lore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitMessage: message, commitDate: date, author, persona, repo }),
      });
      const data = await res.json();
      const loreText = data.lore ?? 'The ghost remembers nothing.';
      setLore((prev) => ({ ...prev, [sha]: loreText }));
      // Automatically speak the commit lore aloud in the ghost's voice!
      if (onSpeak && data.lore) {
        onSpeak(data.lore);
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="terminal overflow-y-auto" style={{ height: 'calc(100vh - 260px)' }}>
      <p style={{ color: 'var(--amber)', marginBottom: '1rem', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
        📜 COMMIT HISTORY — {repo.commits.length} ENTRIES RECOVERED
      </p>

      {repo.commits.map((commit) => (
        <div
          key={commit.sha}
          style={{
            borderBottom: '1px solid var(--surface-border)',
            paddingBottom: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div style={{ flex: 1 }}>
              <span style={{ color: 'var(--phosphor)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700 }}>
                [{commit.sha.slice(0, 7)}]
              </span>{' '}
              <span style={{ color: 'var(--spectral)', fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 600 }}>
                {commit.message}
              </span>
              <div style={{ color: 'var(--ash)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', marginTop: '0.35rem' }}>
                {commit.author} · {commit.date.slice(0, 10)}
              </div>
            </div>

            <button
              onClick={() => loadLore(commit.sha, commit.message, commit.date, commit.author)}
              disabled={!!lore[commit.sha] || loading === commit.sha}
              className="btn-ghost"
              style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}
            >
              {loading === commit.sha ? (
                <span className="crossing-veil">…</span>
              ) : lore[commit.sha] ? (
                '✓ Lore revealed'
              ) : (
                '👻 Ask the ghost'
              )}
            </button>
          </div>

          {lore[commit.sha] && (
            <div
              className="ghost-message"
              style={{
                marginTop: '0.75rem',
                paddingLeft: '1rem',
                borderLeft: '2px solid var(--phosphor-dim)',
                fontSize: '0.8rem',
                fontStyle: 'italic',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <span style={{ flex: 1 }}>{lore[commit.sha]}</span>
              {onSpeak && (
                <button
                  onClick={() => onSpeak(lore[commit.sha])}
                  className="btn-ghost"
                  style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', whiteSpace: 'nowrap' }}
                  title="Replay Voice"
                >
                  🔊
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
