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
    <div className="login-shell">
      <div className="login-card panel fade-up">
        <div className="login-left">
          <div className="login-brand">
            <div className="login-brand-mark">SST</div>
            <div>
              <div className="premium-title login-brand-title">SS Traders</div>
              <div className="login-brand-sub">Document Management Suite</div>
            </div>
          </div>

          <div className="login-badge">
            <span className="login-badge-dot" />
            Secure internal document control
          </div>

          <div className="premium-title login-hero-title">
            <div className="login-hero-line-1">Document</div>
            <div className="login-hero-line-2">Operations</div>
            <div className="login-hero-line-3">for teams and approvals.</div>
          </div>

          <p className="login-hero-copy">
            Manage work folders, upload project records, control access by user,
            and keep every file available in one internal system from anywhere.
          </p>

          <div className="login-metrics">
            <div className="glass-card login-metric">
              <div className="mono-font login-metric-k">Access Layer</div>
              <div className="login-metric-v">JWT + HttpOnly</div>
            </div>
            <div className="glass-card login-metric">
              <div className="mono-font login-metric-k">Storage</div>
              <div className="login-metric-v">Cloudflare R2</div>
            </div>
            <div className="glass-card login-metric">
              <div className="mono-font login-metric-k">Metadata</div>
              <div className="login-metric-v">Neon Postgres</div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="glass-card login-form-wrap">
            <div className="mono-font login-form-eyebrow">Sign In</div>
            <div className="premium-title login-form-title">Welcome back</div>
            <div className="login-form-copy">
              Use your internal credentials to access works, folders, and files.
            </div>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 14 }}>
                <label className="login-form-label">Username</label>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="e.g. admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label className="login-form-label">Password</label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <div className="login-error">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="btn-premium"
                style={{ width: '100%' }}
              >
                {loading ? 'Authenticating…' : 'Enter Workspace'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
