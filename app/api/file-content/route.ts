/**
 * app/api/file-content/route.ts
 * GET /api/file-content?owner=&repo=&path=
 * Returns the raw text of a file from a GitHub repo
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchFileContent } from '@/lib/github';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');
  const path = searchParams.get('path');

  if (!owner || !repo || !path) {
    return NextResponse.json({ error: 'owner, repo, and path are required' }, { status: 400 });
  }

  try {
    const content = await fetchFileContent(owner, repo, path);
    return NextResponse.json({ content });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 422 });
  }
}
