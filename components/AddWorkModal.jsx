'use client';
import { useState } from 'react';

export default function AddWorkModal({ onClose, onCreated, categories = [] }) {
  const [name, setName]         = useState('');
  const [category, setCategory] = useState('');
  const [loa, setLoa]           = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  async function handleSave() {
    if (!name.trim()) { setError('Work name is required'); return; }
    if (!category)    { setError('Please select a category'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/works', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type: category, loa: loa||null, location: location||null, notes: notes||null }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error||'Failed'); return; }
      onCreated();
    } finally { setSaving(false); }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: 24, backdropFilter: 'blur(8px)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fade-up" style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '28px', width: '100%', maxWidth: 480,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div>
            <div style={{ fontSize:9, color:'var(--accent)', letterSpacing:3, marginBottom:4, fontWeight:700 }}>NEW ENTRY</div>
            <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:24, letterSpacing:2, color:'var(--text)' }}>Add Work</div>
          </div>
          <button onClick={onClose} style={{ background:'transparent', border:'none', color:'var(--muted)', fontSize:20, cursor:'pointer', lineHeight:1 }}>✕</button>
        </div>

        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:9, color:'var(--muted)', letterSpacing:2, display:'block', marginBottom:10 }}>CATEGORY *</label>
          {categories.length === 0 ? (
            <div style={{ fontSize:12, color:'var(--muted)', padding:'10px 14px', border:'1px solid var(--border)', borderRadius:8, fontStyle:'italic' }}>
              No categories yet — add them in ⚙ Settings first
            </div>
          ) : (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.name)} style={{
                  padding:'9px 20px', borderRadius:9, cursor:'pointer', fontWeight:700, fontSize:12,
                  border:`1px solid ${category===cat.name ? cat.color : 'var(--border)'}`,
                  background: category===cat.name ? cat.color+'18' : 'transparent',
                  color: category===cat.name ? cat.color : 'var(--muted)',
                  transition:'all 0.15s',
                  boxShadow: category===cat.name ? `0 0 14px ${cat.color}22` : 'none',
                }}>{cat.name}</button>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:9, color:'var(--muted)', letterSpacing:2, display:'block', marginBottom:6 }}>WORK NAME *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. NHAI Road Project Phase 3" autoFocus />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          <div>
            <label style={{ fontSize:9, color:'var(--muted)', letterSpacing:2, display:'block', marginBottom:6 }}>LOA NO.</label>
            <input value={loa} onChange={e => setLoa(e.target.value)} placeholder="LOA-2024-001" />
          </div>
          <div>
            <label style={{ fontSize:9, color:'var(--muted)', letterSpacing:2, display:'block', marginBottom:6 }}>LOCATION</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Chennai, TN" />
          </div>
        </div>

        <div style={{ marginBottom:22 }}>
          <label style={{ fontSize:9, color:'var(--muted)', letterSpacing:2, display:'block', marginBottom:6 }}>NOTES</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes…" style={{ resize:'vertical', minHeight:68 }} />
        </div>

        {error && (
          <div style={{ background:'rgba(240,64,96,0.1)', border:'1px solid rgba(240,64,96,0.25)', borderRadius:7, padding:'10px 14px', fontSize:12, color:'var(--red)', marginBottom:16 }}>{error}</div>
        )}

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:'11px', background:'transparent', border:'1px solid var(--border)', borderRadius:9, color:'var(--muted)', fontSize:12, cursor:'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{
            flex:2, padding:'11px',
            background:'linear-gradient(135deg, rgba(232,160,32,0.25), rgba(245,200,66,0.12))',
            border:'1px solid rgba(232,160,32,0.4)', borderRadius:9, color:'var(--accent)',
            fontWeight:700, fontSize:12, letterSpacing:1, cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1,
          }}>{saving ? 'SAVING…' : 'ADD WORK →'}</button>
        </div>
      </div>
    </div>
  );
}
