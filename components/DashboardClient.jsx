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

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

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

  const shellBtn = (active, color) => ({
    padding: '10px 14px',
    borderRadius: 14,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.09em',
    cursor: 'pointer',
    color: active ? '#fff' : 'var(--text-2)',
    border: `1px solid ${active ? color : 'var(--border)'}`,
    background: active ? `linear-gradient(135deg, ${color}, rgba(255,255,255,0.1))` : 'rgba(255,255,255,0.03)',
    boxShadow: active ? `0 12px 26px ${color}30` : 'none',
    transition: 'all .18s ease',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
      <header style={{
        background: 'rgba(9,11,19,0.88)',
        borderBottom: '1px solid var(--border)',
        height: 78,
        padding: '0 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 28px rgba(0,0,0,0.26)',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(135deg, #fff3cb 0%, #d4a84a 45%, #f3cf73 100%)', color: '#171106', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 18, boxShadow: 'var(--shadow-gold)' }}>SST</div>
          <div>
            <div className="premium-title gold-text" style={{ fontSize: 30, fontWeight: 700 }}>S S Traders</div>
            <div style={{ color: 'var(--muted)', fontSize: 10, letterSpacing: '0.34em', textTransform: 'uppercase' }}>Document Management Suite</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="glass-card" style={{ borderRadius: 14, padding: '10px 14px', color: 'var(--accent)', fontSize: 12, fontWeight: 800, letterSpacing: '0.08em' }}>{time}</div>
          {session.role === 'admin' && (
            <>
              <button onClick={() => setPanel(panel === 'settings' ? null : 'settings')} style={shellBtn(panel === 'settings', 'rgba(212,168,74,0.9)')}>⚙ SETTINGS</button>
              <button onClick={() => setPanel(panel === 'users' ? null : 'users')} style={shellBtn(panel === 'users', 'rgba(139,92,246,0.9)')}>👥 USERS</button>
            </>
          )}
          <div className="glass-card" style={{ borderRadius: 999, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: session.role === 'admin' ? 'var(--accent)' : 'var(--accent-2)', boxShadow: session.role === 'admin' ? '0 0 16px rgba(212,168,74,.55)' : '0 0 16px rgba(74,222,128,.55)' }} />
            <span style={{ color: 'var(--text-2)' }}>{session.name}</span>
            <span style={{ color: 'var(--muted-2)' }}>/</span>
            <span style={{ color: session.role === 'admin' ? 'var(--accent)' : 'var(--accent-2)', fontWeight: 800, letterSpacing: '0.08em' }}>{session.role.toUpperCase()}</span>
          </div>
          <button onClick={handleLogout} className="btn-ghost">SIGN OUT</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '305px 1fr', flex: 1, overflow: 'hidden' }}>
        <aside style={{ padding: 18, borderRight: '1px solid var(--border)', background: 'linear-gradient(180deg, rgba(12,15,26,0.95), rgba(9,11,18,0.92))', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="glass-card" style={{ borderRadius: 24, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--muted)' }}>Workspace</div>
                <div className="premium-title" style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>Works library</div>
              </div>
              <div style={{ minWidth: 34, height: 34, borderRadius: 12, display: 'grid', placeItems: 'center', background: 'rgba(212,168,74,0.12)', color: 'var(--accent)', fontWeight: 800 }}>{filtered.length}</div>
            </div>

            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input id="work-search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search works, LOA, location..." style={{ paddingLeft: 40 }} />
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>⌕</span>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => setCatFilter('all')} style={shellBtn(catFilter === 'all', 'rgba(212,168,74,0.92)')}>ALL</button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setCatFilter(cat.name)} style={shellBtn(catFilter === cat.name, cat.color)}>{cat.name}</button>
              ))}
            </div>

            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: 12 }}>
              <span>Quick focus</span>
              <span style={{ color: 'var(--text-2)' }}>⌘ / Ctrl + K</span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', marginTop: 14, paddingRight: 4 }}>
            {loading ? (
              <div className="glass-card" style={{ borderRadius: 24, padding: 18, color: 'var(--muted)' }}>Loading works…</div>
            ) : filtered.length === 0 ? (
              <div className="glass-card" style={{ borderRadius: 24, padding: 22, textAlign: 'center' }}>
                <div style={{ fontSize: 34 }}>📂</div>
                <div style={{ marginTop: 10, fontWeight: 800 }}>No works found</div>
                <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>Adjust filters or add a new work to get started.</div>
              </div>
            ) : filtered.map((w, i) => {
              const count = Object.values(w.fileCounts || {}).reduce((a, b) => a + b, 0);
              const active = activeWorkId === w.id;
              const catColor = getCatColor(w.type);
              return (
                <button key={w.id} onClick={() => { setActiveWorkId(w.id); setActiveFolder(null); }} className="fade-up" style={{
                  width: '100%',
                  textAlign: 'left',
                  marginBottom: 10,
                  padding: 16,
                  borderRadius: 20,
                  border: `1px solid ${active ? catColor : 'var(--border)'}`,
                  background: active ? `linear-gradient(135deg, ${catColor}18, rgba(255,255,255,0.03))` : 'rgba(255,255,255,0.025)',
                  boxShadow: active ? `0 14px 32px ${catColor}1f` : 'none',
                  transition: 'all .18s ease',
                  cursor: 'pointer',
                  animationDelay: `${i * 0.04}s`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: catColor, boxShadow: `0 0 16px ${catColor}` }} />
                        <span style={{ fontSize: 11, color: catColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{w.type}</span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 5 }}>{w.location || 'Location not set'}</div>
                    </div>
                    <div style={{ minWidth: 54, textAlign: 'right' }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: active ? 'var(--accent-4)' : 'var(--text-2)' }}>{count}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>files</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="glass-card" style={{ borderRadius: 22, padding: 16, marginTop: 14 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: 6 }}>Premium shortcuts</div>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-2)', fontSize: 13 }}><span>Top work</span><strong style={{ color: 'var(--accent)' }}>{topWork?.name || '—'}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-2)', fontSize: 13 }}><span>Total files</span><strong style={{ color: 'var(--accent-2)' }}>{globalTotal}</strong></div>
            </div>
            <button onClick={() => setShowAddWork(true)} className="btn-premium" style={{ width: '100%', marginTop: 14 }}>+ Add New Work</button>
          </div>
        </aside>

        <main style={{ overflowY: 'auto', padding: 22 }}>
          {panel === 'users' && session.role === 'admin' ? (
            <UsersPanel works={works} onClose={() => setPanel(null)} />
          ) : panel === 'settings' && session.role === 'admin' ? (
            <SettingsPanel categories={categories} folderTypes={folderTypes} onClose={() => setPanel(null)} onRefresh={fetchAll} />
          ) : !activeWork ? (
            <div className="panel fade-up" style={{ minHeight: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, textAlign: 'center' }}>
              <div style={{ width: 96, height: 96, borderRadius: 28, background: 'linear-gradient(135deg, rgba(74,222,128,0.18), rgba(139,92,246,0.18))', display: 'grid', placeItems: 'center', fontSize: 48, boxShadow: 'var(--shadow-purple)', animation: 'softFloat 5s ease-in-out infinite' }}>📁</div>
              <div className="premium-title aurora-text" style={{ fontSize: 56, fontWeight: 700, marginTop: 22 }}>Choose a work</div>
              <div style={{ color: 'var(--muted)', fontSize: 16, marginTop: 10, maxWidth: 520 }}>Browse your works from the left, filter by category, or create a new premium folder structure for an upcoming project.</div>

              <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, width: '100%', maxWidth: 820 }}>
                {[
                  { label: 'Works', value: works.length, color: 'var(--accent)' },
                  { label: 'Files', value: globalTotal, color: 'var(--accent-2)' },
                  { label: 'Categories', value: categories.length, color: 'var(--accent-3)' },
                  { label: 'Folder Types', value: folderTypes.length, color: 'var(--accent-4)' },
                ].map((item) => (
                  <div key={item.label} className="glass-card" style={{ borderRadius: 24, padding: '22px 16px' }}>
                    <div style={{ fontSize: 34, fontWeight: 800, color: item.color }}>{item.value}</div>
                    <div style={{ marginTop: 8, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 11 }}>{item.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 26 }}>
                <button onClick={() => setShowAddWork(true)} className="btn-premium">Create Work</button>
                {session.role === 'admin' && <button onClick={() => setPanel('settings')} className="btn-secondary">Open Settings</button>}
              </div>
            </div>
          ) : (
            <div className="fade-up">
              <div className="panel" style={{ padding: 24, borderRadius: 28, marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 999, background: `${getCatColor(activeWork.type)}18`, border: `1px solid ${getCatColor(activeWork.type)}33`, color: getCatColor(activeWork.type), fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{activeWork.type}</div>
                    <h1 className="premium-title" style={{ fontSize: 42, fontWeight: 700, marginTop: 14 }}>{activeWork.name}</h1>
                    <div style={{ marginTop: 10, display: 'flex', gap: 18, flexWrap: 'wrap', color: 'var(--muted)', fontSize: 13 }}>
                      <span>LOA: <strong style={{ color: 'var(--text-2)' }}>{activeWork.loa || 'Not set'}</strong></span>
                      <span>Location: <strong style={{ color: 'var(--text-2)' }}>{activeWork.location || 'Not set'}</strong></span>
                      <span>Files: <strong style={{ color: 'var(--accent-2)' }}>{totalFiles}</strong></span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setShowAddWork(true)} className="btn-premium">+ Add Work</button>
                    {session.role === 'admin' && <button onClick={() => handleDeleteWork(activeWork.id)} className="btn-danger">Delete Work</button>}
                  </div>
                </div>

                <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
                  {[
                    { label: 'Total Files', value: totalFiles, color: 'var(--accent)' },
                    { label: 'Folder Types', value: folderTypes.length, color: 'var(--accent-3)' },
                    { label: 'Top Category', value: activeWork.type, color: getCatColor(activeWork.type) },
                    { label: 'Ready State', value: totalFiles > 0 ? 'Active' : 'Empty', color: totalFiles > 0 ? 'var(--accent-2)' : 'var(--text-2)' },
                  ].map((item) => (
                    <div key={item.label} className="glass-card" style={{ borderRadius: 20, padding: '18px 16px' }}>
                      <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{item.label}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8, color: item.color }}>{item.value}</div>
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
