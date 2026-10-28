/**
 * app/api/ghost/chat/route.ts
 * POST /api/ghost/chat
 * Body: { message, persona, repo, history }
 * Returns: { response: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { ghostChat } from '@/lib/ghost';

export async function POST(req: NextRequest) {
  try {
    const { message, persona, repo, history = [] } = await req.json();
    if (!message || !persona || !repo) {
      return NextResponse.json({ error: 'message, persona, and repo are required' }, { status: 400 });
    }
    const response = await ghostChat(message, persona, repo, history);
    return NextResponse.json({ response });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
