'use client';
import { useState, useEffect } from 'react';

const PALETTE = ['#2563eb','#3b82f6','#6366f1','#8b5cf6','#a855f7','#ec4899','#ef4444','#f97316','#f59e0b','#22c55e','#14b8a6','#06b6d4','#64748b','#94a3b8'];
const ICONS   = ['📋','📁','🧾','💳','📐','🏅','✉️','📎','📊','📦','🔑','📌','🗂️','📝','🔧','📷','🗃️','📑','🏷️','⚡','🛡️','📈','🔍','📃'];

export default function SettingsPanel({ categories, folderTypes, onClose, onRefresh }) {
  const [tab, setTab]           = useState('categories');
  const [catName, setCatName]   = useState('');
  const [catColor, setCatColor] = useState('#2563eb');
  const [ftName, setFtName]     = useState('');
  const [ftIcon, setFtIcon]     = useState('📁');
  const [ftColor, setFtColor]   = useState('#3b82f6');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => { setError(''); }, [tab]);

  async function addCategory() {
    if (!catName.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: catName.trim(), color: catColor }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed'); return; }
      setCatName(''); onRefresh();
    } finally { setSaving(false); }
  }

  async function deleteCategory(id) {
    if (!confirm('Delete this category?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' }); onRefresh();
  }

  async function addFolderType() {
    if (!ftName.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/folder-types', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: ftName.trim(), icon: ftIcon, color: ftColor }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed'); return; }
      setFtName(''); onRefresh();
    } finally { setSaving(false); }
  }

  async function deleteFolderType(id) {
    if (!confirm('Delete this folder type?')) return;
    const res = await fetch(`/api/folder-types/${id}`, { method: 'DELETE' });
    if (!res.ok) { const d = await res.json(); setError(d.error || 'Cannot delete built-in types'); }
    onRefresh();
  }

  const Swatch = ({ value, onChange }) => (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {PALETTE.map(c => (
        <button key={c} onClick={() => onChange(c)} style={{
          width: 24, height: 24, borderRadius: '50%', background: c,
          border: 'none', cursor: 'pointer', padding: 0,
          outline: value === c ? '2px solid #fff' : '2px solid transparent',
          outlineOffset: 2,
          boxShadow: value === c ? `0 0 10px ${c}80` : 'none',
          transition: 'all 0.15s',
        }} />
      ))}
    </div>
  );

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--blue-light)', letterSpacing: '0.2em', fontWeight: 600, marginBottom: 4 }}>ADMIN</div>
          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>Settings</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Manage work categories and folder types used across the system.</div>
        </div>
        <button onClick={onClose} className="btn btn-outline btn-sm" style={{ borderRadius: 8 }}>✕ Close</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {[['categories','🏷 Work Categories'],['folders','📁 Folder Types']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '10px 20px', background: 'transparent', border: 'none',
            borderBottom: `2px solid ${tab === key ? 'var(--blue-light)' : 'transparent'}`,
            color: tab === key ? 'var(--blue-light)' : 'var(--muted)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.05em',
            transition: 'all 0.15s',
          }}>{label}</button>
        ))}
      </div>

      {/* ── CATEGORIES ── */}
      {tab === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
          {/* Existing */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.15em', marginBottom: 12, fontWeight: 600 }}>EXISTING CATEGORIES</div>
            {categories.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 13, border: '1px dashed var(--border)', borderRadius: 10 }}>
                No categories yet. Add one →
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {categories.map(c => (
                  <div key={c.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, boxShadow: `0 0 8px ${c.color}80`, display: 'inline-block' }} />
                      <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{c.name}</span>
                      <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{c.color}</span>
                    </div>
                    <button onClick={() => deleteCategory(c.id)} className="btn btn-danger btn-sm" style={{ borderRadius: 7 }}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add form */}
          <div className="card" style={{ padding: 20, position: 'sticky', top: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--blue-light)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 16 }}>ADD CATEGORY</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em', display: 'block', marginBottom: 6 }}>NAME *</label>
              <input value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. Joint Venture" onKeyDown={e => e.key === 'Enter' && addCategory()} style={{ height: 38 }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em', display: 'block', marginBottom: 8 }}>COLOUR</label>
              <Swatch value={catColor} onChange={setCatColor} />
            </div>
            {/* Preview */}
            {catName && (
              <div style={{ marginBottom: 14, padding: '8px 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 6, background: catColor + '18', border: `1px solid ${catColor}35`, color: catColor, fontSize: 12, fontWeight: 700 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: catColor }} />
                {catName}
              </div>
            )}
            {error && <div style={{ color: '#f87171', fontSize: 12, marginBottom: 10 }}>{error}</div>}
            <button onClick={addCategory} disabled={saving} className="btn btn-primary" style={{ width: '100%', borderRadius: 9 }}>
              {saving ? 'Adding…' : '+ Add Category'}
            </button>
          </div>
        </div>
      )}

      {/* ── FOLDER TYPES ── */}
      {tab === 'folders' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
          {/* Existing */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.15em', marginBottom: 12, fontWeight: 600 }}>ALL FOLDER TYPES</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 8 }}>
              {folderTypes.map(f => (
                <div key={f.id} className="card" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', border: `1px solid ${f.color}20`,
                  background: f.color + '08',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{f.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: f.color }}>{f.name}</div>
                      {f.is_system && <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.12em' }}>BUILT-IN</div>}
                    </div>
                  </div>
                  {!f.is_system && (
                    <button onClick={() => deleteFolderType(f.id)} className="btn btn-danger btn-sm" style={{ borderRadius: 6, padding: '0 8px', minWidth: 0 }}>×</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add form */}
          <div className="card" style={{ padding: 20, position: 'sticky', top: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--blue-light)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 16 }}>ADD FOLDER TYPE</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em', display: 'block', marginBottom: 6 }}>NAME *</label>
              <input value={ftName} onChange={e => setFtName(e.target.value)} placeholder="e.g. Safety Reports" onKeyDown={e => e.key === 'Enter' && addFolderType()} style={{ height: 38 }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em', display: 'block', marginBottom: 6 }}>ICON</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setFtIcon(ic)} style={{
                    width: 34, height: 34, borderRadius: 7, fontSize: 16,
                    background: ftIcon === ic ? 'var(--blue-soft)' : 'transparent',
                    border: `1px solid ${ftIcon === ic ? 'var(--blue-light)' : 'var(--border)'}`,
                    cursor: 'pointer', transition: 'all 0.12s',
                  }}>{ic}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em', display: 'block', marginBottom: 8 }}>COLOUR</label>
              <Swatch value={ftColor} onChange={setFtColor} />
            </div>
            {/* Preview */}
            {ftName && (
              <div className="card" style={{ padding: '10px 14px', marginBottom: 14, border: `1px solid ${ftColor}30`, background: ftColor + '08', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{ftIcon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: ftColor }}>{ftName}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>0 files</div>
                </div>
              </div>
            )}
            {error && <div style={{ color: '#f87171', fontSize: 12, marginBottom: 10 }}>{error}</div>}
            <button onClick={addFolderType} disabled={saving} className="btn btn-primary" style={{ width: '100%', borderRadius: 9 }}>
              {saving ? 'Adding…' : '+ Add Folder Type'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
