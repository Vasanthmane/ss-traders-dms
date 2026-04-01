'use client';
import { useEffect, useState } from 'react';

export default function UsersPanel({ works, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editWorkIds, setEditWorkIds] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', workIds: [] });

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchUsers(); }, []);

  function toggleWorkId(arr, wid) {
    return arr.includes(wid) ? arr.filter((x) => x !== wid) : [...arr, wid];
  }

  async function handleCreate() {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Name, username, and password are required');
      return;
    }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, name: form.name.trim(), email: form.email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setForm({ name: '', email: '', password: '', role: 'user', workIds: [] });
      setShowAdd(false);
      fetchUsers();
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this user?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  }

  async function handleSaveWorks(id) {
    await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workIds: editWorkIds }),
    });
    setEditingUser(null);
    fetchUsers();
  }

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--accent-4)', textTransform: 'uppercase', letterSpacing: '0.22em', fontWeight: 800 }}>Access control</div>
          <div className="premium-title neon-text" style={{ fontSize: 40, fontWeight: 700, marginTop: 6 }}>Users</div>
          <div style={{ marginTop: 8, color: 'var(--muted)', fontSize: 14 }}>Create users, assign work access, and manage admin privileges.</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowAdd((v) => !v)} className="btn-premium">+ Add user</button>
          <button onClick={onClose} className="btn-ghost">Close</button>
        </div>
      </div>

      {showAdd && (
        <div className="panel" style={{ padding: 22, marginBottom: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr', gap: 14 }}>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" />
            <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Username or email" />
            <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Temporary password" />
            <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Assign works</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {works.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setForm((f) => ({ ...f, workIds: toggleWorkId(f.workIds, w.id) }))}
                  style={{
                    padding: '9px 14px',
                    borderRadius: 14,
                    border: `1px solid ${form.workIds.includes(w.id) ? 'var(--accent-2)' : 'var(--border)'}`,
                    background: form.workIds.includes(w.id) ? 'var(--accent-green-soft)' : 'rgba(255,255,255,0.03)',
                    color: form.workIds.includes(w.id) ? 'var(--accent-2)' : 'var(--text-2)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {w.name}
                </button>
              ))}
            </div>
          </div>

          {error && <div style={{ marginTop: 14, borderRadius: 14, padding: '12px 14px', background: 'rgba(255,107,129,0.08)', border: '1px solid rgba(255,107,129,0.2)', color: '#ffdce2', fontSize: 13 }}>{error}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
            <button onClick={handleCreate} disabled={saving} className="btn-premium">{saving ? 'SAVING…' : 'CREATE USER'}</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="panel" style={{ padding: 22, color: 'var(--muted)' }}>Loading users…</div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {users.map((u) => (
            <div key={u.id} className="panel" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 18, background: u.role === 'admin' ? 'var(--accent-soft)' : 'var(--accent-purple-soft)', color: u.role === 'admin' ? 'var(--accent)' : 'var(--accent-3)', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 20, boxShadow: u.role === 'admin' ? 'var(--shadow-gold)' : 'var(--shadow-purple)' }}>{u.name?.[0]?.toUpperCase() || 'U'}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{u.name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 13 }}>{u.email}</div>
                    <div style={{ marginTop: 8, display: 'inline-flex', padding: '6px 10px', borderRadius: 999, background: u.role === 'admin' ? 'var(--accent-soft)' : 'var(--accent-purple-soft)', color: u.role === 'admin' ? 'var(--accent)' : 'var(--accent-3)', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{u.role}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setEditingUser(editingUser === u.id ? null : u.id); setEditWorkIds(u.work_ids || []); }} className="btn-secondary">{editingUser === u.id ? 'Close' : 'Works'}</button>
                  <button onClick={() => handleDelete(u.id)} className="btn-danger">Delete</button>
                </div>
              </div>

              {editingUser !== u.id && (u.work_ids || []).length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                  {u.work_ids.map((wid) => {
                    const w = works.find((x) => x.id === wid);
                    return w ? <span key={wid} style={{ padding: '7px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: 12 }}>{w.name}</span> : null;
                  })}
                </div>
              )}

              {editingUser === u.id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.14em' }}>Adjust work access</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {works.map((w) => (
                      <button key={w.id} onClick={() => setEditWorkIds((ids) => toggleWorkId(ids, w.id))} style={{ padding: '9px 14px', borderRadius: 14, border: `1px solid ${editWorkIds.includes(w.id) ? 'var(--accent-4)' : 'var(--border)'}`, background: editWorkIds.includes(w.id) ? 'var(--accent-blue-soft)' : 'rgba(255,255,255,0.03)', color: editWorkIds.includes(w.id) ? 'var(--accent-4)' : 'var(--text-2)', fontWeight: 700, cursor: 'pointer' }}>{w.name}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                    <button onClick={() => handleSaveWorks(u.id)} className="btn-premium">Save Assignments</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
