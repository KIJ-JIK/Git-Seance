/**
 * app/api/graveyard/route.ts
 * GET  /api/graveyard        — fetch all tombstones
 * POST /api/graveyard        — save a new tombstone
 */

import { NextRequest, NextResponse } from 'next/server';
import { saveTombstone, getTombstones } from '@/lib/mongodb';

export async function GET() {
  try {
    const tombstones = await getTombstones(24);
    return NextResponse.json({ tombstones });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Database unavailable' }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, repo_url, repo_name, ghost_name, ghost_era, language, epitaph, last_commit_date } = body;

    if (!repo_url || !ghost_name || !epitaph) {
      return NextResponse.json({ error: 'repo_url, ghost_name, and epitaph are required' }, { status: 400 });
    }

    const id = await saveTombstone({
      session_id: session_id ?? crypto.randomUUID(),
      repo_url,
      repo_name: repo_name ?? repo_url,
      ghost_name,
      ghost_era: ghost_era ?? 'unknown era',
      language: language ?? 'unknown',
      epitaph,
      last_commit_date: last_commit_date ?? '',
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed to save tombstone' }, { status: 500 });
  }
}
