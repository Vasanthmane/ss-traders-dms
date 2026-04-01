import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const users = await query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
              COALESCE(json_agg(uw.work_id) FILTER (WHERE uw.work_id IS NOT NULL), '[]') as work_ids
       FROM users u
       LEFT JOIN user_works uw ON uw.user_id = u.id
       GROUP BY u.id ORDER BY u.created_at`
    );
    return NextResponse.json(users);
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

    const { name, email, password, role, workIds } = await req.json();
    if (!name || !email || !password)
      return NextResponse.json({ error: 'name, email, password required' }, { status: 400 });

    const hash = await bcrypt.hash(password, 10);
    const rows = await query(
      'INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id,name,email,role',
      [name, email.toLowerCase(), hash, role || 'user']
    );
    const user = rows[0];

    // Assign works
    if (workIds?.length) {
      await Promise.all(
        workIds.map(wid =>
          query('INSERT INTO user_works (user_id, work_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [user.id, wid])
        )
      );
    }

    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    if (e.message?.includes('unique')) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
