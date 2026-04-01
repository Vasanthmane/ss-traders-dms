import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let works;
    if (session.role === 'admin') {
      works = await query('SELECT * FROM works ORDER BY created_at DESC');
    } else {
      works = await query(
        `SELECT w.* FROM works w
         INNER JOIN user_works uw ON uw.work_id = w.id
         WHERE uw.user_id = $1
         ORDER BY w.created_at DESC`,
        [session.id]
      );
    }

    // Attach file counts per work
    const ids = works.map(w => w.id);
    let counts = [];
    if (ids.length > 0) {
      counts = await query(
        `SELECT work_id, folder_key, COUNT(*) as count
         FROM files WHERE work_id = ANY($1::int[])
         GROUP BY work_id, folder_key`,
        [ids]
      );
    }

    const countMap = {};
    counts.forEach(c => {
      if (!countMap[c.work_id]) countMap[c.work_id] = {};
      countMap[c.work_id][c.folder_key] = parseInt(c.count);
    });

    const result = works.map(w => ({ ...w, fileCounts: countMap[w.id] || {} }));
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { name, type, loa, location, notes } = await req.json();
    if (!name || !type) return NextResponse.json({ error: 'name and type required' }, { status: 400 });

    const rows = await query(
      'INSERT INTO works (name, type, loa, location, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, type, loa || null, location || null, notes || null]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
