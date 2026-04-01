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
    <div className="login-root">
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 420, height: 420, left: '-4%', top: '-8%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(87,242,135,0.16), transparent 70%)', animation: 'softFloat 7s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 520, height: 520, right: '-10%', top: '-12%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.18), transparent 70%)', animation: 'softFloat 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 480, height: 480, left: '40%', bottom: '-16%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,209,102,0.14), transparent 70%)', animation: 'softFloat 9s ease-in-out infinite' }} />
      </div>

      <div className="login-shell fade-up">
        <div className="login-side">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 58, height: 58, borderRadius: 18, background: 'linear-gradient(135deg, #fff3c8, #ffd166)', color: '#141007', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 20, boxShadow: 'var(--shadow-gold)' }}>SST</div>
            <div>
              <div className="premium-title gold-text" style={{ fontSize: 32, fontWeight: 700 }}>SS Traders</div>
              <div style={{ color: 'var(--muted)', fontSize: 12, letterSpacing: '0.35em', textTransform: 'uppercase' }}>Document Command Center</div>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, marginTop: 52 }}>
            <div className="login-chip"><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-2)', boxShadow: '0 0 14px rgba(87,242,135,0.55)' }} />Always-on project archive</div>
            <h1 className="premium-title aurora-text" style={{ fontSize: 72, lineHeight: 0.94, fontWeight: 700, marginTop: 22 }}>Control every file, team, and approval flow.</h1>
            <p style={{ marginTop: 20, maxWidth: 500, color: 'var(--muted)', fontSize: 16, lineHeight: 1.8 }}>A brighter, faster internal system for work folders, tenders, invoices, certificates, and controlled access across your organization.</p>
          </div>

          <div className="login-grid" style={{ position: 'relative', zIndex: 1 }}>
            {[
              { label: 'Access', value: 'Role managed', color: 'var(--accent-2)' },
              { label: 'Storage', value: 'Cloud-first', color: 'var(--accent-4)' },
              { label: 'Visibility', value: 'Always searchable', color: 'var(--accent-5)' },
            ].map((item) => (
              <div key={item.label} className="login-stat">
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, boxShadow: `0 0 18px ${item.color}` }} />
                <div style={{ marginTop: 18, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 11 }}>{item.label}</div>
                <div style={{ marginTop: 8, fontSize: 15, fontWeight: 800 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', placeItems: 'center', padding: 30 }}>
          <div className="login-card">
            <div style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.28em', fontWeight: 800, marginBottom: 8 }}>Secure sign in</div>
            <h1>Welcome back</h1>
            <p>Use your internal credentials to access projects, users, folder controls, and live document operations.</p>

            <form onSubmit={handleLogin} style={{ marginTop: 24 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. admin or admin@sstraders.com" autoComplete="username" required />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />
              </div>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" disabled={loading} className="btn-premium" style={{ width: '100%', marginTop: 18 }}>
                {loading ? 'Authenticating…' : 'Enter workspace'}
              </button>
            </form>

            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', gap: 12, color: 'var(--muted)', fontSize: 12 }}>
              <span>Protected internal portal</span>
              <span>Live workspace UI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
