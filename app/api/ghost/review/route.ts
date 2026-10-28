/**
 * app/api/ghost/review/route.ts
 * POST /api/ghost/review
 * Body: { code, filePath, persona, repo }
 * Returns: { review: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { spectralCodeReview } from '@/lib/ghost';

export async function POST(req: NextRequest) {
  try {
    const { code, filePath, persona, repo } = await req.json();
    if (!code || !filePath || !persona || !repo) {
      return NextResponse.json({ error: 'code, filePath, persona, and repo are required' }, { status: 400 });
    }
    const review = await spectralCodeReview(code, filePath, persona, repo);
    return NextResponse.json({ review });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 });
  }
}
