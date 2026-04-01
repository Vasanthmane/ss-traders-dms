'use client';
import { useState } from 'react';

export default function AddWorkModal({ categories, onClose, onCreated }) {
  const [category, setCategory] = useState(categories[0]?.name || '');
  const [name, setName] = useState('');
  const [loa, setLoa] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!name.trim()) { setError('Work name is required'); return; }
    if (!category) { setError('Choose a category first'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type: category, loa: loa.trim() || null, location: location.trim() || null, notes: notes.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create work'); return; }
      onCreated?.(data);
    } finally { setSaving(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(3,5,14,0.76)', backdropFilter: 'blur(14px)', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div className="panel fade-up" style={{ width: 'min(980px, 100%)', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--accent-4)', textTransform: 'uppercase', letterSpacing: '0.22em', fontWeight: 800 }}>Create work</div>
            <div className="premium-title neon-text" style={{ fontSize: 38, fontWeight: 700, marginTop: 6 }}>New project workspace</div>
            <div style={{ marginTop: 8, color: 'var(--muted)', fontSize: 14 }}>Set up a clean file shell for a new project, location, or operational stream.</div>
          </div>
          <button onClick={onClose} className="btn-ghost">Close</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 18 }}>
          <div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', marginBottom: 10, fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Category *</label>
              {categories.length === 0 ? (
                <div className="glass-card" style={{ borderRadius: 16, padding: 14, color: 'var(--muted)' }}>No categories yet — add them from Settings first.</div>
              ) : (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {categories.map((cat) => (
                    <button key={cat.id} onClick={() => setCategory(cat.name)} style={{
                      padding: '10px 16px',
                      borderRadius: 14,
                      border: `1px solid ${category === cat.name ? cat.color : 'var(--border)'}`,
                      background: category === cat.name ? `${cat.color}22` : 'rgba(255,255,255,0.03)',
                      color: category === cat.name ? cat.color : 'var(--text-2)',
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: category === cat.name ? `0 14px 24px ${cat.color}24` : 'none',
                    }}>{cat.name}</button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Work name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. NH Project – Package A" autoFocus />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>LOA No.</label>
                <input value={loa} onChange={(e) => setLoa(e.target.value)} placeholder="LOA-2026-001" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Location</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Mumbai / Chennai / Site name" />
              </div>
              <div className="glass-card" style={{ borderRadius: 18, padding: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Pro tip</div>
                <div style={{ marginTop: 8, color: 'var(--text-2)', fontSize: 13, lineHeight: 1.6 }}>Use a consistent naming format so search works better for your team later.</div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes, department, or owner details…" style={{ minHeight: 100, resize: 'vertical' }} />
            </div>
          </div>

          <div className="glass-card" style={{ borderRadius: 24, padding: 18 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Preview</div>
            <div className="premium-title" style={{ fontSize: 28, fontWeight: 700, marginTop: 10 }}>{name || 'Untitled work'}</div>
            <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {category && <span style={{ padding: '8px 12px', borderRadius: 999, background: 'var(--accent-purple-soft)', color: 'var(--accent-3)', fontWeight: 800, fontSize: 12 }}>{category}</span>}
              {loa && <span style={{ padding: '8px 12px', borderRadius: 999, background: 'var(--accent-blue-soft)', color: 'var(--accent-4)', fontWeight: 800, fontSize: 12 }}>{loa}</span>}
              {location && <span style={{ padding: '8px 12px', borderRadius: 999, background: 'var(--accent-green-soft)', color: 'var(--accent-2)', fontWeight: 800, fontSize: 12 }}>{location}</span>}
            </div>
            <div style={{ marginTop: 16, color: 'var(--muted)', fontSize: 13, lineHeight: 1.7 }}>{notes || 'This new workspace will inherit your category structure and become available for file uploads immediately after creation.'}</div>
          </div>
        </div>

        {error && <div style={{ marginTop: 16, borderRadius: 14, border: '1px solid rgba(255,107,129,0.2)', background: 'rgba(255,107,129,0.08)', padding: '12px 14px', color: '#ffdce2', fontSize: 13 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 18 }}>
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-premium">{saving ? 'SAVING…' : 'CREATE WORK'}</button>
        </div>
      </div>
    </div>
  );
}
