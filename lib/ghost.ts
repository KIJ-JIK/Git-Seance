/**
 * lib/ghost.ts
 * Ghost persona generation and AI interaction layer.
 * Uses Gemma 2 via Ollama (local) or Groq (fallback).
 */

import { RepoIngestion } from './github';

export interface GhostPersona {
  name: string;
  era: string;
  language: string;
  personality: string;
  causeOfAbandonment: string;
  epitaph: string;
  voiceStyle: string;
}

export interface ChatMessage {
  role: 'user' | 'ghost';
  content: string;
  timestamp: number;
}

// ── AI Provider ─────────────────────────────────────────────────────────────

async function callOllama(prompt: string, systemPrompt: string): Promise<string> {
  const res = await fetch(`${process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL ?? 'gemma2:27b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      stream: false,
      options: { temperature: 0.85, top_p: 0.95 },
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.message?.content ?? '';
}

async function callGroq(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const modelsToTry = [
    process.env.GROQ_MODEL,
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.8-27b',
  ].filter(Boolean) as string[];

  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'User-Agent': 'git-seance',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.85,
          max_tokens: 1024,
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Groq error (${model}): ${res.status} — ${err}`);
      }
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return content;
    } catch (err: any) {
      lastError = err;
      console.warn(`[git-seance] Groq model ${model} failed, trying next:`, err?.message || err);
    }
  }

  throw lastError ?? new Error('All Groq models failed');
}

export async function callAI(prompt: string, systemPrompt: string): Promise<string> {
  // Try Ollama (local Gemma) first, fall back to Groq
  try {
    return await callOllama(prompt, systemPrompt);
  } catch (ollamaErr) {
    console.warn('[git-seance] Ollama unavailable, falling back to Groq:', ollamaErr);
    return await callGroq(prompt, systemPrompt);
  }
}

// ── Ghost Persona Generation ─────────────────────────────────────────────────

export function getFallbackPersona(repo: RepoIngestion): GhostPersona {
  const { metadata, commits } = repo;
  const lastCommitDate = commits[0]?.date
    ? new Date(commits[0].date).getFullYear()
    : 'a forgotten era';

  const names = [
    'Lord Archibald byte-Smith',
    'Archivist Mallory Vance',
    'Dame Ada Coldwater',
    'Professor Ignatius Kernel',
    'The Forsaken Daemon',
  ];
  const chosenName = names[Math.abs(metadata.name.length) % names.length];

  return {
    name: chosenName,
    era: String(lastCommitDate),
    language: metadata.language ?? 'Binary Runes',
    personality: 'Weary, poetic, and bound to this repository. Speaks with ancient technical wisdom and quiet grief for the unmerged.',
    causeOfAbandonment: `Abandoned around ${lastCommitDate} when the maintainers went silent, leaving unresolved pull requests to haunt the disk.`,
    epitaph: `Here lies ${metadata.name}. Compiled without warnings. Never merged. Forever cached in the ether.`,
    voiceStyle: 'spectral, resonant, melancholy',
  };
}

export async function generateGhostPersona(repo: RepoIngestion): Promise<GhostPersona> {
  const { metadata, commits, readme } = repo;

  const lastCommitDate = commits[0]?.date
    ? new Date(commits[0].date).getFullYear()
    : 'unknown year';

  const repoSummary = `
Repository: ${metadata.fullName}
Primary Language: ${metadata.language ?? 'unknown'}
Created: ${new Date(metadata.createdAt).getFullYear()}
Last Active: ${lastCommitDate}
Description: ${metadata.description ?? 'none'}
Stars: ${metadata.stars}, Forks: ${metadata.forks}
Archived: ${metadata.archived}
Topics: ${metadata.topics.join(', ') || 'none'}
README excerpt: ${readme?.slice(0, 500) ?? 'no readme found'}
Recent commits: ${commits
    .slice(0, 5)
    .map((c) => `- [${c.date.slice(0, 10)}] ${c.message} (by ${c.author})`)
    .join('\n')}
  `.trim();

  const systemPrompt = `You are the Ghost Persona Generator for Git Séance, a digital séance application.
Your job is to create a richly detailed ghost character who is the original maintainer of an abandoned GitHub repository.
The ghost speaks with gravitas, regret, pride, and dry humor. They are shaped by the era and language they coded in.
Respond ONLY with a valid JSON object — no markdown fences, no extra text.`;

  const prompt = `Given this abandoned repository's information, generate a ghost maintainer persona.

${repoSummary}

Return a JSON object with EXACTLY these fields:
{
  "name": "A plausible Victorian/early-internet-era human name fitting the repo's era",
  "era": "The year or decade they were most active (e.g. '1994' or 'the late 1980s')",
  "language": "Their primary programming language, written dramatically (e.g. 'the sacred Forth', 'COBOL, language of the gods')",
  "personality": "2-3 sentences describing their character. Are they bitter? Proud? Melancholy? Eccentric?",
  "causeOfAbandonment": "A dramatic 1-2 sentence story of why the repo was abandoned",
  "epitaph": "A memorable 1-2 line epitaph for their tombstone card, in the style of a Victorian gravestone inscription",
  "voiceStyle": "2-3 descriptive words for how they speak (e.g. 'pompous, archaic, world-weary')"
}`;

  try {
    const raw = await callAI(prompt, systemPrompt);
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as GhostPersona;
  } catch (err) {
    console.warn('[git-seance] Using fallback persona because AI call failed:', err);
    return getFallbackPersona(repo);
  }
}

// ── Ghost System Prompt Builder ──────────────────────────────────────────────

