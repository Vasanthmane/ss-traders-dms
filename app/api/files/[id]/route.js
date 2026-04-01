import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { deleteFile as r2Delete } from '@/lib/r2';

export async function DELETE(req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const fileId = parseInt(params.id);
    const rows = await query('SELECT * FROM files WHERE id=$1', [fileId]);
    const file = rows[0];
    if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Non-admin can only delete their own uploads
    if (session.role !== 'admin' && file.uploaded_by !== session.id)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await r2Delete(file.r2_key).catch(() => {});
    await query('DELETE FROM files WHERE id=$1', [fileId]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
