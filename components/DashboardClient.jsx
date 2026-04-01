'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FolderView from './FolderView';
import AddWorkModal from './AddWorkModal';
import UsersPanel from './UsersPanel';
import SettingsPanel from './SettingsPanel';

export default function DashboardClient({ session }) {
  const router = useRouter();
  const [works, setWorks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [folderTypes, setFolderTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [activeWorkId, setActiveWorkId] = useState(null);
  const [activeFolder, setActiveFolder] = useState(null);
  const [panel, setPanel] = useState(null);
  const [showAddWork, setShowAddWork] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const el = document.getElementById('work-search-input');
        if (el) el.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [w, c, f] = await Promise.all([
        fetch('/api/works').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
        fetch('/api/folder-types').then((r) => r.json()),
      ]);
      setWorks(Array.isArray(w) ? w : []);
      setCategories(Array.isArray(c) ? c : []);
      setFolderTypes(Array.isArray(f) ? f : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  async function handleDeleteWork(id) {
    if (!confirm('Delete this work and ALL its files?')) return;
    await fetch(`/api/works/${id}`, { method: 'DELETE' });
    setActiveWorkId(null);
    setActiveFolder(null);
    fetchAll();
  }

  function goHome() {
    setPanel(null);
    setActiveWorkId(null);
    setActiveFolder(null);
  }

  function getCatColor(type) {
    const c = categories.find((x) => x.name.toLowerCase() === (type || '').toLowerCase());
    return c?.color || 'var(--accent-3)';
  }

  const filtered = works.filter((w) => {
    const matchCat = catFilter === 'all' || w.type.toLowerCase() === catFilter.toLowerCase();
    const s = search.toLowerCase();
    const matchSrc = w.name.toLowerCase().includes(s) || (w.location || '').toLowerCase().includes(s) || (w.loa || '').toLowerCase().includes(s);
    return matchCat && matchSrc;
  });

  const activeWork = works.find((w) => w.id === activeWorkId);
  const activeFolderDef = folderTypes.find((f) => f.key === activeFolder);
  const totalFiles = activeWork ? Object.values(activeWork.fileCounts || {}).reduce((a, b) => a + b, 0) : 0;
  const globalTotal = works.reduce((a, w) => a + Object.values(w.fileCounts || {}).reduce((x, y) => x + y, 0), 0);
  const topWork = works
    .map((w) => ({ ...w, count: Object.values(w.fileCounts || {}).reduce((a, b) => a + b, 0) }))
    .sort((a, b) => b.count - a.count)[0];

  const navButton = (active, background) => ({
    padding: '11px 15px',
    borderRadius: 16,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.1em',
    cursor: 'pointer',
    color: active ? '#fff' : 'var(--text-2)',
    border: `1px solid ${active ? background : 'var(--border)'}`,
    background: active ? `linear-gradient(135deg, ${background}, rgba(255,255,255,0.12))` : 'rgba(255,255,255,0.04)',
    boxShadow: active ? `0 16px 34px ${background}30` : 'none',
    transition: 'all .18s ease',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
      <header style={{
        background: 'linear-gradient(180deg, rgba(8,13,29,0.92), rgba(8,13,29,0.78))',
        borderBottom: '1px solid var(--border)',
        height: 84,
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 12px 34px rgba(0,0,0,0.28)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg, #fff0be 0%, #ffd166 42%, #ffb703 100%)', color: '#171106', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 18, boxShadow: 'var(--shadow-gold)' }}>SST</div>
          <div>
            <div className="premium-title gold-text" style={{ fontSize: 30, fontWeight: 700 }}>SS Traders</div>
            <div style={{ color: 'var(--muted)', fontSize: 10, letterSpacing: '0.34em', textTransform: 'uppercase' }}>Document Management Suite</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button onClick={goHome} className="btn-home">⌂ HOME</button>
          <div className="glass-card" style={{ borderRadius: 16, padding: '10px 14px', color: 'var(--accent)', fontSize: 12, fontWeight: 800, letterSpacing: '0.08em' }}>{time}</div>
          {session.role === 'admin' && (
            <>
              <button onClick={() => setPanel(panel === 'settings' ? null : 'settings')} style={navButton(panel === 'settings', 'rgba(56,189,248,0.95)')}>⚙ SETTINGS</button>
              <button onClick={() => setPanel(panel === 'users' ? null : 'users')} style={navButton(panel === 'users', 'rgba(139,92,246,0.95)')}>👥 USERS</button>
            </>
          )}
          <div className="glass-card" style={{ borderRadius: 999, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: session.role === 'admin' ? 'var(--accent)' : 'var(--accent-2)', boxShadow: session.role === 'admin' ? '0 0 16px rgba(255,209,102,.55)' : '0 0 16px rgba(87,242,135,.55)' }} />
            <span style={{ color: 'var(--text-2)' }}>{session.name}</span>
            <span style={{ color: 'var(--muted-2)' }}>/</span>
            <span style={{ color: session.role === 'admin' ? 'var(--accent)' : 'var(--accent-2)', fontWeight: 800, letterSpacing: '0.08em' }}>{session.role.toUpperCase()}</span>
          </div>
          <button onClick={handleLogout} className="btn-ghost">SIGN OUT</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', flex: 1, overflow: 'hidden' }}>
        <aside style={{ padding: 18, borderRight: '1px solid var(--border)', background: 'linear-gradient(180deg, rgba(9,14,30,0.94), rgba(6,10,23,0.9))', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="panel" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.24em', color: 'var(--muted)' }}>Workspace</div>
                <div className="premium-title" style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>Works library</div>
              </div>
              <div style={{ minWidth: 38, height: 38, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 900 }}>{filtered.length}</div>
            </div>

            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input id="work-search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search works, LOA, location..." style={{ paddingLeft: 40 }} />
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>⌕</span>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => setCatFilter('all')} style={navButton(catFilter === 'all', 'rgba(255,209,102,0.95)')}>ALL</button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setCatFilter(cat.name)} style={navButton(catFilter === cat.name, cat.color)}>{cat.name}</button>
              ))}
            </div>

            <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 18, background: 'rgba(255,255,255,0.035)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: 12 }}>
              <span>Quick focus</span>
              <span style={{ color: 'var(--text-2)' }}>⌘ / Ctrl + K</span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
            {loading ? (
              <div className="panel" style={{ padding: 18, color: 'var(--muted)' }}>Loading works…</div>
            ) : filtered.length === 0 ? (
              <div className="panel" style={{ padding: 22, textAlign: 'center' }}>
                <div style={{ fontSize: 34 }}>📂</div>
                <div style={{ marginTop: 10, fontWeight: 800 }}>No works found</div>
                <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>Adjust filters or add a new work to get started.</div>
              </div>
            ) : (
              filtered.map((w, i) => {
                const count = Object.values(w.fileCounts || {}).reduce((a, b) => a + b, 0);
                const active = activeWorkId === w.id;
                const catColor = getCatColor(w.type);
                return (
                  <button
                    key={w.id}
                    onClick={() => { setPanel(null); setActiveWorkId(w.id); setActiveFolder(null); }}
                    className="fade-up"
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '16px 14px',
                      borderRadius: 22,
                      marginBottom: 10,
                      border: `1px solid ${active ? catColor : 'var(--border)'}`,
                      background: active ? `linear-gradient(135deg, ${catColor}18, rgba(255,255,255,0.03))` : 'rgba(255,255,255,0.03)',
                      boxShadow: active ? `0 18px 34px ${catColor}18` : 'none',
                      cursor: 'pointer',
                      animationDelay: `${i * 0.03}s`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 10, color: catColor, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: catColor, boxShadow: `0 0 16px ${catColor}` }} />{w.type}
                        </div>
                        <div style={{ fontWeight: 800, marginTop: 8, fontSize: 16, color: active ? '#fff' : 'var(--text)' }}>{w.name}</div>
                        <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>{w.location || 'Location not set'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: active ? catColor : 'var(--text-2)' }}>{count}</div>
                        <div style={{ color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em' }}>Files</div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="panel" style={{ padding: 16 }}>
            <div style={{ color: 'var(--muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.18em' }}>Premium shortcuts</div>
            <div style={{ display: 'grid', gap: 8, marginTop: 12, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Top work</span><strong style={{ color: 'var(--accent)' }}>{topWork?.name || '—'}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total files</span><strong style={{ color: 'var(--accent-2)' }}>{globalTotal}</strong></div>
            </div>
            <button onClick={() => setShowAddWork(true)} className="btn-premium" style={{ width: '100%', marginTop: 16 }}>+ Add New Work</button>
          </div>
        </aside>

        <main style={{ padding: 20, overflowY: 'auto' }}>
          {panel === 'settings' ? (
            <SettingsPanel categories={categories} folderTypes={folderTypes} onClose={() => setPanel(null)} onRefresh={fetchAll} />
          ) : panel === 'users' ? (
            <UsersPanel works={works} onClose={() => setPanel(null)} />
          ) : !activeWork ? (
            <div className="panel fade-up" style={{ minHeight: 'calc(100vh - 146px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30, textAlign: 'center' }}>
              <div style={{ width: 96, height: 96, borderRadius: 28, background: 'linear-gradient(135deg, rgba(87,242,135,0.20), rgba(139,92,246,0.22), rgba(56,189,248,0.18))', display: 'grid', placeItems: 'center', fontSize: 48, boxShadow: 'var(--shadow-purple)', animation: 'softFloat 5s ease-in-out infinite' }}>✨</div>
              <div className="premium-title neon-text" style={{ fontSize: 58, fontWeight: 700, marginTop: 22 }}>Choose a work</div>
              <div style={{ color: 'var(--muted)', fontSize: 16, marginTop: 10, maxWidth: 560 }}>Open an existing work from the left or start a new one. The whole shell is now brighter, sharper, and built to feel like a premium internal control system.</div>
              <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, width: '100%', maxWidth: 860 }}>
                {[
                  { label: 'Works', value: works.length, color: 'var(--accent)' },
                  { label: 'Files', value: globalTotal, color: 'var(--accent-2)' },
                  { label: 'Categories', value: categories.length, color: 'var(--accent-3)' },
                  { label: 'Folder Types', value: folderTypes.length, color: 'var(--accent-4)' },
                ].map((item) => (
                  <div key={item.label} className="glass-card" style={{ borderRadius: 24, padding: '22px 16px' }}>
                    <div style={{ fontSize: 36, fontWeight: 900, color: item.color, textShadow: `0 0 18px ${item.color}` }}>{item.value}</div>
                    <div style={{ marginTop: 8, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 11 }}>{item.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button onClick={() => setShowAddWork(true)} className="btn-premium">Create Work</button>
                {session.role === 'admin' && <button onClick={() => setPanel('settings')} className="btn-home">Open Settings</button>}
              </div>
            </div>
          ) : (
            <div className="fade-up">
              <div className="panel" style={{ padding: 24, marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 999, background: `${getCatColor(activeWork.type)}18`, border: `1px solid ${getCatColor(activeWork.type)}33`, color: getCatColor(activeWork.type), fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{activeWork.type}</div>
                    <h1 className="premium-title" style={{ fontSize: 44, fontWeight: 700, marginTop: 14 }}>{activeWork.name}</h1>
                    <div style={{ marginTop: 10, display: 'flex', gap: 18, flexWrap: 'wrap', color: 'var(--muted)', fontSize: 13 }}>
                      <span>LOA: <strong style={{ color: 'var(--text-2)' }}>{activeWork.loa || 'Not set'}</strong></span>
                      <span>Location: <strong style={{ color: 'var(--text-2)' }}>{activeWork.location || 'Not set'}</strong></span>
                      <span>Files: <strong style={{ color: 'var(--accent-2)' }}>{totalFiles}</strong></span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button onClick={goHome} className="btn-home">Home</button>
                    <button onClick={() => setShowAddWork(true)} className="btn-premium">+ Add Work</button>
                    {session.role === 'admin' && <button onClick={() => handleDeleteWork(activeWork.id)} className="btn-danger">Delete Work</button>}
                  </div>
                </div>

                <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
                  {[
                    { label: 'Total Files', value: totalFiles, color: 'var(--accent)' },
                    { label: 'Folder Types', value: folderTypes.length, color: 'var(--accent-3)' },
                    { label: 'Category', value: activeWork.type, color: getCatColor(activeWork.type) },
                    { label: 'Status', value: totalFiles > 0 ? 'Active' : 'Empty', color: totalFiles > 0 ? 'var(--accent-2)' : 'var(--text-2)' },
                  ].map((item) => (
                    <div key={item.label} className="glass-card" style={{ borderRadius: 20, padding: '18px 16px' }}>
                      <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{item.label}</div>
                      <div style={{ fontSize: 30, fontWeight: 900, marginTop: 8, color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 18 }}>
                {folderTypes.map((f, i) => {
                  const isActive = activeFolder === f.key;
                  const count = activeWork.fileCounts?.[f.key] || 0;
                  return (
                    <button key={f.key} onClick={() => setActiveFolder(isActive ? null : f.key)} className="fade-up" style={{
                      textAlign: 'left',
                      borderRadius: 22,
                      padding: '18px 16px',
                      border: `1px solid ${isActive ? f.color : 'var(--border)'}`,
                      background: isActive ? `linear-gradient(135deg, ${f.color}18, rgba(255,255,255,0.03))` : 'rgba(255,255,255,0.03)',
                      boxShadow: isActive ? `0 18px 36px ${f.color}20` : 'none',
                      transition: 'all .18s ease',
                      cursor: 'pointer',
                      animationDelay: `${i * 0.04}s`,
                    }}>
                      <div style={{ fontSize: 28 }}>{f.icon}</div>
                      <div style={{ marginTop: 10, fontWeight: 800, color: isActive ? f.color : 'var(--text)' }}>{f.name}</div>
                      <div style={{ marginTop: 6, color: 'var(--muted)', fontSize: 12 }}>{count} {count === 1 ? 'file' : 'files'}</div>
                    </button>
                  );
                })}
              </div>

              {activeFolder && activeFolderDef && (
                <FolderView key={`${activeWorkId}-${activeFolder}`} work={activeWork} folderKey={activeFolder} folderDef={activeFolderDef} session={session} onFilesChanged={fetchAll} />
              )}
            </div>
          )}
        </main>
      </div>

      {showAddWork && <AddWorkModal categories={categories} onClose={() => setShowAddWork(false)} onCreated={() => { fetchAll(); setShowAddWork(false); }} />}
    </div>
  );
}
