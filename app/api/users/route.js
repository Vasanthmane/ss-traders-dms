import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

function normalizeLoginId(value) {
  return String(value || '').trim().toLowerCase();
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
              COALESCE(json_agg(uw.work_id ORDER BY uw.work_id) FILTER (WHERE uw.work_id IS NOT NULL), '[]') AS work_ids
       FROM users u
       LEFT JOIN user_works uw ON uw.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
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
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const name = String(body.name || '').trim();
    const email = normalizeLoginId(body.email || body.username || body.loginId);
    const password = String(body.password || '');
    const role = body.role === 'admin' ? 'admin' : 'user';
    const workIds = Array.isArray(body.workIds) ? body.workIds : [];

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, login ID, and password are required' }, { status: 400 });
    }

    const exists = await query('SELECT id FROM users WHERE lower(email) = $1 LIMIT 1', [email]);
    if (exists[0]) {
      return NextResponse.json({ error: 'Login ID already exists' }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    const rows = await query(
      'INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role',
      [name, email, hash, role]
    );

    const user = rows[0];

    if (workIds.length) {
      await Promise.all(
        workIds.map((wid) =>
          query('INSERT INTO user_works (user_id, work_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [user.id, wid])
        )
      );
    }

    return NextResponse.json({ ...user, work_ids: workIds }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
