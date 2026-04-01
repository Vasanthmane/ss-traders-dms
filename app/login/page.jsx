'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      router.push('/dashboard');
    } catch { setError('Something went wrong. Try again.'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position:'absolute', top:'-15%', left:'-10%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(232,160,32,0.07), transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(91,108,245,0.07), transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 62, height: 62,
            background: 'linear-gradient(135deg, #e8a020, #f5c842)',
            borderRadius: 14, margin: '0 auto 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#000', fontWeight: 900,
            boxShadow: '0 8px 30px rgba(232,160,32,0.35)',
          }}>SST</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 5, color: 'var(--text)' }}>S S TRADERS</div>
          <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: 5, marginTop: 5 }}>DOCUMENT MANAGEMENT SYSTEM</div>
        </div>

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '32px 28px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}>
          <div style={{ marginBottom: 26 }}>
            <div style={{ fontSize: 9, letterSpacing: 4, color: 'var(--muted)', marginBottom: 6 }}>SIGN IN</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 2, color: 'var(--text)' }}>Access Your Documents</div>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: 3, display: 'block', marginBottom: 7 }}>USERNAME</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. admin" autoComplete="username" autoCapitalize="none" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: 3, display: 'block', marginBottom: 7 }}>PASSWORD</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            </div>

            {error && (
              <div style={{
                background: 'rgba(240,64,96,0.1)', border: '1px solid rgba(240,64,96,0.25)',
                borderRadius: 7, padding: '10px 14px', fontSize: 12, color: 'var(--red)', marginBottom: 16,
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? 'rgba(232,160,32,0.08)' : 'linear-gradient(135deg, rgba(232,160,32,0.22), rgba(245,200,66,0.12))',
              border: '1px solid rgba(232,160,32,0.4)', borderRadius: 10,
              color: 'var(--accent)', fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 700, fontSize: 12, letterSpacing: 2,
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(232,160,32,0.12)',
            }}>
              {loading ? 'AUTHENTICATING…' : 'SIGN IN →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
