/**
 * lib/elevenlabs.ts
 * ElevenLabs voice synthesis integration for ghost maintainer voice,
 * with seamless neural audio fallback when quota is reached or key is locked.
 */

export interface VoiceResult {
  audio: Buffer;
  provider: 'elevenlabs' | 'spectral-fallback';
  quotaWarning?: string;
}

export async function synthesizeGhostVoice(
  text: string,
  customApiKey?: string,
  customVoiceId?: string
): Promise<VoiceResult> {
  const apiKey = (customApiKey || process.env.ELEVENLABS_API_KEY || '').trim();
  const voiceId = (customVoiceId || process.env.ELEVENLABS_VOICE_ID || 'ojn2kWeYf952uoRFN8K8').trim();

  // Strip stage directions like *a cold wind passes* so TTS only speaks natural dialogue
  const cleanedText = text
    .replace(/\*[^*]+\*/g, '') // remove *stage directions*
    .replace(/[_#`]/g, '')     // remove formatting characters
    .trim();

  if (!cleanedText) {
    throw new Error('No spoken text after stripping stage directions');
  }

  // 1. Attempt ElevenLabs if API key is present
  if (apiKey) {
    try {
      const trimmed = cleanedText.slice(0, 1000);
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: trimmed,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.32,
            similarity_boost: 0.75,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
      });

      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        return {
          audio: Buffer.from(arrayBuffer),
          provider: 'elevenlabs',
        };
      }

      const errText = await res.text();
      console.warn(`[git-seance] ElevenLabs ${res.status}: ${errText}. Falling back to neural spectral audio.`);
    } catch (err: any) {
      console.warn('[git-seance] ElevenLabs network error, falling back:', err?.message || err);
    }
  }

  // 2. High-quality neural audio fallback
  try {
    const chunks = cleanedText.match(/.{1,160}(\s|$)/g) || [cleanedText.slice(0, 300)];
    const buffers: Buffer[] = [];
    for (const chunk of chunks.slice(0, 3)) {
      const q = encodeURIComponent(chunk.trim());
      const res = await fetch(
        `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${q}`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        }
      );
      if (res.ok) {
        const chunkBuf = await res.arrayBuffer();
        buffers.push(Buffer.from(chunkBuf));
      }
    }
    if (buffers.length > 0) {
      return {
        audio: Buffer.concat(buffers),
        provider: 'spectral-fallback',
        quotaWarning: 'ElevenLabs quota exhausted or locked; falling back to spectral voice.',
      };
    }
  } catch (err) {
    console.warn('[git-seance] Backup TTS failed:', err);
  }

  throw new Error('All voice synthesis providers failed');
}
