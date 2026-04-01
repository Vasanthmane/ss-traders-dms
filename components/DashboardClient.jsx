'use client';
import { useState, useEffect, useCallback } from 'react';
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
  const [panel, setPanel]             = useState(null);
  const [showAddWork, setShowAddWork] = useState(false);
  const [time, setTime]               = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
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
    await fetch('/api/auth/logout', { method:'POST' });
    router.push('/login');
  }

  async function handleDeleteWork(id) {
    if (!confirm('Delete this work and ALL its files?')) return;
    await fetch(`/api/works/${id}`, { method:'DELETE' });
    setActiveWorkId(null); setActiveFolder(null); fetchAll();
  }

  function getCatColor(type) {
    const c = categories.find(c => c.name.toLowerCase() === (type||'').toLowerCase());
    return c?.color || 'var(--muted)';
  }

  const filtered = works.filter(w => {
    const matchCat = catFilter==='all' || w.type.toLowerCase()===catFilter.toLowerCase();
    const matchSrc = w.name.toLowerCase().includes(search.toLowerCase()) ||
      (w.location||'').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSrc;
  });

  const activeWork      = works.find(w => w.id === activeWorkId);
  const activeFolderDef = folderTypes.find(f => f.key === activeFolder);
  const totalFiles      = activeWork ? Object.values(activeWork.fileCounts||{}).reduce((a,b)=>a+b,0) : 0;
  const globalTotal     = works.reduce((a,w)=>a+Object.values(w.fileCounts||{}).reduce((x,y)=>x+y,0),0);

  const hdrBtn = (active, color='var(--accent)') => ({
    background: active ? `${color}18` : 'transparent',
    border: `1px solid ${active ? color+'55' : 'var(--border)'}`,
    borderRadius:7, padding:'6px 14px', color: active ? color : 'var(--muted)',
    fontSize:11, fontWeight:700, cursor:'pointer', letterSpacing:1, transition:'all 0.2s',
  });

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', position:'relative', zIndex:1 }}>

      {/* HEADER */}
      <header style={{
        background:'rgba(11,14,28,0.98)', borderBottom:'1px solid var(--border)',
        padding:'0 22px', display:'flex', alignItems:'center', justifyContent:'space-between',
        height:58, flexShrink:0, zIndex:50, backdropFilter:'blur(20px)',
        boxShadow:'0 1px 0 rgba(232,160,32,0.06), 0 4px 24px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{
            width:38, height:38, background:'linear-gradient(135deg, #e8a020, #f5c842)',
            borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:"'Space Grotesk', sans-serif", fontSize:15, color:'#000', fontWeight:900,
            boxShadow:'0 4px 16px rgba(232,160,32,0.3)',
          }}>SST</div>
          <div>
            <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:18, letterSpacing:3, color:'var(--text)' }}>S S TRADERS</div>
            <div style={{ fontSize:8, color:'var(--muted)', letterSpacing:4 }}>DOCUMENT MANAGEMENT SYSTEM</div>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'var(--accent)', padding:'4px 10px', border:'1px solid rgba(232,160,32,0.18)', borderRadius:5, background:'rgba(232,160,32,0.05)' }}>{time}</div>

          {session.role === 'admin' && (
            <>
              <button onClick={() => setPanel(panel==='settings' ? null : 'settings')} style={hdrBtn(panel==='settings','var(--accent)')}>⚙ SETTINGS</button>
              <button onClick={() => setPanel(panel==='users' ? null : 'users')} style={hdrBtn(panel==='users','var(--accent2)')}>👥 USERS</button>
            </>
          )}

          <div style={{ background:'rgba(232,160,32,0.05)', border:'1px solid rgba(232,160,32,0.14)', borderRadius:24, padding:'5px 14px', fontSize:11, color:'var(--muted)', fontFamily:"'IBM Plex Mono',monospace", display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent3)', display:'inline-block', boxShadow:'0 0 6px var(--accent3)', animation:'pulse 2s ease-in-out infinite' }} />
            <span style={{ color:'var(--text)' }}>{session.name}</span>
            <span style={{ color:'var(--border)' }}>|</span>
            <span style={{ color: session.role==='admin' ? 'var(--accent)' : 'var(--accent2)' }}>{session.role.toUpperCase()}</span>
          </div>

          <button onClick={handleLogout} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:7, padding:'6px 14px', color:'var(--muted)', fontSize:11, cursor:'pointer', transition:'all 0.2s' }}>SIGN OUT</button>
        </div>
      </header>

      <div style={{ display:'flex', flex:1, overflow:'hidden', position:'relative', zIndex:1 }}>

        {/* SIDEBAR */}
        <aside style={{ width:268, background:'rgba(10,12,22,0.98)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0 }}>
          <div style={{ padding:'14px 12px 10px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:9, letterSpacing:4, color:'var(--muted)', fontWeight:700 }}>WORKS</span>
              <span style={{ fontSize:10, color:'var(--accent)', fontFamily:"'IBM Plex Mono',monospace", background:'rgba(232,160,32,0.1)', padding:'2px 8px', borderRadius:4 }}>{filtered.length}</span>
            </div>
            <div style={{ position:'relative' }}>
              <input placeholder="Search works…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft:32, fontSize:12 }} />
              <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--muted)', fontSize:13 }}>⌕</span>
            </div>
          </div>

          <div style={{ padding:'8px 12px', borderBottom:'1px solid var(--border)', display:'flex', gap:5, flexWrap:'wrap' }}>
            <button onClick={() => setCatFilter('all')} style={{ padding:'4px 11px', borderRadius:20, fontSize:10, fontWeight:700, cursor:'pointer', transition:'all 0.15s', border:`1px solid ${catFilter==='all' ? 'var(--accent)' : 'var(--border)'}`, background: catFilter==='all' ? 'rgba(232,160,32,0.12)' : 'transparent', color: catFilter==='all' ? 'var(--accent)' : 'var(--muted)' }}>ALL</button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setCatFilter(catFilter===cat.name ? 'all' : cat.name)} style={{ padding:'4px 11px', borderRadius:20, fontSize:10, fontWeight:700, cursor:'pointer', transition:'all 0.15s', border:`1px solid ${catFilter===cat.name ? cat.color : 'var(--border)'}`, background: catFilter===cat.name ? cat.color+'14' : 'transparent', color: catFilter===cat.name ? cat.color : 'var(--muted)' }}>{cat.name}</button>
            ))}
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'4px 8px' }}>
            {loading ? (
              <div style={{ padding:24, textAlign:'center', color:'var(--muted)', fontSize:12 }}>
                <div style={{ animation:'spin 1s linear infinite', display:'inline-block', fontSize:20, marginBottom:8 }}>⚙️</div>
                <div>Loading…</div>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding:24, textAlign:'center', color:'var(--muted)', fontSize:12 }}>No works found</div>
            ) : filtered.map((w, i) => {
              const count = Object.values(w.fileCounts||{}).reduce((a,b)=>a+b,0);
              const isActive = activeWorkId===w.id;
              const cc = getCatColor(w.type);
              return (
                <div key={w.id} onClick={() => { setActiveWorkId(w.id); setActiveFolder(null); setPanel(null); }} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 10px', borderRadius:8, cursor:'pointer', marginTop:3, border:`1px solid ${isActive ? cc+'55' : 'transparent'}`, background: isActive ? cc+'0c' : 'transparent', transition:'all 0.18s', animation:`slideIn 0.25s ease ${i*0.03}s both` }}>
                  <div style={{ width:3, height:34, borderRadius:2, background:cc, flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{w.name}</div>
                    <div style={{ fontSize:10, color:'var(--muted)', marginTop:2, display:'flex', alignItems:'center', gap:5 }}>
                      <span style={{ color:cc, fontWeight:700, fontSize:9, letterSpacing:1 }}>{w.type.toUpperCase()}</span>
                      {w.location && <><span style={{ color:'var(--border)' }}>·</span><span>{w.location}</span></>}
                    </div>
                  </div>
                  <span style={{ fontSize:10, fontFamily:"'IBM Plex Mono',monospace", color: isActive ? cc : 'var(--muted)', background: isActive ? cc+'14' : 'transparent', padding:'2px 7px', borderRadius:4, flexShrink:0 }}>{count}</span>
                </div>
              );
            })}
          </div>

          {session.role === 'admin' && (
            <div style={{ padding:'10px 12px', borderTop:'1px solid var(--border)' }}>
              <button onClick={() => setShowAddWork(true)} style={{ width:'100%', padding:'10px', background:'linear-gradient(135deg, rgba(232,160,32,0.18), rgba(232,160,32,0.06))', border:'1px solid rgba(232,160,32,0.3)', borderRadius:8, color:'var(--accent)', fontWeight:700, fontSize:11, letterSpacing:2, cursor:'pointer', transition:'all 0.2s' }}>+ ADD NEW WORK</button>
            </div>
          )}
        </aside>

        {/* MAIN */}
        <main style={{ flex:1, overflowY:'auto', padding:28, position:'relative' }}>
          {panel === 'settings' ? (
            <SettingsPanel categories={categories} folderTypes={folderTypes} onClose={() => setPanel(null)} onRefresh={fetchAll} />
          ) : panel === 'users' ? (
            <UsersPanel works={works} onClose={() => setPanel(null)} />
          ) : !activeWork ? (
            <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:28 }}>
              <div style={{ fontSize:72, filter:'drop-shadow(0 0 20px rgba(232,160,32,0.25))' }}>🏗️</div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:32, letterSpacing:4, color:'var(--text)' }}>SELECT A WORK</div>
                <div style={{ fontSize:13, color:'var(--muted)', marginTop:8 }}>Choose from the sidebar or add a new work</div>
              </div>
              <div style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center' }}>
                {[
                  { v:works.length,       l:'Works',        c:'var(--accent)' },
                  { v:globalTotal,        l:'Files',        c:'var(--accent2)' },
                  { v:categories.length,  l:'Categories',   c:'var(--accent3)' },
                  { v:folderTypes.length, l:'Folder Types', c:'var(--muted)' },
                ].map(({v,l,c}) => (
                  <div key={l} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'20px 28px', textAlign:'center', boxShadow:'0 4px 24px rgba(0,0,0,0.2)' }}>
                    <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:38, color:c, lineHeight:1 }}>{v}</div>
                    <div style={{ fontSize:9, color:'var(--muted)', letterSpacing:3, marginTop:5 }}>{l.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="fade-up">
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:22, paddingBottom:20, borderBottom:'1px solid var(--border)' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:10, marginBottom:10 }}>
                    <span style={{ padding:'3px 14px', borderRadius:24, fontSize:10, fontWeight:700, letterSpacing:2, background:getCatColor(activeWork.type)+'18', color:getCatColor(activeWork.type), border:`1px solid ${getCatColor(activeWork.type)}35` }}>{activeWork.type.toUpperCase()}</span>
                    {activeWork.loa && <span style={{ fontSize:11, color:'var(--muted)', fontFamily:"'IBM Plex Mono',monospace" }}>LOA: {activeWork.loa}</span>}
                    {activeWork.location && <span style={{ fontSize:11, color:'var(--muted)' }}>📍 {activeWork.location}</span>}
                  </div>
                  <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:30, letterSpacing:2, lineHeight:1.1, color:'var(--text)' }}>{activeWork.name}</div>
                  {activeWork.notes && <div style={{ fontSize:12, color:'var(--muted)', marginTop:6, maxWidth:600 }}>{activeWork.notes}</div>}
                </div>
                {session.role === 'admin' && (
                  <button onClick={() => handleDeleteWork(activeWork.id)} style={{ background:'rgba(240,64,96,0.08)', border:'1px solid rgba(240,64,96,0.2)', color:'var(--red)', borderRadius:8, padding:'8px 16px', fontSize:11, cursor:'pointer', fontWeight:600, letterSpacing:1, flexShrink:0 }}>🗑 DELETE</button>
                )}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10, marginBottom:22 }}>
                {[
                  { v:totalFiles,    l:'Total Files',  c:'var(--accent)',  icon:'📄' },
                  { v:folderTypes.length, l:'Folders', c:'var(--accent2)', icon:'📁' },
                  { v:activeWork.type, l:'Category',   c:getCatColor(activeWork.type), icon:'🏷' },
                  { v:new Date(activeWork.created_at).toLocaleDateString('en-IN'), l:'Created', c:'var(--muted)', icon:'📅' },
                ].map(({v,l,c,icon}) => (
                  <div key={l} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, padding:'14px 16px', position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', right:12, top:12, fontSize:20, opacity:0.1 }}>{icon}</div>
                    <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:26, color:c, lineHeight:1 }}>{v}</div>
                    <div style={{ fontSize:9, color:'var(--muted)', letterSpacing:2, marginTop:4 }}>{l.toUpperCase()}</div>
                  </div>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10, marginBottom:22 }}>
                {folderTypes.map((f, i) => {
                  const isActive = activeFolder===f.key;
                  const count = activeWork.fileCounts?.[f.key]||0;
                  return (
                    <div key={f.key} onClick={() => setActiveFolder(isActive ? null : f.key)} style={{ background: isActive ? `${f.color}0e` : 'var(--card)', border:`1px solid ${isActive ? f.color+'50' : 'var(--border)'}`, borderRadius:10, padding:'16px 14px', cursor:'pointer', transition:'all 0.2s', boxShadow: isActive ? `0 0 18px ${f.color}14` : 'none', animation:`fadeUp 0.25s ease ${i*0.04}s both`, position:'relative', overflow:'hidden' }}>
                      {isActive && <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, transparent, ${f.color}, transparent)` }} />}
                      <div style={{ fontSize:24, marginBottom:10 }}>{f.icon}</div>
                      <div style={{ fontSize:11, fontWeight:700, color: isActive ? f.color : 'var(--text)', letterSpacing:0.5 }}>{f.name}</div>
                      <div style={{ fontSize:10, color:'var(--muted)', marginTop:4, fontFamily:"'IBM Plex Mono',monospace" }}>{count} {count===1?'file':'files'}</div>
                    </div>
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
        <AddWorkModal categories={categories} onClose={() => setShowAddWork(false)} onCreated={() => { fetchAll(); setShowAddWork(false); }} />
      )}
    </div>
  );
}
