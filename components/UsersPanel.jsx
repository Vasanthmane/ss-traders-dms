'use client';
import { useEffect, useState } from 'react';

export default function UsersPanel({ works, onClose }) {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showAdd, setShowAdd]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editWorkIds, setEditWorkIds] = useState([]);
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'user', workIds: [] });

  async function fetchUsers() {
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/users');
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); setUsers([]); return; }
      setUsers(Array.isArray(data) ? data : []);
    } catch { setError('Failed to load users'); }
    finally { setLoading(false); }
  }
  useEffect(() => { fetchUsers(); }, []);

  function toggleId(arr, id) { return arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]; }

  async function handleCreate() {
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) {
      setError('Name, username and password are required'); return;
    }
    setSaving(true); setError('');
    try {
      const res  = await fetch('/api/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setForm({ name: '', username: '', password: '', role: 'user', workIds: [] });
      setShowAdd(false); fetchUsers();
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this user?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' }); fetchUsers();
  }

  async function handleSaveWorks(id) {
    await fetch(`/api/users/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workIds: editWorkIds }),
    });
    setEditingUser(null); fetchUsers();
  }

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--blue-light)', letterSpacing: '0.2em', fontWeight: 600, marginBottom: 4 }}>ADMIN</div>
          <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 26, color: 'var(--text)' }}>User Management</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Create users, assign work access and manage permissions.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowAdd(v => !v)} className="btn btn-primary btn-sm" style={{ borderRadius: 8 }}>+ Add User</button>
          <button onClick={onClose} className="btn btn-outline btn-sm" style={{ borderRadius: 8 }}>✕ Close</button>
        </div>
      </div>

      {/* Add user form */}
      {showAdd && (
        <div className="card" style={{ padding: 20, marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: 'var(--blue-light)', letterSpacing: '0.15em', fontWeight: 700, marginBottom: 16 }}>NEW USER</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em', display: 'block', marginBottom: 5 }}>FULL NAME *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name" style={{ height: 38 }} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em', display: 'block', marginBottom: 5 }}>USERNAME * (used to login)</label>
              <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="e.g. vasanth" autoCapitalize="none" style={{ height: 38 }} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em', display: 'block', marginBottom: 5 }}>PASSWORD *</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Temp password" style={{ height: 38 }} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em', display: 'block', marginBottom: 5 }}>ROLE</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ height: 38 }}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em', display: 'block', marginBottom: 8 }}>ASSIGN WORKS</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {works.map(w => {
                const active = form.workIds.includes(w.id);
                return (
                  <button key={w.id} onClick={() => setForm(f => ({ ...f, workIds: toggleId(f.workIds, w.id) }))} style={{
                    height: 28, padding: '0 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    border: `1px solid ${active ? 'rgba(59,130,246,0.5)' : 'var(--border)'}`,
                    background: active ? 'var(--blue-soft)' : 'transparent',
                    color: active ? 'var(--blue-light)' : 'var(--muted)',
                    transition: 'all 0.15s',
                  }}>{w.name}</button>
                );
              })}
            </div>
          </div>

          {error && <div style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowAdd(false)} className="btn btn-ghost btn-sm" style={{ borderRadius: 8 }}>Cancel</button>
            <button onClick={handleCreate} disabled={saving} className="btn btn-primary btn-sm" style={{ borderRadius: 8 }}>
              {saving ? 'Saving…' : 'Create User'}
            </button>
          </div>
        </div>
      )}

      {/* User list */}
      {loading ? (
        <div className="card" style={{ padding: 24, color: 'var(--muted)', textAlign: 'center', fontSize: 13 }}>Loading users…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.map(u => (
            <div key={u.id} className="card" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 16,
                    background: u.role === 'admin' ? 'rgba(37,99,235,0.15)' : 'rgba(99,102,241,0.15)',
                    color: u.role === 'admin' ? 'var(--blue-light)' : '#818cf8',
                    border: `1px solid ${u.role === 'admin' ? 'rgba(37,99,235,0.25)' : 'rgba(99,102,241,0.25)'}`,
                  }}>{(u.name || 'U')[0].toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{u.name}</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      @{u.username || u.email || '—'}
                      <span className={`badge ${u.role === 'admin' ? 'badge-blue' : 'badge-white'}`} style={{ marginLeft: 8, verticalAlign: 'middle' }}>
                        {u.role.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { setEditingUser(editingUser === u.id ? null : u.id); setEditWorkIds(u.work_ids || []); }} className="btn btn-outline btn-sm" style={{ borderRadius: 8 }}>
                    {editingUser === u.id ? '✕ Cancel' : '⚙ Works'}
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="btn btn-danger btn-sm" style={{ borderRadius: 8 }}>🗑</button>
                </div>
              </div>

              {/* Assigned works chips */}
              {editingUser !== u.id && (u.work_ids || []).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  {u.work_ids.map(wid => {
                    const w = works.find(x => x.id === wid);
                    return w ? <span key={wid} className="badge badge-blue" style={{ fontSize: 10, height: 24, padding: '0 10px' }}>{w.name}</span> : null;
                  })}
                </div>
              )}

              {/* Edit works inline */}
              {editingUser === u.id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em', fontWeight: 600, marginBottom: 10 }}>ASSIGN WORKS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                    {works.map(w => {
                      const active = editWorkIds.includes(w.id);
                      return (
                        <button key={w.id} onClick={() => setEditWorkIds(ids => toggleId(ids, w.id))} style={{
                          height: 28, padding: '0 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          border: `1px solid ${active ? 'rgba(59,130,246,0.5)' : 'var(--border)'}`,
                          background: active ? 'var(--blue-soft)' : 'transparent',
                          color: active ? 'var(--blue-light)' : 'var(--muted)',
                          transition: 'all 0.15s',
                        }}>{w.name}</button>
                      );
                    })}
                  </div>
                  <button onClick={() => handleSaveWorks(u.id)} className="btn btn-primary btn-sm" style={{ borderRadius: 8 }}>Save Assignments</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
