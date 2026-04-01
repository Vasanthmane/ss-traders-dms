'use client';
import { useState } from 'react';

export default function AddWorkModal({ onClose, onCreated, categories = [] }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [loa, setLoa] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!name.trim()) { setError('Work name is required'); return; }
    if (!category) { setError('Please select a category'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type: category, loa: loa || null, location: location || null, notes: notes || null }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Failed');
        return;
      }
      onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2500, background: 'rgba(6,8,15,0.72)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="panel fade-up" style={{ width: '100%', maxWidth: 620, padding: 28, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 24, background: 'linear-gradient(180deg, rgba(255,255,255,0.04), transparent 24%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 800 }}>Create workspace</div>
              <div className="premium-title" style={{ fontSize: 34, fontWeight: 700, marginTop: 6 }}>Add new work</div>
              <div style={{ color: 'var(--muted)', fontSize: 14, marginTop: 8 }}>Create a premium document container with category, LOA reference, and location details.</div>
            </div>
            <button onClick={onClose} className="btn-ghost">Close</button>
          </div>

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
                    transition: 'all .18s ease',
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

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes, department, or owner details…" style={{ minHeight: 100, resize: 'vertical' }} />
          </div>

          {error && <div style={{ marginBottom: 16, borderRadius: 14, border: '1px solid rgba(255,107,129,0.2)', background: 'rgba(255,107,129,0.08)', padding: '12px 14px', color: '#ffdce2', fontSize: 13 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button onClick={onClose} className="btn-ghost">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-premium">{saving ? 'SAVING…' : 'CREATE WORK'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
