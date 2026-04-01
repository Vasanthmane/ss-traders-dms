import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { getDownloadUrl } from '@/lib/r2';

export async function GET(req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const fileId = parseInt(params.id);
    const rows = await query('SELECT * FROM files WHERE id=$1', [fileId]);
    const file = rows[0];
    if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Non-admin: check access to the work
    if (session.role !== 'admin') {
      const access = await query(
        'SELECT 1 FROM user_works WHERE user_id=$1 AND work_id=$2',
        [session.id, file.work_id]
      );
      if (!access.length) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = await getDownloadUrl(file.r2_key, file.name);
    return NextResponse.json({ url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
