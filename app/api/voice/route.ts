/**
 * app/api/voice/route.ts
 * POST /api/voice
 * Body: { text: string }
 * Returns: audio/mpeg stream
 */

import { NextRequest, NextResponse } from 'next/server';
import { synthesizeGhostVoice } from '@/lib/elevenlabs';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }
    const audioBuffer = await synthesizeGhostVoice(text);
    // Use ArrayBuffer for NextResponse compatibility across Node/Edge runtimes
    const arrayBuffer = audioBuffer.buffer.slice(
      audioBuffer.byteOffset,
      audioBuffer.byteOffset + audioBuffer.byteLength
    ) as ArrayBuffer;
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Voice synthesis failed' }, { status: 500 });
  }
}
