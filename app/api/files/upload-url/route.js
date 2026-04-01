import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUploadUrl } from '@/lib/r2';

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { filename, contentType, workId, folderKey } = await req.json();
    if (!filename || !contentType || !workId || !folderKey)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    // Build a clean R2 key: works/{workId}/{folderKey}/{timestamp}-{filename}
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const r2Key = `works/${workId}/${folderKey}/${Date.now()}-${safeName}`;

    const uploadUrl = await getUploadUrl(r2Key, contentType);
    return NextResponse.json({ uploadUrl, r2Key });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
