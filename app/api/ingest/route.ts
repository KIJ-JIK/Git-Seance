/**
 * app/api/ingest/route.ts
 * POST /api/ingest
 * Body: { url: string }
 * Returns: RepoIngestion
 */

import { NextRequest, NextResponse } from 'next/server';
import { ingestRepository } from '@/lib/github';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }
    const data = await ingestRepository(url);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 422 });
  }
}
