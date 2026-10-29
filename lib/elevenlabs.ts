/**
 * lib/elevenlabs.ts
 * ElevenLabs neural voice synthesis integration for ghost maintainer voice.
 * Exclusively powered by ElevenLabs neural models.
 */

export interface VoiceResult {
  audio: Buffer;
  provider: 'elevenlabs';
}

const DEFAULT_API_KEY = 'sk_477ce4d3f55e621d03827ea6dcc8b39976eb9145d5804fc6';
const DEFAULT_VOICE_ID = 'LcaaNe2dsyAcAvOUA7al';

export async function synthesizeGhostVoice(text: string): Promise<VoiceResult> {
  const apiKey = (process.env.ELEVENLABS_API_KEY || DEFAULT_API_KEY).trim();
  const voiceId = (process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID).trim();

  // Strip stage directions like *a cold wind passes* so TTS only speaks dialogue
  const cleanedText = text
    .replace(/\*[^*]+\*/g, '') // remove *stage directions*
    .replace(/[_#`]/g, '')     // remove markdown formatting
    .trim();

  if (!cleanedText) {
    throw new Error('No spoken text after stripping stage directions');
  }

  const trimmed = cleanedText.slice(0, 1000);

  // ElevenLabs turbo v2.5 model: fast, ultra-realistic, preserves exact voice design
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text: trimmed,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.85,
        style: 0.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[git-seance] ElevenLabs API error ${res.status}:`, errText);
    throw new Error(`ElevenLabs error: ${res.status} — ${errText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return {
    audio: Buffer.from(arrayBuffer),
    provider: 'elevenlabs',
  };
}
