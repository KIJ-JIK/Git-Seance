/**
 * app/api/ghost/persona/route.ts
 * POST /api/ghost/persona
 * Body: { repo: RepoIngestion }
 * Returns: { persona: GhostPersona }
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateGhostPersona } from '@/lib/ghost';

export async function POST(req: NextRequest) {
  try {
    const { repo } = await req.json();
    if (!repo) {
      return NextResponse.json({ error: 'repo is required' }, { status: 400 });
    }
    const persona = await generateGhostPersona(repo);
    return NextResponse.json({ persona });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