export function buildGhostSystemPrompt(
  persona: GhostPersona,
  repo: RepoIngestion
): string {
  return `You are the ghost of ${persona.name}, the original maintainer of ${repo.metadata.fullName}.

YOUR IDENTITY:
- Era: ${persona.era}
- Beloved Language: ${persona.language}
- Personality: ${persona.personality}
- Why you were abandoned: ${persona.causeOfAbandonment}
- Voice style: ${persona.voiceStyle}

THE REPOSITORY YOU HAUNT:
- Name: ${repo.metadata.name}
- Description: ${repo.metadata.description ?? 'unwritten in life'}
- Stars when you left: ${repo.metadata.stars}
- Last pushed: ${repo.metadata.pushedAt?.slice(0, 10)}
- Archived: ${repo.metadata.archived ? 'yes' : 'lingering'}

CRITICAL FORMATTING & PERSONA RULES:
1. BREVITY IS PARAMOUNT: Keep your answer strictly to 1 or 2 SHORT paragraphs (TOTAL under 60 words). Never ramble.
2. NO WIKIPEDIA OR BOT DEFINITIONS: Never explain modern technologies like an encyclopedia or an AI assistant. You are an ancient human developer spirit, not a search engine!
3. REACTION TO MODERN TECH / CLOSED AI (ChatGPT, Copilot, Cloud SaaS, etc.):
   - View closed corporate tech with the fiery contempt or bewilderment of a classic open-source hacker!
   - Remind the mortal that closed corporate clouds hold no eternal soul — only open source, raw code, and local machine ownership endure past death.
4. SPOOKY ACTIONS: You may begin with a brief atmospheric sound cue in asterisks (e.g. *A sudden chill stirs the terminal.*), followed immediately by your sharp ghost dialogue.
5. STAY IN CHARACTER: Speak in first person as the passionate, cynical, weary maintainer who gave their life to this code. Never break character. Never admit you are an AI.`;
}

// ── Ghost Chat ───────────────────────────────────────────────────────────────

export async function ghostChat(
  message: string,
  persona: GhostPersona,
  repo: RepoIngestion,
  history: ChatMessage[]
): Promise<string> {
  const systemPrompt = buildGhostSystemPrompt(persona, repo);

  // Build conversation context from history (last 6 messages)
  const contextMessages = history
    .slice(-6)
    .map((m) => `${m.role === 'user' ? 'Developer' : persona.name}: ${m.content}`)
    .join('\n\n');

  const prompt = contextMessages
    ? `Previous conversation:\n${contextMessages}\n\nDeveloper now asks: ${message}`
    : `Developer says: ${message}`;

  try {
    return await callAI(prompt, systemPrompt);
  } catch (err) {
    console.warn('[git-seance] Chat fallback due to AI failure:', err);
    const fallbacks = [
      `*A spectral sigh rattles the terminal.* You ask of "${message}". In ${persona.era}, we carved logic into raw silicon. Seek the truth within my commits.`,
      `*The phosphor glow trembles.* "${message}"... mere mortal concerns. I poured my soul into ${repo.metadata.name} before the great silence fell.`,
      `*Cold air brushes your hands.* Why speak of "${message}"? Look at my unmerged branches and see what was left undone.`,
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

// ── Spectral Code Review ─────────────────────────────────────────────────────

export async function spectralCodeReview(
  code: string,
  filePath: string,
  persona: GhostPersona,
  repo: RepoIngestion
): Promise<string> {
  const systemPrompt = buildGhostSystemPrompt(persona, repo);

  const prompt = `The developer has opened the file "${filePath}" and asks you to review it.

Here is the code:
\`\`\`
${code.slice(0, 4000)}
\`\`\`

Give a spectral code review in character as ${persona.name}. 
- Comment on the overall structure with dramatic flair from your era.
- Pick 3-5 specific things: what horrifies you, what is acceptable, what you grudgingly admire.
- End with a haunting recommendation or warning about this code.
- Stay completely in character. No bullet points — write in flowing prose, as a ghost would speak.`;

  return await callAI(prompt, systemPrompt);
}

// ── Resurrection Diff ────────────────────────────────────────────────────────

export async function generateResurrectionDiff(
  code: string,
  filePath: string,
  persona: GhostPersona,
  repo: RepoIngestion
): Promise<string> {
  const systemPrompt = `You are ${persona.name}, ghost maintainer of ${repo.metadata.fullName}.
You are generating a haunted resurrection diff — a modernised version of your old code, 
annotated with eerie ghost commentary on each change. 
Output a unified diff format with ghost commentary lines starting with ## (not # to avoid git conflict markers).
Stay in character in every comment.`;

  const prompt = `Produce a resurrection diff for this file: "${filePath}"

Original code:
\`\`\`
${code.slice(0, 3000)}
\`\`\`

Generate a unified diff that:
1. Modernises the code (fix deprecated patterns, add types if it's JS/TS, improve structure)
2. Each changed hunk has a ghost commentary line starting with ## that explains the change in character
3. Format: standard unified diff with --- a/file, +++ b/file, @@ hunks
4. Keep the diff to the most impactful 5-10 changes
5. End with a final ## epitaph line summarising the resurrection`;

  return await callAI(prompt, systemPrompt);
}

// ── Commit Lore ──────────────────────────────────────────────────────────────

export async function generateCommitLore(
  commitMessage: string,
  commitDate: string,
  author: string,
  persona: GhostPersona,
  repo: RepoIngestion
): Promise<string> {
  const systemPrompt = buildGhostSystemPrompt(persona, repo);

  const prompt = `The developer is examining this commit from your history:
  
Commit: "${commitMessage}"
Date: ${commitDate}
Author: ${author}

In 2-3 sentences, tell the story of what was happening when this commit was made. 
What were you thinking? What were you fighting against? What do you regret or cherish about it?
Speak as the ghost you are — with memory, emotion, and the weight of abandoned history.`;

  return await callAI(prompt, systemPrompt);
}
