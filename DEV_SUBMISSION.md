# Git Séance — DEV Challenge Week 4 Submission Guide

This file contains the complete copy-paste markdown post for your DEV.to submission.

## Submission Link:
Submit your post directly here:
👉 **[https://dev.to/new?prefill=...](https://dev.to/new?prefill=---%0Atitle%3A%20%0Apublished%3A%20%0Atags%3A%20devchallenge%2C%20hf26challenge%0A---%0A%0A%2AThis%20is%20a%20submission%20for%20the%20%5BHacktoberfest%20Open-Source%20AI%20Challenge%20Week%204%3A%20Ghost%20in%20the%20Machine%5D%28https%3A%2F%2Fdev.to%2Fchallenges%2Fhacktoberfest-week4-2026-10-26%29%2A%0A%0A%23%23%20What%20I%20Built%0A%3C%21--%20What%20does%20it%20do%2C%20and%20how%20did%20you%20interpret%20the%20theme%3F%20--%3E%0A%0A%23%23%20Demo%0A%3C%21--%20Show%20us%20your%20project%21%20A%20video%2C%20screenshots%2C%20or%20a%20live%20link.%20--%3E%0A%0A%23%23%20Why%20Open%20Innovation%20Matters%0A%3C%21--%20Why%20does%20open%20source%20matter%20for%20what%20you%20built%3F%20--%3E%0A%0A%23%23%20Development%20Journey%0A%3C%21--%20Tell%20us%20about%20your%20process.%20What%20went%20well%3F%20What%20did%20you%20learn%3F%20--%3E%0A%0A%23%23%20Prize%20Categories%0A%3C%21--%20Which%20partner%20categories%20are%20you%20entering%3F%20List%20every%20one%20that%20applies%2C%20or%20remove%20this%20section.%20--%3E)**

---

## Copy-Paste Body:

---
title: Git Séance — Summoning the Ghosts of Abandoned Repositories with Gemma 2
published: true
tags: devchallenge, hf26challenge, gemma, ai
cover_image: https://raw.githubusercontent.com/<your-username>/git-seance/main/public/assets/cover.png
canonical_url: https://git-seance.onrender.com
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26)*

> *"Every abandoned repository has a ghost. Every ghost has something left to say."*

---

## What I Built

**Git Séance** is an interactive, spectral necromancy suite for abandoned, archived, and forgotten open-source software. 

You provide any public GitHub repository URL that was left to decay in the digital graveyard. Git Séance traverses the repository's git commit graph, file tree, commit timestamps, and README, and uses **Gemma 2** to reincarnate the original maintainer as an interactive, fully voiced spectral persona from their specific programming era.

### Core Features:
- 👻 **Dynamic Ghost Persona Synthesis:** Gemma 2 analyzes commit dates, language idiosyncrasies, and abandonment patterns to reconstruct a historical maintainer spirit with era-accurate voice, personality, cause of abandonment, and gravestone epitaph.
- 💬 **Interactive Séance Chamber:** A retro CRT terminal where you converse with the spirit in character. The ghost speaks with pride, dry wit, and existential grief for unmerged pull requests.
- 👁 **Spectral Code Review:** Open any source file in the repository; the ghost reviews your modern edits through the lens of their era's computing paradigms.
- ⚡ **Resurrection Diff:** The spirit modernizes its own legacy code while annotating every hunk with eerie `##` commentary.
- 📜 **Commit Lore Narrator:** Click through the repository's historical commits to hear the ghost recount the human struggle, midnight crunch, and heartbreak behind each commit message.
- 🔊 **Spectral Voice (ElevenLabs):** Converts the maintainer's final words into a chilling, whispered spectral voice.
- 🪦 **Tombstone Memorial Export:** Generates an authentic Victorian stone memorial card with the repo's final stats, exportable directly to PNG.
- 🌸 **Ofrenda Mode (Día de los Muertos):** In honor of the challenge concluding on Halloween night as Día de los Muertos begins, users can switch the interface from cold Obsidian Séance glass into a warm altar of marigolds, candlelight, and festive remembrance.
- 🏚 **The Public Graveyard Wall:** Persistent memorial wall powered by MongoDB Atlas storing séanced projects for all visitors to pay respects.

---

## Demo

