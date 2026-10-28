# 🪦 Git Séance

> *Every abandoned repository has a ghost. Every ghost has something left to say.*

**Git Séance** is a digital séance for abandoned, archived, and forgotten open-source repositories. Point it at any GitHub URL, and it will summon the ghost of the original maintainer — powered entirely by open-weight AI running locally.

[![Deploy on Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

## ✨ Features

| Feature | Description |
|---------|-------------|
| 👻 **Ghost Persona** | AI constructs a unique ghost character from the repo's history, language, and commits |
| 💬 **Séance Chat** | Interactive terminal where you talk with the ghost maintainer in character |
| 👁 **Spectral Code Review** | Ghost reviews your files from their era's perspective |
| ⚡ **Resurrection Diff** | Ghost generates a haunted modernisation diff with eerie annotations |
| 📜 **Commit Lore** | Ghost narrates the story behind each commit |
| 🔊 **Ghost Voice** | ElevenLabs synthesises the ghost's whispered voice |
| 🪦 **Tombstone Export** | Export a styled memorial card as PNG |
| 🌸 **Ofrenda Mode** | Día de los Muertos skin — marigold, candlelight, celebration |
| 🏚 **Graveyard Wall** | Public gallery of all séanced repositories |

## 🏗 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **AI Model:** Gemma 2 via Ollama (local) + Groq fallback
- **Voice:** ElevenLabs API
- **Database:** MongoDB Atlas
- **Observability:** Sentry
- **Hosting:** Render
- **Domain:** git-seance.tech

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- [Ollama](https://ollama.ai) installed (for local Gemma) — `ollama pull gemma2:27b`

### Setup

```bash
git clone https://github.com/your-username/git-seance
cd git-seance
npm install
cp .env.local.example .env.local
# Fill in your API keys in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter any public GitHub URL.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OLLAMA_BASE_URL` | Optional | Ollama endpoint (default: `http://localhost:11434`) |
| `OLLAMA_MODEL` | Optional | Model name (default: `gemma2:27b`) |
| `GROQ_API_KEY` | For demo | Fallback when Ollama not running |
| `ELEVENLABS_API_KEY` | Optional | Ghost voice synthesis |
| `ELEVENLABS_VOICE_ID` | Optional | ElevenLabs voice to use |
| `MONGODB_URI` | Optional | Atlas connection string for graveyard |
| `SENTRY_DSN` | Optional | Error + trace monitoring |
| `GITHUB_TOKEN` | Optional | Increases GitHub API rate limit |

## 🌍 Deploy to Render

1. Fork this repo
2. Create a new Web Service on Render pointing to your fork
3. Set all environment variables in Render's dashboard
4. Deploy — live in minutes

## 🏆 Hacktoberfest 2026

Built for the [Hacktoberfest Week 4 Challenge](https://dev.to/challenges/hacktoberfest-week4-2026-10-26) — **Ghost in the Machine**.

**Why open innovation matters here:**
Closed proprietary APIs would never preserve or index a 1992 Forth interpreter or an abandoned ActionScript library. Open-weight models running locally are the only technology that can conduct a séance across decades of forgotten code without a corporate intermediary deciding what history is worth remembering.

## 📜 License

MIT — because ghosts believe in freedom.

---

*"They compiled. They pushed. They were forgotten."*
