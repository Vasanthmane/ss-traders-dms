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
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      router.push('/dashboard');
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 420, height: 420, left: '-6%', top: '-8%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.16), transparent 70%)', animation: 'softFloat 7s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, right: '-10%', top: '-10%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.18), transparent 70%)', animation: 'softFloat 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, left: '35%', bottom: '-18%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,74,0.14), transparent 70%)', animation: 'softFloat 9s ease-in-out infinite' }} />
      </div>

      <div className="panel fade-up" style={{ width: '100%', maxWidth: 1120, minHeight: 660, display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', overflow: 'hidden', position: 'relative' }}>
        <div style={{ padding: '54px 52px', position: 'relative', borderRight: '1px solid var(--border)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
            <div style={{ width: 58, height: 58, borderRadius: 18, background: 'linear-gradient(135deg, #fff3c8, #d4a84a)', color: '#141007', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 20, boxShadow: 'var(--shadow-gold)' }}>SST</div>
            <div>
              <div className="premium-title gold-text" style={{ fontSize: 30, fontWeight: 700 }}>SS Traders</div>
              <div style={{ color: 'var(--muted)', fontSize: 12, letterSpacing: '0.35em', textTransform: 'uppercase' }}>Document Management System</div>
            </div>
          </div>

          <div style={{ maxWidth: 520, marginTop: 36 }}>
            <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', padding: '8px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: 12, marginBottom: 24 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-2)', boxShadow: '0 0 14px rgba(74,222,128,0.5)' }} />
              Secure cloud document access for your team
            </div>
            <h1 className="premium-title aurora-text" style={{ fontSize: 62, lineHeight: 0.95, marginBottom: 18 }}>Premium internal workspace for files, teams, and approvals.</h1>
            <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.8, maxWidth: 460 }}>
              Centralize work folders, upload tender and invoice documents, manage user access, and keep every project searchable from anywhere.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginTop: 42, maxWidth: 600 }}>
            {[
              { label: 'Private Access', value: 'JWT + HttpOnly', color: 'var(--accent-2)' },
              { label: 'Storage Ready', value: 'Cloudflare R2', color: 'var(--accent-3)' },
              { label: 'Database', value: 'Neon Postgres', color: 'var(--accent)' },
            ].map((item) => (
              <div key={item.label} className="glass-card" style={{ borderRadius: 18, padding: '18px 16px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, boxShadow: `0 0 18px ${item.color}` }} />
                <div style={{ marginTop: 18, fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>{item.label}</div>
                <div style={{ marginTop: 8, fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '54px 46px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: 420, borderRadius: 28, padding: '32px 28px', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.04), transparent 22%)', borderRadius: 28, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.3em', fontWeight: 800, marginBottom: 8 }}>Sign in</div>
              <div className="premium-title" style={{ fontSize: 34, fontWeight: 700, marginBottom: 8 }}>Welcome back</div>
              <div style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 26 }}>Use your internal credentials to access projects and documents.</div>

              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>Username</label>
                  <input type="text" required autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. admin" />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>Password</label>
                  <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>

                {error && (
                  <div style={{ marginBottom: 18, borderRadius: 14, padding: '12px 14px', border: '1px solid rgba(255,107,129,0.22)', background: 'rgba(255,107,129,0.08)', color: '#ffd4db', fontSize: 13 }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-premium" style={{ width: '100%' }}>
                  {loading ? 'AUTHENTICATING…' : 'ENTER WORKSPACE'}
                </button>
              </form>

              <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', gap: 12, color: 'var(--muted)', fontSize: 12 }}>
                <span>Protected internal portal</span>
                <span>Premium UI v2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