- **Live Web Application:** [https://git-seance.onrender.com](https://git-seance.onrender.com) (or [https://git-seance.tech](https://git-seance.tech))
- **Source Code (GitHub):** [https://github.com/<your-username>/git-seance](https://github.com/<your-username>/git-seance)

*(Embed your 45-second screen recording / GIF / DevRelay session link here showing the summoning of an ancient repo like coffee-script or jsdom)*

---

## Why Open Innovation Matters

In the era of proprietary, corporate-controlled AI, models are trained to optimize for the present commercial web while actively pruning or ignoring obscure computing history. Proprietary frontier models running behind closed APIs have neither the mandate nor the incentive to remember a 1994 Forth interpreter, an esoteric 2008 ActionScript engine, or a forgotten Perl script that once kept an entire university network online.

Closed AI turns digital heritage into corporate landfill: if an old codebase cannot generate enterprise SaaS ARR, it is treated as noise.

**Open innovation is the only antidote.** 

By building Git Séance on **Gemma 2** running locally on our own silicon via Ollama, we ensure that:
1. **Uncensored Digital Preservation:** No centralized provider decides which open-source history is "useful" enough to reflect upon.
2. **Local Sovereignty:** Anyone can run a complete séance offline, directly against archived git mirrors, without sending proprietary code or private keys across a network.
3. **Open Weight Transparency:** The weights belong to developers, just as the open-source codebases they haunt belonged to the hackers who wrote them.

Software does not die when it stops compiling; it dies when nobody remembers why it was written. Open-weight AI allows us to commune with the human developers who paved the road we walk today.

---

## Development Journey

### The Concept
When the prompt *"Ghost in the Machine"* dropped alongside the note that Week 4 concludes on Halloween as Día de los Muertos begins, the metaphor was irresistible. We often treat GitHub like a sterile utility, but git logs are fundamentally human memoirs. Every abandoned repository represents a moment where life intervened: a startup failed, someone graduated, priorities shifted, or a contributor passed away. 

### Architecture & Technical Stack
- **Framework:** Next.js 15 (App Router, React 19)
- **Open-Source AI Engine:** 
  - **Local Inference:** Gemma 2 (`gemma2:27b`) via Ollama with strict temperature and top-p tuning.
  - **Cloud Runtime:** Gemma 2 (`gemma2-9b-it`) hosted via high-throughput inference for zero-cold-start web demos.
- **Audio Synthesis:** Web Audio API procedural soundscape (synthesizing howling wind, crypt bells, bat flutters, and shivering oscillators in real-time) paired with ElevenLabs neural voice synthesis.
- **Data Layer:** MongoDB Atlas tracking immortalized tombstones for the global graveyard gallery.
- **Observability:** Sentry Next.js SDK monitoring model generation latency, token budgets, and API resilience.
- **Hosting & Infrastructure:** Render Web Service blueprint (`render.yaml`).

### Hurdles Overcome
The hardest challenge was prompt calibration. Early iterations produced ghosts that sounded like corporate LLMs pretending to be Victorian characters. We engineered strict prompt constraints:
- Brevity ceiling (under 60 words per dialogue turn).
- Absolute ban on encyclopedia/Wikipedia-style definitions.
- Deep, authentic open-source philosophical grounding (open code as eternal soul vs ephemeral closed SaaS).
- Contextual grounding directly from git trees, diffs, and commit author names.

---

## Prize Categories

We are entering Git Séance into the following categories:

- **Overall Grand Prize:** Built specifically for the "Ghost in the Machine" prompt, uniting Halloween atmosphere with Día de los Muertos celebration.
- **Best Use of Gemma ($200):** Gemma 2 powers both our local offline inference (`gemma2:27b`) and our cloud production pipeline (`gemma2-9b-it`), generating all ghost personalities, code reviews, and resurrection diffs.
- **Best Use of Render ($200):** Deployed and hosted via Render's native Node.js runtime using a version-controlled `render.yaml` infrastructure-as-code blueprint.
- **Best Use of ElevenLabs ($100):** Neural speech synthesis generating custom whispered maintainer voices with automated stripping of stage cues.
- **Best Use of MongoDB Atlas ($100):** Powers the public Graveyard Wall, persisting séanced repository tombstones with high-speed indexing.
- **Best Use of Sentry Agent Tracing ($100):** Integrated `@sentry/nextjs` for tracking generative AI latency, token pipelines, and runtime errors.
- **Best Use of a .tech Domain ($100):** Live at [git-seance.tech](https://git-seance.tech).

---

*“They compiled. They pushed. They were forgotten. Until tonight.”*
