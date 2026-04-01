'use client';
import { useState, useEffect } from 'react';

const COLORS = ['#ffd166', '#57f287', '#8b5cf6', '#38bdf8', '#ff5db1', '#fb7185', '#f59e0b', '#22c55e', '#a78bfa', '#e879f9'];
const ICONS = ['📁', '📄', '📋', '🧾', '📦', '🛡️', '📌', '🗂️', '📝', '📷', '🔐', '⚙️', '🏷️', '📑', '📊'];

export default function SettingsPanel({ categories, folderTypes, onClose, onRefresh }) {
  const [tab, setTab] = useState('categories');
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('#ffd166');
  const [ftName, setFtName] = useState('');
  const [ftIcon, setFtIcon] = useState('📁');
  const [ftColor, setFtColor] = useState('#8b5cf6');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setError(''), [tab]);

  async function addCategory() {
    if (!catName.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: catName.trim(), color: catColor }) });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed'); return; }
      setCatName(''); onRefresh();
    } finally { setSaving(false); }
  }

  async function deleteCategory(id) {
    if (!confirm('Delete this category?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    onRefresh();
  }

  async function addFolderType() {
    if (!ftName.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/folder-types', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: ftName.trim(), icon: ftIcon, color: ftColor }) });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed'); return; }
      setFtName(''); onRefresh();
    } finally { setSaving(false); }
  }

  async function deleteFolderType(id) {
    if (!confirm('Delete this folder type?')) return;
    const res = await fetch(`/api/folder-types/${id}`, { method: 'DELETE' });
    if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed'); return; }
    onRefresh();
  }

  const ColorPicker = ({ value, onChange }) => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {COLORS.map((c) => (
        <button key={c} onClick={() => onChange(c)} style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer', outline: value === c ? '2px solid #fff' : '2px solid transparent', outlineOffset: 2, boxShadow: value === c ? `0 0 20px ${c}` : 'none' }} />
      ))}
    </div>
  );

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--accent-4)', textTransform: 'uppercase', letterSpacing: '0.22em', fontWeight: 800 }}>Configuration</div>
          <div className="premium-title neon-text" style={{ fontSize: 40, fontWeight: 700, marginTop: 6 }}>Settings</div>
        </div>
        <button onClick={onClose} className="btn-ghost">Close</button>
      </div>

      <div className="panel" style={{ padding: 22 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <button onClick={() => setTab('categories')} className={tab === 'categories' ? 'btn-premium' : 'btn-ghost'}>Work Categories</button>
          <button onClick={() => setTab('folders')} className={tab === 'folders' ? 'btn-home' : 'btn-ghost'}>Folder Types</button>
        </div>

        {error && <div style={{ marginBottom: 16, borderRadius: 14, padding: '12px 14px', background: 'rgba(255,107,129,0.08)', border: '1px solid rgba(255,107,129,0.2)', color: '#ffdce2', fontSize: 13 }}>{error}</div>}

        {tab === 'categories' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 22 }}>
            <div className="glass-card" style={{ borderRadius: 24, padding: 18 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 12 }}>Add category</div>
              <input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. Joint Venture" />
              <div style={{ marginTop: 14, marginBottom: 10, color: 'var(--muted)', fontSize: 12 }}>Choose color</div>
              <ColorPicker value={catColor} onChange={setCatColor} />
              <button onClick={addCategory} disabled={saving} className="btn-premium" style={{ marginTop: 18, width: '100%' }}>{saving ? 'SAVING…' : 'ADD CATEGORY'}</button>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {categories.map((cat) => (
                <div key={cat.id} className="glass-card" style={{ borderRadius: 20, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: cat.color, boxShadow: `0 0 18px ${cat.color}` }} />
                    <div>
                      <div style={{ fontWeight: 800 }}>{cat.name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>{cat.color}</div>
                    </div>
                  </div>
                  <button onClick={() => deleteCategory(cat.id)} className="btn-danger">Delete</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '430px 1fr', gap: 22 }}>
            <div className="glass-card" style={{ borderRadius: 24, padding: 18 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 12 }}>Add folder type</div>
              <input value={ftName} onChange={(e) => setFtName(e.target.value)} placeholder="e.g. Safety Reports" />
              <div style={{ marginTop: 14, color: 'var(--muted)', fontSize: 12, marginBottom: 8 }}>Choose icon</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ICONS.map((icon) => (
                  <button key={icon} onClick={() => setFtIcon(icon)} style={{ width: 42, height: 42, borderRadius: 12, border: `1px solid ${ftIcon === icon ? 'var(--accent-3)' : 'var(--border)'}`, background: ftIcon === icon ? 'var(--accent-purple-soft)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', fontSize: 20 }}>{icon}</button>
                ))}
              </div>
              <div style={{ marginTop: 14, color: 'var(--muted)', fontSize: 12, marginBottom: 8 }}>Choose color</div>
              <ColorPicker value={ftColor} onChange={setFtColor} />
              <button onClick={addFolderType} disabled={saving} className="btn-home" style={{ marginTop: 18, width: '100%' }}>{saving ? 'SAVING…' : 'ADD FOLDER TYPE'}</button>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {folderTypes.map((ft) => (
                <div key={ft.id} className="glass-card" style={{ borderRadius: 20, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 16, background: `${ft.color}20`, display: 'grid', placeItems: 'center', fontSize: 24, boxShadow: `0 0 18px ${ft.color}24` }}>{ft.icon}</div>
                    <div>
                      <div style={{ fontWeight: 800 }}>{ft.name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>{ft.key} · {ft.color}</div>
                    </div>
                  </div>
                  <button onClick={() => deleteFolderType(ft.id)} className="btn-danger">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
