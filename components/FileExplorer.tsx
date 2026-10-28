'use client';

import { useState } from 'react';
import type { RepoIngestion } from '@/lib/github';
import type { GhostPersona } from '@/lib/ghost';

interface Props {
  repo: RepoIngestion;
  persona: GhostPersona;
  onDiff: (diff: string) => void;
  onReview: (review: string) => void;
}

export default function FileExplorer({ repo, persona, onDiff, onReview }: Props) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<'review' | 'diff' | null>(null);

  const loadFile = async (path: string) => {
    setSelectedFile(path);
    setLoading(true);
    setFileContent('');
    try {
      const [owner, repoName] = repo.metadata.fullName.split('/');
      const res = await fetch(`/api/file-content?owner=${owner}&repo=${repoName}&path=${encodeURIComponent(path)}`);
      const data = await res.json();
      setFileContent(data.content ?? data.error ?? 'Could not load file.');
    } finally {
      setLoading(false);
    }
  };

  const runReview = async () => {
    if (!fileContent || !selectedFile) return;
    setActionLoading('review');
    try {
      const res = await fetch('/api/ghost/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fileContent, filePath: selectedFile, persona, repo }),
      });
      const data = await res.json();
      onReview(data.review ?? data.error ?? 'The ghost refuses to speak.');
    } finally {
      setActionLoading(null);
    }
  };

  const runDiff = async () => {
    if (!fileContent || !selectedFile) return;
    setActionLoading('diff');
    try {
      const res = await fetch('/api/ghost/diff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: fileContent, filePath: selectedFile, persona, repo }),
      });
      const data = await res.json();
      onDiff(data.diff ?? data.error ?? 'The resurrection failed.');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter to code files with fallback to all repo files
  const filteredFiles = repo.files.filter((f) => {
    const lower = f.name.toLowerCase();
    return CODE_EXTENSIONS.some((ext) => lower.endsWith(ext) || lower === ext);
  });

  const displayFiles = filteredFiles.length > 0 ? filteredFiles : repo.files;

  return (
    <div className="flex gap-4" style={{ height: 'calc(100vh - 260px)' }}>
      {/* File list */}
      <div
        className="terminal overflow-y-auto"
        style={{ width: 240, flexShrink: 0, fontSize: '0.75rem' }}
      >
        <p style={{ color: 'var(--amber)', marginBottom: '0.75rem', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
          📂 REPOSITORY FILES ({displayFiles.length})
        </p>
        {displayFiles.length === 0 && (
          <p style={{ color: 'var(--ash)' }}>No files found in repository.</p>
        )}
        {displayFiles.map((f) => (
          <button
            key={f.path}
            onClick={() => loadFile(f.path)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              background: selectedFile === f.path ? 'var(--candle-glow)' : 'transparent',
              border: 'none',
              color: selectedFile === f.path ? 'var(--spectral)' : 'var(--ash)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              padding: '0.4rem 0.6rem',
              cursor: 'pointer',
              borderRadius: '8px',
              borderLeft: selectedFile === f.path ? '3px solid var(--phosphor)' : '3px solid transparent',
              wordBreak: 'break-all',
              fontWeight: selectedFile === f.path ? 700 : 500,
            }}
          >
            {f.path}
          </button>
        ))}
      </div>

      {/* File content */}
      <div className="flex flex-col flex-1 gap-2">
        {selectedFile && (
          <div className="flex gap-2">
            <button
              onClick={runReview}
              disabled={!fileContent || actionLoading !== null}
              className="btn-primary"
              style={{ fontSize: '0.75rem' }}
            >
              {actionLoading === 'review' ? <span className="crossing-veil">Reviewing…</span> : '👁 Spectral Review'}
            </button>
            <button
              onClick={runDiff}
              disabled={!fileContent || actionLoading !== null}
              className="btn-primary"
              style={{ fontSize: '0.75rem' }}
            >
              {actionLoading === 'diff' ? <span className="crossing-veil">Resurrecting…</span> : '⚡ Resurrect Code'}
            </button>
          </div>
        )}

        <div className="terminal flex-1 overflow-auto" style={{ fontSize: '0.75rem' }}>
          {!selectedFile && (
            <p style={{ color: 'var(--ash)' }}>← Select a file to begin the inspection.</p>
          )}
          {loading && <p className="crossing-veil">Loading from the beyond…</p>}
          {!loading && fileContent && (
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--spectral)', lineHeight: 1.6 }}>
              {fileContent}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

const CODE_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx', '.py', '.rb', '.java', '.c', '.cpp', '.h',
  '.cs', '.go', '.rs', '.php', '.swift', '.kt', '.sh', '.bash', '.pl',
  '.lua', '.r', '.m', '.scala', '.clj', '.coffee', '.ex', '.exs',
  '.ml', '.fs', '.erl', '.hs', '.f', '.for', '.pas', '.asm',
  '.gemspec', '.rake', 'rakefile', 'gemfile', '.yml', '.yaml', '.json',
  '.toml', '.md', '.markdown', '.txt', '.xml', '.html', '.css', '.scss', '.sql',
];
