'use client';
import { useState, useEffect } from 'react';

const COLORS = ['#e8a020','#5b6cf5','#12c4a0','#f04060','#b06aff','#ff7060','#00d4ff','#ff0080','#22c55e','#f59e0b'];
const ICONS  = ['📋','📁','🧾','💳','📐','🏅','✉️','📎','📊','📦','🔑','📌','🗂️','📝','🔧','📷','🗃️','📑','🏷️','⚡'];

export default function SettingsPanel({ categories, folderTypes, onClose, onRefresh }) {
  const [tab, setTab]         = useState('categories');
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('#e8a020');
  const [ftName, setFtName]   = useState('');
  const [ftIcon, setFtIcon]   = useState('📁');
  const [ftColor, setFtColor] = useState('#5b6cf5');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => { setError(''); }, [tab]);

  async function addCategory() {
    if (!catName.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/categories', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name: catName.trim(), color: catColor }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error||'Failed'); return; }
      setCatName(''); onRefresh();
    } finally { setSaving(false); }
  }

  async function deleteCategory(id) {
    if (!confirm('Delete this category?')) return;
    await fetch(`/api/categories/${id}`, { method:'DELETE' });
    onRefresh();
  }

  async function addFolderType() {
    if (!ftName.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/folder-types', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name: ftName.trim(), icon: ftIcon, color: ftColor }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error||'Failed'); return; }
      setFtName(''); onRefresh();
    } finally { setSaving(false); }
  }

  async function deleteFolderType(id) {
    if (!confirm('Delete this folder type?')) return;
    const res = await fetch(`/api/folder-types/${id}`, { method:'DELETE' });
    if (!res.ok) { const d = await res.json(); setError(d.error||'Failed'); return; }
    onRefresh();
  }

  const ColorPicker = ({ value, onChange }) => (
    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
      {COLORS.map(c => (
        <button key={c} onClick={() => onChange(c)} style={{
          width:22, height:22, borderRadius:'50%', background:c, padding:0, border:'none',
          cursor:'pointer',
          outline: value===c ? '2px solid #fff' : '2px solid transparent',
          outlineOffset:2,
          boxShadow: value===c ? `0 0 8px ${c}` : 'none',
          transition:'all 0.15s',
        }} />
      ))}
    </div>
  );

  return (
    <div className="fade-up">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <div style={{ fontSize:9, color:'var(--accent)', letterSpacing:4, fontWeight:700, marginBottom:4 }}>ADMIN</div>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:28, letterSpacing:2, color:'var(--text)' }}>Settings</div>
        </div>
        <button onClick={onClose} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, padding:'8px 16px', color:'var(--muted)', fontSize:12, cursor:'pointer' }}>✕ Close</button>
      </div>

      <div style={{ display:'flex', gap:0, marginBottom:28, borderBottom:'1px solid var(--border)' }}>
        {[['categories','🏷 Work Categories'],['folders','📁 Folder Types']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding:'11px 22px', background:'transparent', border:'none',
            borderBottom:`2px solid ${tab===key ? 'var(--accent)' : 'transparent'}`,
            color: tab===key ? 'var(--accent)' : 'var(--muted)',
            fontSize:12, fontWeight:700, cursor:'pointer', letterSpacing:1, transition:'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'categories' && (
        <div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:24, minHeight:40 }}>
            {categories.length === 0 ? (
              <div style={{ fontSize:13, color:'var(--muted)', fontStyle:'italic' }}>No categories yet. Add one below.</div>
            ) : categories.map(c => (
              <div key={c.id} style={{
                display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:24,
                background:c.color+'14', border:`1px solid ${c.color}35`,
              }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:c.color, boxShadow:`0 0 6px ${c.color}` }} />
                <span style={{ fontSize:12, fontWeight:700, color:c.color }}>{c.name}</span>
                <button onClick={() => deleteCategory(c.id)} style={{ background:'transparent', border:'none', color:'var(--red)', cursor:'pointer', fontSize:16, lineHeight:1, padding:'0 0 0 2px', opacity:0.7 }}>×</button>
              </div>
            ))}
          </div>

          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'20px' }}>
            <div style={{ fontSize:9, color:'var(--muted)', letterSpacing:3, marginBottom:16, fontWeight:700 }}>ADD NEW CATEGORY</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:10, marginBottom:14 }}>
              <div>
                <label style={{ fontSize:9, color:'var(--muted)', letterSpacing:2, display:'block', marginBottom:6 }}>NAME</label>
                <input value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. Joint Venture" onKeyDown={e => e.key==='Enter' && addCategory()} />
              </div>
              <div style={{ display:'flex', alignItems:'flex-end' }}>
                <button onClick={addCategory} disabled={saving} style={{ padding:'9px 22px', background:'var(--accent)', border:'none', borderRadius:8, color:'#000', fontWeight:700, fontSize:12, cursor:'pointer', whiteSpace:'nowrap' }}>
                  {saving ? '…' : '+ Add'}
                </button>
              </div>
            </div>
            <div>
              <label style={{ fontSize:9, color:'var(--muted)', letterSpacing:2, display:'block', marginBottom:8 }}>COLOUR</label>
              <ColorPicker value={catColor} onChange={setCatColor} />
            </div>
            {error && <div style={{ color:'var(--red)', fontSize:12, marginTop:12 }}>{error}</div>}
          </div>
        </div>
      )}

      {tab === 'folders' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(170px, 1fr))', gap:8, marginBottom:24 }}>
            {folderTypes.map(f => (
              <div key={f.id} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'10px 14px', borderRadius:10,
                background:f.color+'10', border:`1px solid ${f.color}28`,
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:20 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:f.color }}>{f.name}</div>
                    {f.is_system && <div style={{ fontSize:9, color:'var(--muted)', letterSpacing:2 }}>BUILT-IN</div>}
                  </div>
                </div>
                {!f.is_system && (
                  <button onClick={() => deleteFolderType(f.id)} style={{ background:'transparent', border:'none', color:'var(--red)', cursor:'pointer', fontSize:16, opacity:0.7, lineHeight:1 }}>×</button>
                )}
              </div>
            ))}
          </div>

          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'20px' }}>
            <div style={{ fontSize:9, color:'var(--muted)', letterSpacing:3, marginBottom:16, fontWeight:700 }}>ADD NEW FOLDER TYPE</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:10, marginBottom:14, alignItems:'flex-end' }}>
              <div>
                <label style={{ fontSize:9, color:'var(--muted)', letterSpacing:2, display:'block', marginBottom:6 }}>NAME</label>
                <input value={ftName} onChange={e => setFtName(e.target.value)} placeholder="e.g. Safety Reports" onKeyDown={e => e.key==='Enter' && addFolderType()} />
              </div>
              <div>
                <label style={{ fontSize:9, color:'var(--muted)', letterSpacing:2, display:'block', marginBottom:6 }}>ICON</label>
                <select value={ftIcon} onChange={e => setFtIcon(e.target.value)} style={{ width:80 }}>
                  {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                </select>
              </div>
              <button onClick={addFolderType} disabled={saving} style={{ padding:'9px 22px', background:'var(--accent)', border:'none', borderRadius:8, color:'#000', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                {saving ? '…' : '+ Add'}
              </button>
            </div>
            <div>
              <label style={{ fontSize:9, color:'var(--muted)', letterSpacing:2, display:'block', marginBottom:8 }}>COLOUR</label>
              <ColorPicker value={ftColor} onChange={setFtColor} />
            </div>
            {error && <div style={{ color:'var(--red)', fontSize:12, marginTop:12 }}>{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
