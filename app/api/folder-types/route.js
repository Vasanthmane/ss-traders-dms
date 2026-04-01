import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json(await query('SELECT * FROM folder_types ORDER BY is_system DESC, created_at'));
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { name, icon, color } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const key = name.toLowerCase().replace(/[^a-z0-9]/g,'').substring(0,8) + '_' + Date.now().toString().slice(-4);
    const rows = await query(
      'INSERT INTO folder_types (key, name, icon, color, is_system) VALUES ($1,$2,$3,$4,false) RETURNING *',
      [key, name.trim(), icon || '📁', color || '#5b6cf5']
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
