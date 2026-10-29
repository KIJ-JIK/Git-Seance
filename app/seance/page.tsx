'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { RepoIngestion } from '@/lib/github';
import type { GhostPersona, ChatMessage } from '@/lib/ghost';
import PixelGhostMascot from '@/components/PixelGhostMascot';
import DynamicGhostBackground from '@/components/DynamicGhostBackground';
import CemeteryAmbience from '@/components/CemeteryAmbience';
import ModeToggle from '@/components/ModeToggle';
import FileExplorer from '@/components/FileExplorer';
import CommitHistory from '@/components/CommitHistory';
import TombstoneCard from '@/components/TombstoneCard';
import DiffViewer from '@/components/DiffViewer';

type Tab = 'chat' | 'files' | 'commits' | 'tombstone';

export default function SeancePage() {
  const router = useRouter();
  const [repo, setRepo] = useState<RepoIngestion | null>(null);
  const [persona, setPersona] = useState<GhostPersona | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [loading, setLoading] = useState(false);
  const [ghostLoading, setGhostLoading] = useState(true);
  const [ofrendaMode, setOfrendaMode] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [diffContent, setDiffContent] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState<string>('');
  const [keyInput, setKeyInput] = useState<string>('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [voiceProvider, setVoiceProvider] = useState<'elevenlabs' | 'spectral' | 'browser'>('spectral');
  const terminalRef = useRef<HTMLDivElement>(null);

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const personaGeneratedRef = useRef(false);

  // Initialize ElevenLabs key from localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('git_seance_elevenlabs_key');
      if (savedKey) {
        setElevenLabsKey(savedKey);
        setKeyInput(savedKey);
      }
    }
  }, []);

  // Load repo from sessionStorage and generate persona
  useEffect(() => {
    if (personaGeneratedRef.current) return;
    const raw = sessionStorage.getItem('seance_repo');
    if (!raw) {
      router.replace('/');
      return;
    }
    const repoData: RepoIngestion = JSON.parse(raw);
    setRepo(repoData);
    personaGeneratedRef.current = true;
    generatePersona(repoData);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Toggle ofrenda mode on body
  useEffect(() => {
    document.body.classList.toggle('ofrenda-mode', ofrendaMode);
    return () => document.body.classList.remove('ofrenda-mode');
  }, [ofrendaMode]);

  const generatePersona = async (repoData: RepoIngestion) => {
    setGhostLoading(true);
    try {
      const res = await fetch('/api/ghost/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: repoData }),
      });
      const data = await res.json();
      const p: GhostPersona = data.persona || {
        name: 'The Restless Maintainer',
        era: 'a forgotten era',
        language: repoData.metadata.language ?? 'ancient assembly',
        personality: 'Haunted by merge conflicts and abandoned pull requests.',
        causeOfAbandonment: 'Left behind when the world moved to newer frameworks.',
        epitaph: `Here lies ${repoData.metadata.name}. Never merged. Never forgotten.`,
        voiceStyle: 'weary, chilling',
      };
      setPersona(p);

      // Opening ghost monologue - short, haunting and impactful
      const opening: ChatMessage = {
        role: 'ghost',
        content: `*A cold wind passes through the terminal…*\n\nI am ${p.name}, bound to ${repoData.metadata.name} since ${p.era}.\n\nThey abandoned this repository, leaving its code to rot. Speak, mortal. What do you seek from the departed?`,
        timestamp: Date.now(),
      };
      setMessages([opening]);

      // Speak automatically upon summoning!
      speakText(opening.content);
    } catch {
      const fallbackPersona: GhostPersona = {
        name: 'The Restless Maintainer',
        era: 'the old web',
        language: repoData.metadata.language ?? 'legacy code',
        personality: 'A guardian of dead bits.',
        causeOfAbandonment: 'Left in darkness.',
        epitaph: `Here lies ${repoData.metadata.name}. A ghost in the machine.`,
        voiceStyle: 'shadowy whisper',
      };
      setPersona(fallbackPersona);
      const fallbackMsg: ChatMessage = {
        role: 'ghost',
        content: `*A sudden chill stirs the terminal…*\n\nI am ${fallbackPersona.name}. I linger in the shadows of ${repoData.metadata.name}. Speak your question.`,
        timestamp: Date.now(),
      };
      setMessages([fallbackMsg]);
      speakText(fallbackMsg.content);
    } finally {
      setGhostLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !persona || !repo || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ghost/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, persona, repo, history: messages.slice(-6) }),
      });
      const data = await res.json();
      const ghostMsg: ChatMessage = {
        role: 'ghost',
        content: data.response ?? data.error ?? 'The ghost is silent.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, ghostMsg]);

      // Automatically speak the new response out loud!
      if (data.response) {
        speakText(data.response);
      }
    } finally {
      setLoading(false);
    }
  };

  const speakText = async (textToSpeak: string) => {
    if (!textToSpeak) return;

    // Immediately cancel any previous voice playing (prevents overlapping/echoing voices)
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Detect sound cues in asterisks (e.g. *An echo of forgotten CSS shivers the terminal.*)
    const cueMatch = textToSpeak.match(/\*([^*]+)\*/);
    if (cueMatch && typeof window !== 'undefined' && (window as any).__playCemeterySoundCue) {
      (window as any).__playCemeterySoundCue(cueMatch[1]);
    }

    // Strip stage directions from spoken voice so TTS doesn't read out "*An echo... shivers...*"
    const spokenText = textToSpeak
      .replace(/\*[^*]+\*/g, '')
      .replace(/[_#`]/g, '')
      .trim();

    if (!spokenText) return;

    setVoiceLoading(true);
    // Duck background ambience so ghost speech is 100% prominent & easy to hear
    if (typeof window !== 'undefined' && (window as any).__setAmbientDucking) {
      (window as any).__setAmbientDucking(true);
    }

    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(elevenLabsKey ? { 'x-elevenlabs-key': elevenLabsKey } : {}),
        },
        body: JSON.stringify({ text: spokenText }),
      });
      if (res.ok) {
        const providerHeader = res.headers.get('X-Voice-Provider');
        if (providerHeader === 'elevenlabs') {
          setVoiceProvider('elevenlabs');
        } else {
          setVoiceProvider('spectral');
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudioRef.current = audio;
        // Catch browser autoplay policy rejection gracefully (no red screen error)
        audio.play().catch((playErr) => {
          console.log('[git-seance] Browser autoplay blocked until user clicks on page:', playErr.name);
          setVoiceLoading(false);
          if (typeof window !== 'undefined' && (window as any).__setAmbientDucking) {
            (window as any).__setAmbientDucking(false);
          }
        });
        audio.onended = () => {
          URL.revokeObjectURL(url);
          currentAudioRef.current = null;
          setVoiceLoading(false);
          // Restore ambient volume after ghost finishes speaking
          if (typeof window !== 'undefined' && (window as any).__setAmbientDucking) {
            (window as any).__setAmbientDucking(false);
          }
        };
        return;
      }
    } catch (err) {
      console.warn('Voice API error:', err);
    }

    // Speech synthesis fallback only if all network audio fails
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setVoiceProvider('browser');
      const utterance = new SpeechSynthesisUtterance(spokenText);
      const voices = window.speechSynthesis.getVoices();
      const hauntedVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Neural') ||
            v.name.includes('Google') ||
            v.name.includes('Daniel') ||
            v.name.includes('David'))
      );
      if (hauntedVoice) utterance.voice = hauntedVoice;
      utterance.pitch = 0.5;
      utterance.rate = 0.82;
      utterance.onend = () => {
        setVoiceLoading(false);
        if (typeof window !== 'undefined' && (window as any).__setAmbientDucking) {
          (window as any).__setAmbientDucking(false);
        }
      };
      utterance.onerror = () => {
        setVoiceLoading(false);
        if (typeof window !== 'undefined' && (window as any).__setAmbientDucking) {
          (window as any).__setAmbientDucking(false);
        }
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setVoiceLoading(false);
      if (typeof window !== 'undefined' && (window as any).__setAmbientDucking) {
        (window as any).__setAmbientDucking(false);
      }
    }
  };

  const speakLastGhostMessage = async () => {
    const lastGhost = [...messages].reverse().find((m) => m.role === 'ghost');
    if (!lastGhost) return;
    await speakText(lastGhost.content);
  };

  const submitToGraveyard = async () => {
    if (!persona || !repo) return;
    try {
      await fetch('/api/graveyard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: crypto.randomUUID(),
          repo_url: repo.metadata.htmlUrl,
          repo_name: repo.metadata.name,
          ghost_name: persona.name,
          ghost_era: persona.era,
          language: repo.metadata.language ?? 'unknown',
          epitaph: persona.epitaph,
          last_commit_date: repo.commits[0]?.date ?? '',
        }),
      });
      router.push('/graveyard');
    } catch {
      router.push('/graveyard');
    }
  };

  if (!repo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="crossing-veil">Opening the portal…</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col p-4 sm:p-6 relative overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Preserved Dynamic Ghost Background */}
      <DynamicGhostBackground opacity={0.35} />

      {/* Image 1 Bento Master Frame */}
      <div className="bento-master-frame max-w-6xl w-full mx-auto p-5 sm:p-8 flex-1 flex flex-col relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-4 pb-4 border-b border-[#FF6B2B]/20">
          <div className="flex items-center gap-3">
            <PixelGhostMascot size={42} glow={true} />
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--spectral)', fontSize: '1.75rem', margin: 0, textShadow: '0 0 20px rgba(255, 107, 43, 0.4)' }}>
                Git Séance
              </h1>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ash)', margin: 0 }}>
                {repo.metadata.fullName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className="px-2.5 py-1 text-xs rounded-full border transition-all flex items-center gap-1.5 cursor-pointer"
              style={{
                background: elevenLabsKey ? 'rgba(74, 222, 128, 0.12)' : 'rgba(255, 107, 43, 0.12)',
                borderColor: elevenLabsKey ? 'rgba(74, 222, 128, 0.4)' : 'rgba(255, 107, 43, 0.4)',
                color: elevenLabsKey ? '#4ade80' : 'var(--spectral)',
                fontFamily: 'var(--font-mono)',
              }}
              title="Configure ElevenLabs Voice Key"
            >
              <span>{elevenLabsKey ? '🔊 ElevenLabs: Unlocked' : '🔑 Unlock Voice (ElevenLabs)'}</span>
            </button>
            <ModeToggle />
            <CemeteryAmbience />
            <button onClick={() => router.push('/')} className="btn-ghost">
              ← New Séance
            </button>
          </div>
        </header>

        {/* Ghost Persona Badge (Image 1 Bento Pill / Box Style) */}
        {persona && (
          <div
            className="bento-card mb-4 p-3.5 flex flex-wrap items-center gap-2"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
            }}
          >
            <span className="bento-pill py-0.5 px-2">👻 SUMMONED</span>
            <span style={{ color: 'var(--spectral)', fontWeight: 700 }}>{persona.name}</span>
            <span style={{ color: 'var(--ash)' }}>
              {' '}· {persona.era} · {persona.language} · "{persona.voiceStyle}"
            </span>
          </div>
        )}

        {/* Tabs in Image 1 Bento Pill Navigation */}
        <nav className="flex flex-wrap gap-2 mb-4 pb-3 border-b" style={{ borderColor: 'var(--surface-border)' }}>
          {(['chat', 'files', 'commits', 'tombstone'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="bento-card"
              style={{
                background: activeTab === tab ? 'var(--candle-glow)' : 'var(--surface)',
                borderColor: activeTab === tab ? 'var(--phosphor)' : 'var(--surface-border)',
                color: activeTab === tab ? 'var(--spectral)' : 'var(--ash)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: activeTab === tab ? 700 : 500,
                padding: '0.5rem 1.1rem',
                borderRadius: '14px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                transition: 'all 0.2s',
              }}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </nav>

      {/* Tab Content */}
      <div className="flex-1">

        {/* ── CHAT TAB ── */}
        {activeTab === 'chat' && (
          <div className="flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
            <div
              ref={terminalRef}
              className="terminal flex-1 overflow-y-auto mb-3"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {ghostLoading && (
                <p className="crossing-veil">Crossing the veil… summoning {repo.metadata.name}'s ghost…</p>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={msg.role === 'ghost' ? 'ghost-message' : 'user-message'}>
                  {msg.content}
                </div>
              ))}
              {loading && <p className="crossing-veil">The ghost is composing a response…</p>}
            </div>

            <div className="flex gap-2">
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Speak to the ghost… (Enter to send)"
                  disabled={loading}
                  autoComplete="off"
                  spellCheck={false}
                  style={{
                    width: '100%',
                    background: 'var(--terminal-bg)',
                    border: '1.5px solid var(--surface-border)',
                    borderRadius: '16px',
                    color: 'var(--spectral)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.92rem',
                    padding: '0.75rem 1.25rem',
                    outline: 'none',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                  }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="btn-primary"
              >
                Disturb
              </button>
              <button
                onClick={speakLastGhostMessage}
                disabled={voiceLoading || messages.length === 0}
                className="btn-ghost"
                title="Hear the ghost's words (Audio / Speech)"
              >
                {voiceLoading ? '…' : '🔊'}
              </button>
            </div>
          </div>
        )}

        {/* ── FILES TAB ── */}
        {activeTab === 'files' && (
          <FileExplorer
            repo={repo}
            persona={persona || {
              name: 'The Restless Maintainer',
              era: 'the old web',
              language: repo.metadata.language ?? 'legacy code',
              personality: 'A guardian of dead bits.',
              causeOfAbandonment: 'Left in darkness.',
              epitaph: `Here lies ${repo.metadata.name}.`,
              voiceStyle: 'spectral',
            }}
            onDiff={(diff) => { setDiffContent(diff); }}
            onReview={(review) => {
              setReviewContent(review);
              // Immediately speak the spectral review out loud in ghost voice!
              speakText(review);
            }}
          />
        )}

        {/* ── COMMITS TAB ── */}
        {activeTab === 'commits' && (
          <CommitHistory
            repo={repo}
            persona={persona || {
              name: 'The Restless Maintainer',
              era: 'the old web',
              language: repo.metadata.language ?? 'legacy code',
              personality: 'A guardian of dead bits.',
              causeOfAbandonment: 'Left in darkness.',
              epitaph: `Here lies ${repo.metadata.name}.`,
              voiceStyle: 'spectral',
            }}
            onSpeak={(loreText) => speakText(loreText)}
          />
        )}

        {/* ── TOMBSTONE TAB ── */}
        {activeTab === 'tombstone' && (
          <div className="flex flex-col items-center gap-6 py-8">
            <TombstoneCard
              repo={repo}
              persona={persona || {
                name: 'The Restless Maintainer',
                era: 'the old web',
                language: repo.metadata.language ?? 'legacy code',
                personality: 'A guardian of dead bits.',
                causeOfAbandonment: 'Left in darkness.',
                epitaph: `Here lies ${repo.metadata.name}. Never merged. Never forgotten.`,
                voiceStyle: 'spectral',
              }}
            />
            <div className="flex gap-3">
              <button onClick={submitToGraveyard} className="btn-primary">
                🪦 Submit to Graveyard Wall
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Inline diff / review panels */}
      {diffContent && (
        <div className="mt-4 terminal" style={{ maxHeight: 400, overflowY: 'auto' }}>
          <div className="flex justify-between mb-2">
            <span style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              ⚡ RESURRECTION DIFF
            </span>
            <button className="btn-ghost" onClick={() => setDiffContent('')}>✕ Close</button>
          </div>
          <DiffViewer content={diffContent} />
        </div>
      )}

      {reviewContent && (
        <div className="mt-4 terminal" style={{ maxHeight: 350, overflowY: 'auto' }}>
          <div className="flex justify-between items-center mb-2">
            <span style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              👁 SPECTRAL CODE REVIEW
            </span>
            <div className="flex gap-2">
              <button
                className="btn-ghost"
                onClick={() => speakText(reviewContent)}
                title="Hear Ghost Read Review"
              >
                🔊 Replay Voice
              </button>
              <button className="btn-ghost" onClick={() => setReviewContent('')}>✕ Close</button>
            </div>
          </div>
          <p className="ghost-message" style={{ whiteSpace: 'pre-wrap' }}>{reviewContent}</p>
        </div>
      )}

        {/* ElevenLabs API Key Unlock Modal */}
        {isKeyModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              className="bento-card max-w-md w-full p-6 relative"
              style={{
                background: '#0d0d12',
                border: '1px solid var(--surface-border)',
                borderRadius: '16px',
                boxShadow: '0 0 35px rgba(255, 107, 43, 0.25)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--spectral)',
                  fontSize: '1.25rem',
                  marginBottom: '0.75rem',
                }}
              >
                🎙️ Unlock ElevenLabs Voice
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: 'var(--ash)',
                  marginBottom: '1.25rem',
                  lineHeight: '1.4',
                }}
              >
                Enter your ElevenLabs API Key to generate custom neural voices directly from ElevenLabs. 
                If no key is entered or the quota runs out, Git Séance automatically routes through the backup spectral neural voice!
              </p>

              <label
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--ash)',
                  display: 'block',
                  marginBottom: '0.35rem',
                }}
              >
                ElevenLabs API Key
              </label>
              <input
                type="password"
                placeholder="sk_..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg mb-4 text-sm font-mono"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--surface-border)',
                  color: 'white',
                  outline: 'none',
                }}
              />

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('git_seance_elevenlabs_key');
                    setElevenLabsKey('');
                    setKeyInput('');
                    setIsKeyModalOpen(false);
                  }}
                  className="px-3 py-1.5 rounded text-xs font-mono cursor-pointer"
                  style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}
                >
                  Clear Key
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsKeyModalOpen(false)}
                    className="px-3 py-1.5 rounded text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (keyInput.trim()) {
                        localStorage.setItem('git_seance_elevenlabs_key', keyInput.trim());
                        setElevenLabsKey(keyInput.trim());
                      }
                      setIsKeyModalOpen(false);
                      speakLastGhostMessage();
                    }}
                    className="px-4 py-1.5 rounded text-xs font-mono font-bold cursor-pointer"
                    style={{ background: 'var(--spectral)', color: '#000' }}
                  >
                    Save & Test Voice
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const TAB_LABELS: Record<Tab, string> = {
  chat: '💬 Séance',
  files: '📂 Files',
  commits: '📜 Commits',
  tombstone: '🪦 Tombstone',
};
