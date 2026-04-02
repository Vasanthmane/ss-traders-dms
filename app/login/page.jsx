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
    } catch { setError('Something went wrong.'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', position: 'relative', zIndex: 1,
    }}>
      {/* Left panel — brand */}
      <div style={{
        width: '52%', padding: '64px 56px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        borderRight: '1px solid var(--border)',
      }}>
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 16, color: '#fff',
              boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
            }}>SST</div>
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>SS Traders</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.2em' }}>DOCUMENT SUITE</div>
            </div>
          </div>

          {/* Hero */}
          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 52, fontWeight: 800, lineHeight: 1.05, color: 'var(--text)', marginBottom: 20 }}>
            Document<br />
            <span style={{ color: 'var(--blue-light)' }}>Control</span><br />
            Centre.
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75, maxWidth: 440 }}>
            Upload, organise and access every project file — tenders, invoices, drawings and certificates — from anywhere.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { l: 'Storage', v: 'Cloudflare R2' },
            { l: 'Database', v: 'Neon Postgres' },
            { l: 'Auth', v: 'JWT · Secure' },
          ].map(({ l, v }) => (
            <div key={l} style={{ borderTop: '1px solid var(--border)', paddingTop: 16, flex: 1 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.18em', marginBottom: 6 }}>{l.toUpperCase()}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40,
      }}>
        <div className="fade-up" style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: 'var(--blue-light)', letterSpacing: '0.2em', fontWeight: 600, marginBottom: 8 }}>SIGN IN</div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 28, color: 'var(--text)', marginBottom: 8 }}>Welcome back</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Enter your credentials to access the workspace.</div>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.15em', marginBottom: 7, fontWeight: 500 }}>USERNAME</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. admin" autoCapitalize="none" autoComplete="username" />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.15em', marginBottom: 7, fontWeight: 500 }}>PASSWORD</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            </div>

            {error && (
              <div style={{ marginBottom: 18, padding: '11px 14px', borderRadius: 10, background: 'var(--red-soft)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: 13 }}>{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%', borderRadius: 12 }}>
              {loading ? 'Signing in…' : 'Enter Workspace →'}
            </button>
          </form>

          <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 10, background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)', fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--green)', fontSize: 10 }}>●</span>
            Secured with JWT + httpOnly cookies. Your session expires in 7 days.
          </div>
        </div>
      </div>
    </div>
  );
}
