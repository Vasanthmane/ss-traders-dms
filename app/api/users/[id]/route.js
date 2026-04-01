import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function DELETE(req, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const userId = parseInt(params.id);
    if (userId === session.id)
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });

    await query('DELETE FROM users WHERE id=$1', [userId]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH: update assigned work IDs for a user
export async function PATCH(req, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const userId = parseInt(params.id);
    const { workIds } = await req.json();

    // Replace all assignments
    await query('DELETE FROM user_works WHERE user_id=$1', [userId]);
    if (workIds?.length) {
      await Promise.all(
        workIds.map(wid =>
          query('INSERT INTO user_works (user_id, work_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [userId, wid])
        )
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
