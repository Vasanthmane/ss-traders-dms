import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

// GET /api/files?work_id=1&folder_key=inv
export async function GET(req) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const workId = searchParams.get('work_id');
    const folderKey = searchParams.get('folder_key');

    if (!workId || !folderKey)
      return NextResponse.json({ error: 'work_id and folder_key required' }, { status: 400 });

    // Non-admin: verify access
    if (session.role !== 'admin') {
      const access = await query(
        'SELECT 1 FROM user_works WHERE user_id=$1 AND work_id=$2',
        [session.id, workId]
      );
      if (!access.length) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const files = await query(
      `SELECT f.*, u.name as uploader_name
       FROM files f
       LEFT JOIN users u ON u.id = f.uploaded_by
       WHERE f.work_id=$1 AND f.folder_key=$2
       ORDER BY f.created_at DESC`,
      [workId, folderKey]
    );

    return NextResponse.json(files);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/files — save file metadata after successful R2 upload
export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { work_id, folder_key, name, r2_key, size, ext, description, file_date } = await req.json();

    if (!work_id || !folder_key || !name || !r2_key)
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    // Non-admin: verify access to this work
    if (session.role !== 'admin') {
      const access = await query(
        'SELECT 1 FROM user_works WHERE user_id=$1 AND work_id=$2',
        [session.id, work_id]
      );
      if (!access.length) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rows = await query(
      `INSERT INTO files (work_id, folder_key, name, r2_key, size, ext, description, file_date, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [work_id, folder_key, name, r2_key, size || null, ext || null,
       description || null, file_date || null, session.id]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
