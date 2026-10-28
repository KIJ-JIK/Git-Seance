/**
 * app/api/ghost/diff/route.ts
 * POST /api/ghost/diff
 * Body: { code, filePath, persona, repo }
 * Returns: { diff: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateResurrectionDiff } from '@/lib/ghost';

export async function POST(req: NextRequest) {
  try {
    const { code, filePath, persona, repo } = await req.json();
    if (!code || !filePath || !persona || !repo) {
      return NextResponse.json({ error: 'code, filePath, persona, and repo are required' }, { status: 400 });
    }
    const diff = await generateResurrectionDiff(code, filePath, persona, repo);
    return NextResponse.json({ diff });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
