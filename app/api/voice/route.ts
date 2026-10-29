/**
 * app/api/voice/route.ts
 * POST /api/voice
 * Body: { text: string, apiKey?: string, voiceId?: string }
 * Returns: audio/mpeg stream
 */

import { NextRequest, NextResponse } from 'next/server';
import { synthesizeGhostVoice } from '@/lib/elevenlabs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = body.text;
    const customApiKey = (req.headers.get('x-elevenlabs-key') || body.apiKey || '').trim();
    const customVoiceId = (req.headers.get('x-elevenlabs-voice-id') || body.voiceId || '').trim();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const { audio, provider, quotaWarning } = await synthesizeGhostVoice(
      text,
      customApiKey || undefined,
      customVoiceId || undefined
    );

    const arrayBuffer = audio.buffer.slice(
      audio.byteOffset,
      audio.byteOffset + audio.byteLength
    ) as ArrayBuffer;

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audio.length.toString(),
        'X-Voice-Provider': provider,
        ...(quotaWarning ? { 'X-Voice-Warning': quotaWarning } : {}),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Voice synthesis failed' }, { status: 500 });
  }
}
