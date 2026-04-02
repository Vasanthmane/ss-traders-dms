'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FolderView from './FolderView';
import AddWorkModal from './AddWorkModal';
import UsersPanel from './UsersPanel';
import SettingsPanel from './SettingsPanel';

export default function DashboardClient({ session }) {
  const router = useRouter();
  const [works, setWorks]             = useState([]);
  const [categories, setCategories]   = useState([]);
  const [folderTypes, setFolderTypes] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [catFilter, setCatFilter]     = useState('all');
  const [activeWorkId, setActiveWorkId] = useState(null);
  const [activeFolder, setActiveFolder] = useState(null);
  const [panel, setPanel]             = useState(null); // 'users' | 'settings' | null
  const [showAddWork, setShowAddWork] = useState(false);
  const [time, setTime]               = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [w, c, f] = await Promise.all([
        fetch('/api/works').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/folder-types').then(r => r.json()),
      ]);
      setWorks(Array.isArray(w) ? w : []);
      setCategories(Array.isArray(c) ? c : []);
      setFolderTypes(Array.isArray(f) ? f : []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  async function handleDeleteWork(id) {
    if (!confirm('Delete this work and ALL its files?')) return;
    await fetch(`/api/works/${id}`, { method: 'DELETE' });
    setActiveWorkId(null); setActiveFolder(null); fetchAll();
  }

  function getCatColor(type) {
    const c = categories.find(x => x.name.toLowerCase() === (type || '').toLowerCase());
    return c?.color || '#6b7694';
  }

  const filtered = works.filter(w => {
    const mc = catFilter === 'all' || w.type.toLowerCase() === catFilter.toLowerCase();
    const q  = search.toLowerCase();
    const ms = !q || w.name.toLowerCase().includes(q) || (w.location || '').toLowerCase().includes(q) || (w.loa || '').toLowerCase().includes(q);
    return mc && ms;
  });

  const activeWork      = works.find(w => w.id === activeWorkId) || null;
  const activeFolderDef = folderTypes.find(f => f.key === activeFolder);
  const totalFiles      = activeWork ? Object.values(activeWork.fileCounts || {}).reduce((a, b) => a + b, 0) : 0;
  const globalTotal     = works.reduce((a, w) => a + Object.values(w.fileCounts || {}).reduce((x, y) => x + y, 0), 0);

  // ── Topbar button ──
  const NavBtn = ({ id, children, color = 'var(--blue-light)' }) => {
    const active = panel === id;
    return (
      <button onClick={() => setPanel(active ? null : id)} style={{
        height: 34, padding: '0 14px', borderRadius: 999,
        background: active ? `${color}18` : 'transparent',
        border: `1px solid ${active ? color + '55' : 'var(--border)'}`,
        color: active ? color : 'var(--text-2)',
        fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
        cursor: 'pointer', transition: 'all 0.18s',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>{children}</button>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative', zIndex: 1 }}>

      {/* ── TOPBAR ── */}
      <header style={{
        height: 56, padding: '0 20px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(13,17,23,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        zIndex: 50,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 13, color: '#fff',
            boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
          }}>SST</div>
          <div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--text)', lineHeight: 1 }}>SS Traders</div>
            <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.2em' }}>DOCUMENT SUITE</div>
          </div>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="mono" style={{
            height: 34, padding: '0 12px', borderRadius: 999,
            background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.18)',
            color: 'var(--blue-light)', fontSize: 11,
            display: 'flex', alignItems: 'center',
          }}>{time}</div>

          <NavBtn id="settings">⚙ Settings</NavBtn>
          {session.role === 'admin' && <NavBtn id="users" color="#818cf8">👥 Users</NavBtn>}

          <div style={{
            height: 34, padding: '0 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 12, color: 'var(--text-2)',
          }}>
            <span className="dot-live" />
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{session.name}</span>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span className="badge badge-blue" style={{ height: 18 }}>{session.role.toUpperCase()}</span>
          </div>

          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ borderRadius: 999 }}>Sign Out</button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: 260, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          background: 'rgba(11,13,20,0.98)', borderRight: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          {/* Search + header */}
          <div style={{ padding: '14px 12px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.18em' }}>WORKS</span>
              <span className="badge badge-blue">{filtered.length}</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search works, LOA, location…"
                style={{ paddingLeft: 32, height: 36, fontSize: 12, borderRadius: 10 }}
              />
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 14, pointerEvents: 'none' }}>⌕</span>
            </div>
          </div>

          {/* Category filters */}
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              <button onClick={() => setCatFilter('all')} style={{
                height: 26, padding: '0 10px', borderRadius: 999, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                background: catFilter === 'all' ? 'var(--blue)' : 'transparent',
                border: `1px solid ${catFilter === 'all' ? 'var(--blue)' : 'var(--border)'}`,
                color: catFilter === 'all' ? '#fff' : 'var(--muted)',
                transition: 'all 0.15s',
              }}>All</button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setCatFilter(catFilter === cat.name ? 'all' : cat.name)} style={{
                  height: 26, padding: '0 10px', borderRadius: 999, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                  background: catFilter === cat.name ? cat.color : 'transparent',
                  border: `1px solid ${catFilter === cat.name ? cat.color : 'var(--border)'}`,
                  color: catFilter === cat.name ? '#fff' : 'var(--muted)',
                  transition: 'all 0.15s',
                }}>{cat.name}</button>
              ))}
            </div>
          </div>

          {/* Works list — ALL works shown */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>Loading…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>No works found</div>
            ) : filtered.map((w, i) => {
              const count    = Object.values(w.fileCounts || {}).reduce((a, b) => a + b, 0);
              const isActive = activeWorkId === w.id;
              const cc       = getCatColor(w.type);
              return (
                <div
                  key={w.id}
                  onClick={() => { setActiveWorkId(w.id); setActiveFolder(null); setPanel(null); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '9px 10px', borderRadius: 10, cursor: 'pointer', marginBottom: 2,
                    background: isActive ? 'rgba(37,99,235,0.10)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(37,99,235,0.30)' : 'transparent'}`,
                    transition: 'all 0.15s',
                    animation: `slideInLeft 0.2s ease ${i * 0.025}s both`,
                  }}
                >
                  {/* Category colour strip */}
                  <div style={{ width: 3, height: 32, borderRadius: 2, background: cc, flexShrink: 0 }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12, fontWeight: 600, color: isActive ? 'var(--text)' : 'var(--text-2)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{w.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: cc, letterSpacing: '0.08em' }}>{w.type.toUpperCase()}</span>
                      {w.location && <><span style={{ color: 'var(--border)' }}>·</span><span style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>{w.location}</span></>}
                    </div>
                  </div>

                  <span className="mono" style={{
                    fontSize: 10, color: isActive ? 'var(--blue-light)' : 'var(--muted)',
                    background: isActive ? 'var(--blue-soft)' : 'transparent',
                    padding: '2px 6px', borderRadius: 5, flexShrink: 0,
                  }}>{count}</span>
                </div>
              );
            })}
          </div>

          {/* Add work button */}
          {session.role === 'admin' && (
            <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <button onClick={() => setShowAddWork(true)} className="btn btn-primary" style={{ width: '100%', borderRadius: 10, height: 38 }}>
                + Add New Work
              </button>
            </div>
          )}
        </aside>

        {/* ── MAIN AREA ── */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24, position: 'relative' }}>

          {panel === 'settings' ? (
            <SettingsPanel
              categories={categories} folderTypes={folderTypes}
              onClose={() => setPanel(null)} onRefresh={fetchAll}
            />
          ) : panel === 'users' ? (
            <UsersPanel works={works} onClose={() => setPanel(null)} />

          ) : !activeWork ? (

            /* ── WELCOME SCREEN ── */
            <div className="fade-up" style={{
              minHeight: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 32,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 40, color: 'var(--text)', lineHeight: 1.1 }}>
                  Select a work<br /><span style={{ color: 'var(--blue-light)' }}>to get started.</span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 12 }}>
                  Choose from the sidebar or create a new work below.
                </div>
              </div>

              {/* Global stats */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  { v: works.length,        l: 'Works',        c: 'var(--blue-light)' },
                  { v: globalTotal,          l: 'Total Files',  c: 'var(--text)' },
                  { v: categories.length,   l: 'Categories',   c: '#818cf8' },
                  { v: folderTypes.length,  l: 'Folder Types', c: 'var(--text-2)' },
                ].map(({ v, l, c }) => (
                  <div key={l} className="card" style={{ padding: '20px 28px', textAlign: 'center', minWidth: 130 }}>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 36, fontWeight: 800, color: c, lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em', marginTop: 6 }}>{l.toUpperCase()}</div>
                  </div>
                ))}
              </div>

              {session.role === 'admin' && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowAddWork(true)} className="btn btn-primary btn-lg">+ Create Work</button>
                  <button onClick={() => setPanel('settings')} className="btn btn-outline btn-lg">⚙ Settings</button>
                </div>
              )}
            </div>

          ) : (

            /* ── WORK DETAIL ── */
            <div className="fade-up">
              {/* Work header */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                gap: 16, marginBottom: 22, paddingBottom: 20, borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span style={{
                      padding: '3px 12px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                      background: getCatColor(activeWork.type) + '18',
                      color: getCatColor(activeWork.type),
                      border: `1px solid ${getCatColor(activeWork.type)}35`,
                    }}>{activeWork.type.toUpperCase()}</span>
                    {activeWork.loa && <span className="badge badge-white mono" style={{ fontSize: 10 }}>LOA: {activeWork.loa}</span>}
                    {activeWork.location && <span style={{ fontSize: 12, color: 'var(--muted)' }}>📍 {activeWork.location}</span>}
                  </div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>
                    {activeWork.name}
                  </div>
                  {activeWork.notes && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, maxWidth: 600 }}>{activeWork.notes}</div>}
                </div>
                {session.role === 'admin' && (
                  <button onClick={() => handleDeleteWork(activeWork.id)} className="btn btn-danger btn-sm" style={{ flexShrink: 0 }}>
                    🗑 Delete
                  </button>
                )}
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
                {[
                  { v: totalFiles, l: 'Files', c: 'var(--blue-light)', icon: '📄' },
                  { v: folderTypes.length, l: 'Folders', c: 'var(--text-2)', icon: '📁' },
                  { v: (activeWork.fileCounts?.inv || 0) + (activeWork.fileCounts?.bill || 0), l: 'Billing Docs', c: '#818cf8', icon: '🧾' },
                  { v: new Date(activeWork.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }), l: 'Created', c: 'var(--muted)', icon: '📅' },
                ].map(({ v, l, c, icon }) => (
                  <div key={l} className="card" style={{ padding: '14px 18px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: 14, top: 14, fontSize: 20, opacity: 0.08 }}>{icon}</div>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: c, lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em', marginTop: 5 }}>{l.toUpperCase()}</div>
                  </div>
                ))}
              </div>

              {/* Folder grid — fully dynamic from DB */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 22 }}>
                {folderTypes.map((f, i) => {
                  const isActive = activeFolder === f.key;
                  const count    = activeWork.fileCounts?.[f.key] || 0;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setActiveFolder(isActive ? null : f.key)}
                      style={{
                        background: isActive ? `${f.color}14` : 'var(--card)',
                        border: `1px solid ${isActive ? f.color + '55' : 'var(--border)'}`,
                        borderRadius: 12, padding: '16px 14px', cursor: 'pointer',
                        textAlign: 'left', transition: 'all 0.18s',
                        boxShadow: isActive ? `0 0 18px ${f.color}18` : 'none',
                        animation: `fadeUp 0.22s ease ${i * 0.035}s both`,
                        position: 'relative', overflow: 'hidden',
                      }}
                    >
                      {isActive && (
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                          background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`,
                        }} />
                      )}
                      <div style={{ fontSize: 22, marginBottom: 10 }}>{f.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? f.color : 'var(--text-2)', letterSpacing: '0.02em' }}>{f.name}</div>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                        {count} {count === 1 ? 'file' : 'files'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {activeFolder && activeFolderDef && (
                <FolderView
                  key={`${activeWorkId}-${activeFolder}`}
                  work={activeWork}
                  folderKey={activeFolder}
                  folderDef={activeFolderDef}
                  session={session}
                  onFilesChanged={fetchAll}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {showAddWork && (
        <AddWorkModal
          categories={categories}
          onClose={() => setShowAddWork(false)}
          onCreated={() => { fetchAll(); setShowAddWork(false); }}
        />
      )}
    </div>
  );
}
