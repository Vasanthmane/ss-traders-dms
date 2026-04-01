import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { deleteFile } from '@/lib/r2';

export async function DELETE(req, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const workId = parseInt(params.id);

    // Get all files in this work so we can delete from R2
    const files = await query('SELECT r2_key FROM files WHERE work_id = $1', [workId]);
    await Promise.all(files.map(f => deleteFile(f.r2_key).catch(() => {})));

    // Cascade deletes files + user_works via DB constraints
    await query('DELETE FROM works WHERE id = $1', [workId]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
