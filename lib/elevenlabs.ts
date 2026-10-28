/**
 * lib/elevenlabs.ts
 * ElevenLabs voice synthesis integration for ghost maintainer voice.
 */

export async function synthesizeGhostVoice(text: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID ?? 'ojn2kWeYf952uoRFN8K8';

  if (!apiKey) throw new Error('ElevenLabs API key not configured');

  // Strip stage directions like *a cold wind passes* so TTS only speaks natural dialogue
  const cleanedText = text
    .replace(/\*[^*]+\*/g, '') // remove *stage directions*
    .replace(/[_#`]/g, '')     // remove formatting characters
    .trim();

  if (!cleanedText) {
    throw new Error('No spoken text after stripping stage directions');
  }

  // Generous ceiling to prevent mid-sentence cutoff while keeping costs low
  const trimmed = cleanedText.slice(0, 1000);

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
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
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs error: ${res.status} — ${err}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
