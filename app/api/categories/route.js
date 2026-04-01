import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json(await query('SELECT * FROM work_categories ORDER BY created_at'));
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { name, color } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const rows = await query(
      'INSERT INTO work_categories (name, color) VALUES ($1, $2) RETURNING *',
      [name.trim(), color || '#e8a020']
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) {
    if (e.message?.includes('unique')) return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
    console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
