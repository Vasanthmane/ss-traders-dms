'use client';
import { useState } from 'react';

export default function AddWorkModal({ categories = [], onClose, onCreated }) {
  const [category, setCategory] = useState('');
  const [name, setName]         = useState('');
  const [loa, setLoa]           = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  function getCatColor(n) {
    return categories.find(c => c.name === n)?.color || 'var(--blue-light)';
  }

  async function handleSave() {
    if (!name.trim()) { setError('Work name is required'); return; }
    if (!category)    { setError('Select a category'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/works', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type: category, loa: loa || null, location: location || null, notes: notes || null }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed'); return; }
      onCreated?.();
    } finally { setSaving(false); }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(5,8,18,0.80)',
      backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="card fade-up" style={{ width: '100%', maxWidth: 560, padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--blue-light)', letterSpacing: '0.2em', fontWeight: 600, marginBottom: 4 }}>NEW ENTRY</div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 22, color: 'var(--text)' }}>Add Work</div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ borderRadius: 8 }}>✕</button>
        </div>

        {/* Category picker */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em', display: 'block', marginBottom: 10, fontWeight: 600 }}>CATEGORY *</label>
          {categories.length === 0 ? (
            <div style={{ padding: '12px 16px', borderRadius: 10, border: '1px dashed var(--border)', color: 'var(--muted)', fontSize: 13 }}>
              No categories — go to ⚙ Settings to add one first.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {categories.map(cat => {
                const active = category === cat.name;
                return (
                  <button key={cat.id} onClick={() => setCategory(cat.name)} style={{
                    padding: '8px 18px', borderRadius: 999, fontWeight: 600, fontSize: 12,
                    border: `1px solid ${active ? cat.color : 'var(--border)'}`,
                    background: active ? cat.color + '18' : 'transparent',
                    color: active ? cat.color : 'var(--text-2)',
                    cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: active ? `0 0 14px ${cat.color}28` : 'none',
                  }}>{cat.name}</button>
                );
              })}
            </div>
          )}
        </div>

        {/* Work name */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em', display: 'block', marginBottom: 6, fontWeight: 600 }}>WORK NAME *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. NHAI Road Project Phase 3" autoFocus style={{ height: 40 }} />
        </div>

        {/* LOA + Location */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em', display: 'block', marginBottom: 6, fontWeight: 600 }}>LOA NO.</label>
            <input value={loa} onChange={e => setLoa(e.target.value)} placeholder="LOA-2025-001" style={{ height: 40 }} />
          </div>
          <div>
            <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em', display: 'block', marginBottom: 6, fontWeight: 600 }}>LOCATION</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Chennai, TN" style={{ height: 40 }} />
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em', display: 'block', marginBottom: 6, fontWeight: 600 }}>NOTES</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes or details…" style={{ minHeight: 72, resize: 'vertical' }} />
        </div>

        {/* Live preview strip */}
        {(name || category) && (
          <div style={{
            marginBottom: 18, padding: '12px 16px', borderRadius: 10,
            background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)',
            display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          }}>
            {category && (
              <span style={{ padding: '3px 12px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: getCatColor(category) + '18', color: getCatColor(category), border: `1px solid ${getCatColor(category)}35` }}>
                {category.toUpperCase()}
              </span>
            )}
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{name || 'Work name…'}</span>
            {location && <span style={{ fontSize: 11, color: 'var(--muted)' }}>📍 {location}</span>}
          </div>
        )}

        {error && (
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 9, background: 'var(--red-soft)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: 13 }}>{error}</div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-outline" style={{ borderRadius: 9 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ borderRadius: 9, minWidth: 120 }}>
            {saving ? 'Saving…' : 'Create Work →'}
          </button>
        </div>
      </div>
    </div>
  );
}
