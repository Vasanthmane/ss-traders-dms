import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken, setTokenCookie } from '@/lib/auth';

function normalizeLoginId(value) {
  return String(value || '').trim().toLowerCase();
}

export async function POST(req) {
  try {
    const body = await req.json();
    const username = normalizeLoginId(body.username || body.email || body.loginId);
    const password = body.password;

    if (!username || !password) {
      return NextResponse.json({ error: 'Login ID and password are required' }, { status: 400 });
    }

    const candidateEmail = username.includes('@') ? username : `${username}@sstraders.com`;

    const rows = await query(
      'SELECT * FROM users WHERE lower(email) = $1 OR lower(email) = $2 LIMIT 1',
      [username, candidateEmail]
    );

    const user = rows[0];
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

    setTokenCookie(response, token);
    return response;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
