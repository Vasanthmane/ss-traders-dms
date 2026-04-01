import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function DELETE(req, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const rows = await query('SELECT is_system FROM folder_types WHERE id=$1', [params.id]);
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (rows[0].is_system) return NextResponse.json({ error: 'Cannot delete built-in folder types' }, { status: 400 });
    await query('DELETE FROM folder_types WHERE id=$1', [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
