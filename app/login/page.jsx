'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
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
        body: JSON.stringify({ username: loginId.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Unable to sign in right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-shell panel fade-up">
        <section className="login-brand-side">
          <div className="login-brand-row">
            <div className="login-mark">SST</div>
            <div>
              <div className="login-brand-name">SS Traders</div>
              <div className="login-brand-sub">Document Management Suite</div>
            </div>
          </div>

          <div className="login-badge">
            <span className="login-badge-dot" />
            Secure internal access
          </div>

          <h1 className="login-hero-title premium-title">
            Enterprise document control for active works, approvals, and shared files.
          </h1>

          <p className="login-hero-copy">
            Manage project folders, user access, uploads, previews, and downloads from one controlled internal system.
          </p>

          <div className="login-metrics-grid">
            <div className="login-metric-card glass-card">
              <span className="metric-kicker">Access</span>
              <strong>Role based control</strong>
              <span>Admin and limited user access</span>
            </div>
            <div className="login-metric-card glass-card">
              <span className="metric-kicker">Storage</span>
              <strong>Centralized records</strong>
              <span>Work folders with live file tracking</span>
            </div>
            <div className="login-metric-card glass-card">
              <span className="metric-kicker">Delivery</span>
              <strong>Preview and download</strong>
              <span>View key files without leaving the portal</span>
            </div>
          </div>
        </section>

        <section className="login-form-side">
          <div className="login-form-card glass-card">
            <div className="login-form-topline">Sign in</div>
            <div className="login-form-title premium-title">Access control center</div>
            <div className="login-form-copy">Use your assigned login ID and password to enter the system.</div>

            <form onSubmit={handleLogin} className="login-form-grid">
              <div>
                <label className="login-label">Login ID</label>
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="admin@sstraders.com or admin"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="login-label">Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error ? <div className="login-error">{error}</div> : null}

              <button type="submit" className="btn-premium login-submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Enter system'}
              </button>
            </form>

            <div className="login-footer-row">
              <span>Protected internal portal</span>
              <span>SS Traders</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
