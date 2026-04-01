'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import FolderView from './FolderView';
import AddWorkModal from './AddWorkModal';
import UsersPanel from './UsersPanel';
import SettingsPanel from './SettingsPanel';

const FOLDER_DEFS = [
  { key: 'quo',  name: 'Quotation',      icon: '📋', color: '#ff355e' },
  { key: 'ten',  name: 'Tender',         icon: '📁', color: '#8b5cf6' },
  { key: 'inv',  name: 'Invoice',        icon: '🧾', color: '#f7c948' },
  { key: 'bill', name: 'Bills',          icon: '💳', color: '#ff5f7f' },
  { key: 'draw', name: 'Drawings',       icon: '📐', color: '#c084fc' },
  { key: 'cert', name: 'Certificates',   icon: '🏅', color: '#ffd86b' },
  { key: 'cor',  name: 'Correspondence', icon: '✉️', color: '#ffffff' },
  { key: 'misc', name: 'Miscellaneous',  icon: '📎', color: '#b98cff' },
];

export default function DashboardClient({ session }) {
  const router = useRouter();

  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeWorkId, setActiveWorkId] = useState(null);
  const [activeFolder, setActiveFolder] = useState(null);
  const [showAddWork, setShowAddWork] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tick, setTick] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchWorks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/works', { cache: 'no-store' });
      const data = await res.json();
      setWorks(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  async function handleDeleteWork(id) {
    if (!confirm('Delete this work and all its files?')) return;
    await fetch(`/api/works/${id}`, { method: 'DELETE' });
    setActiveWorkId(null);
    setActiveFolder(null);
    await fetchWorks();
  }

  const filteredWorks = useMemo(() => {
    return works.filter((w) => {
      const matchesType = typeFilter === 'all' || w.type === typeFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (w.name || '').toLowerCase().includes(q) ||
        (w.location || '').toLowerCase().includes(q) ||
        (w.loa || '').toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [works, search, typeFilter]);

  const activeWork = works.find((w) => w.id === activeWorkId) || null;
  const totalFiles = activeWork
    ? Object.values(activeWork.fileCounts || {}).reduce((a, b) => a + b, 0)
    : 0;

  const timeStr = new Date(tick).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).toLowerCase();

  const allFilesCount = works.reduce(
    (sum, w) => sum + Object.values(w.fileCounts || {}).reduce((a, b) => a + b, 0),
    0
  );

  return (
    <div className="top-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">SST</div>
          <div>
            <div className="brand-title">SS Traders</div>
            <div className="brand-subtitle">Document Management Suite</div>
          </div>
        </div>

        <div className="top-actions">
          <button
            className="nav-pill home"
            onClick={() => {
              setShowUsers(false);
              setShowSettings(false);
              setActiveWorkId(null);
              setActiveFolder(null);
            }}
          >
            ⌂ Home
          </button>

          <div className="nav-pill time mono-font">{timeStr}</div>

          <button
            className={`nav-pill ${showSettings ? 'active-violet' : ''}`}
            onClick={() => {
              setShowSettings(true);
              setShowUsers(false);
              setActiveWorkId(null);
              setActiveFolder(null);
            }}
          >
            ⚙ Settings
          </button>

          {session.role === 'admin' && (
            <button
              className={`nav-pill ${showUsers ? 'active-violet' : ''}`}
              onClick={() => {
                setShowUsers(true);
                setShowSettings(false);
                setActiveWorkId(null);
                setActiveFolder(null);
              }}
            >
              👥 Users
            </button>
          )}

          <div className="nav-pill user-pill">
            <span style={{ color: 'var(--yellow)' }}>●</span>
            <span>{session.name}</span>
            <span>/</span>
            <strong>{session.role.toUpperCase()}</strong>
          </div>

          <button className="nav-pill signout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="layout-body">
        <aside className="sidebar">
          <div className="panel sidebar-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
              <div>
                <div className="sidebar-section-label">Workspace</div>
                <div className="sidebar-title">Works library</div>
              </div>
              <div className="sidebar-count">{filteredWorks.length}</div>
            </div>

            <div style={{ marginTop: 14 }}>
              <input
                className="search-input"
                placeholder="Search works, LOA, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-row">
              <button
                className={`filter-pill ${typeFilter === 'all' ? 'active-yellow' : ''}`}
                onClick={() => setTypeFilter('all')}
              >
                All
              </button>

              <button
                className={`filter-pill ${typeFilter === 'proprietor' ? 'active-violet' : ''}`}
                onClick={() => setTypeFilter('proprietor')}
              >
                Proprietor
              </button>

              <button
                className={`filter-pill ${typeFilter === 'partnership' ? 'active-violet' : ''}`}
                onClick={() => setTypeFilter('partnership')}
              >
                Partnership
              </button>
            </div>

            <div style={{ marginTop: 14 }}>
              <button className="btn-ghost" style={{ width: '100%', justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
                <span>Quick focus</span>
                <span className="mono-font">⌘ / Ctrl + K</span>
              </button>
            </div>
          </div>

          {filteredWorks.length > 0 ? (
            filteredWorks.slice(0, 4).map((w) => {
              const count = Object.values(w.fileCounts || {}).reduce((a, b) => a + b, 0);
              return (
                <div
                  key={w.id}
                  className="panel sidebar-mini"
                  onClick={() => {
                    setActiveWorkId(w.id);
                    setShowUsers(false);
                    setShowSettings(false);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <div className="sidebar-section-label" style={{ color: w.type === 'proprietor' ? 'var(--yellow)' : 'var(--violet-2)', marginBottom: 8 }}>
                      {w.type}
                    </div>
                    <div className="sidebar-mini-title">{w.name}</div>
                    <div className="sidebar-mini-sub">{w.location || 'Location not set'}</div>
                  </div>

                  <div className="sidebar-mini-count">
                    <strong>{count}</strong>
                    <span>Files</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="panel sidebar-mini">
              <div>
                <div className="sidebar-mini-title">No works found</div>
                <div className="sidebar-mini-sub">
                  Adjust filters or add a new work to get started.
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 'auto' }} className="panel sidebar-card">
            <div className="sidebar-section-label">Premium Shortcuts</div>
            <div className="sidebar-shortcut-line">
              <span>Top work</span>
              <strong style={{ color: 'var(--yellow)' }}>{works[0]?.name || 'Example'}</strong>
            </div>
            <div className="sidebar-shortcut-line">
              <span>Total files</span>
              <strong style={{ color: 'var(--violet-2)' }}>{allFilesCount}</strong>
            </div>
            <div style={{ marginTop: 14 }}>
              <button className="btn-premium" style={{ width: '100%' }} onClick={() => setShowAddWork(true)}>
                + Add New Work
              </button>
            </div>
          </div>
        </aside>

        <main className="workspace">
          {showUsers ? (
            <UsersPanel works={works} onClose={() => setShowUsers(false)} />
          ) : showSettings ? (
            <SettingsPanel onClose={() => setShowSettings(false)} />
          ) : !activeWork ? (
            <div className="panel hero-panel fade-up">
              <div className="hero-content">
                <div className="hero-icon">✦</div>
                <div className="hero-title">Choose a work</div>
                <div className="hero-copy">
                  Open an existing work from the left or start a new one. The shell is tighter,
                  sharper, and redesigned around a more premium internal control style.
                </div>

                <div className="stat-grid">
                  <div className="glass-card stat-card">
                    <div className="stat-number" style={{ color: 'var(--yellow)' }}>{works.length}</div>
                    <div className="stat-label">Works</div>
                  </div>
                  <div className="glass-card stat-card">
                    <div className="stat-number" style={{ color: '#fff' }}>{allFilesCount}</div>
                    <div className="stat-label">Files</div>
                  </div>
                  <div className="glass-card stat-card">
                    <div className="stat-number" style={{ color: 'var(--violet-2)' }}>{works.filter((w) => w.type === 'proprietor').length}</div>
                    <div className="stat-label">Proprietor</div>
                  </div>
                  <div className="glass-card stat-card">
                    <div className="stat-number" style={{ color: 'var(--red-2)' }}>{FOLDER_DEFS.length}</div>
                    <div className="stat-label">Folder Types</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
                  <button className="btn-premium" onClick={() => setShowAddWork(true)}>Create Work</button>
                  <button className="btn-secondary" onClick={() => setShowSettings(true)}>Open Settings</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="fade-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                <div>
                  <div className="section-eyebrow">
                    {activeWork.type === 'proprietor' ? 'Proprietor' : 'Partnership'}
                  </div>
                  <div className="premium-title section-title">{activeWork.name}</div>
                  <div className="section-copy">
                    {[activeWork.loa && `LOA: ${activeWork.loa}`, activeWork.location].filter(Boolean).join(' · ')}
                  </div>
                </div>

                {session.role === 'admin' && (
                  <button className="btn-danger" onClick={() => handleDeleteWork(activeWork.id)}>
                    Delete Work
                  </button>
                )}
              </div>

              <div className="stat-grid" style={{ maxWidth: 'none', margin: '0 0 18px 0' }}>
                <div className="glass-card stat-card">
                  <div className="stat-number" style={{ color: 'var(--yellow)' }}>{totalFiles}</div>
                  <div className="stat-label">Total Files</div>
                </div>
                <div className="glass-card stat-card">
                  <div className="stat-number" style={{ color: 'var(--violet-2)' }}>{FOLDER_DEFS.length}</div>
                  <div className="stat-label">Folders</div>
                </div>
                <div className="glass-card stat-card">
                  <div className="stat-number" style={{ color: 'var(--red-2)' }}>
                    {(activeWork.fileCounts?.inv || 0) + (activeWork.fileCounts?.bill || 0)}
                  </div>
                  <div className="stat-label">Billing Docs</div>
                </div>
                <div className="glass-card stat-card">
                  <div className="stat-number" style={{ color: '#fff' }}>
                    {activeWork.type === 'proprietor' ? 'P' : 'PT'}
                  </div>
                  <div className="stat-label">Type</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
                {FOLDER_DEFS.map((f) => {
                  const active = activeFolder === f.key;
                  return (
                    <button
                      key={f.key}
                      className="glass-card"
                      onClick={() => setActiveFolder(active ? null : f.key)}
                      style={{
                        borderRadius: 22,
                        padding: '18px 16px',
                        border: `1px solid ${active ? f.color : 'rgba(255,255,255,0.08)'}`,
                        background: active ? `${f.color}16` : 'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.02))',
                        color: 'var(--text)',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: 22 }}>{f.icon}</div>
                      <div style={{ marginTop: 10, fontWeight: 700 }}>{f.name}</div>
                      <div className="mono-font" style={{ marginTop: 6, fontSize: 11, color: active ? '#fff' : 'var(--muted)' }}>
                        {activeWork.fileCounts?.[f.key] || 0} files
                      </div>
                    </button>
                  );
                })}
              </div>

              {activeFolder && (
                <FolderView
                  key={`${activeWorkId}-${activeFolder}`}
                  work={activeWork}
                  folderKey={activeFolder}
                  folderDef={FOLDER_DEFS.find((f) => f.key === activeFolder)}
                  session={session}
                  onFilesChanged={fetchWorks}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {showAddWork && (
        <AddWorkModal
          onClose={() => setShowAddWork(false)}
          onCreated={() => {
            setShowAddWork(false);
            fetchWorks();
          }}
        />
      )}
    </div>
  );
}
