/**
 * app/api/ghost/commit-lore/route.ts
 * POST /api/ghost/commit-lore
 * Body: { commitMessage, commitDate, author, persona, repo }
 * Returns: { lore: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCommitLore } from '@/lib/ghost';

export async function POST(req: NextRequest) {
  try {
    const { commitMessage, commitDate, author, persona, repo } = await req.json();
    if (!commitMessage || !persona || !repo) {
      return NextResponse.json({ error: 'commitMessage, persona, and repo are required' }, { status: 400 });
    }
    const lore = await generateCommitLore(commitMessage, commitDate, author, persona, repo);
    return NextResponse.json({ lore });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
