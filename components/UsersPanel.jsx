'use client';
import { useState, useEffect } from 'react';

export default function UsersPanel({ works, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', workIds: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editWorkIds, setEditWorkIds] = useState([]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleCreate() {
    if (!form.name || !form.email || !form.password) { setError('Name, email and password are required'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed'); return; }
      setForm({ name: '', email: '', password: '', role: 'user', workIds: [] });
      setShowAdd(false);
      fetchUsers();
    } finally { setSaving(false); }
  }

  async function handleDelete(userId) {
    if (!confirm('Delete this user?')) return;
    await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    fetchUsers();
  }

  async function handleSaveWorks(userId) {
    await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workIds: editWorkIds }),
    });
    setEditingUser(null);
    fetchUsers();
  }

  function toggleWorkId(arr, wid) {
    return arr.includes(wid) ? arr.filter(x => x !== wid) : [...arr, wid];
  }

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--muted)', marginBottom: 4 }}>ADMIN</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1.5 }}>User Management</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowAdd(!showAdd)} style={{
            background: 'var(--accent)', color: '#000', border: 'none',
            borderRadius: 8, padding: '9px 18px', fontWeight: 700, fontSize: 12, letterSpacing: 1, cursor: 'pointer',
          }}>
            + ADD USER
          </button>
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 8, padding: '9px 14px', color: 'var(--muted)', fontSize: 12, cursor: 'pointer',
          }}>✕ Close</button>
        </div>
      </div>

      {/* Add user form */}
      {showAdd && (
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '20px 20px 16px', marginBottom: 20,
        }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1.5, marginBottom: 16 }}>New User</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, display: 'block', marginBottom: 5 }}>NAME *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name" />
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, display: 'block', marginBottom: 5 }}>EMAIL *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@sstraders.com" />
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, display: 'block', marginBottom: 5 }}>PASSWORD *</label>
              <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Temp password" />
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, display: 'block', marginBottom: 5 }}>ROLE</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Assign works */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, display: 'block', marginBottom: 8 }}>
              ASSIGN WORKS (optional — admins see all)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {works.map(w => (
                <button key={w.id} onClick={() => setForm(f => ({ ...f, workIds: toggleWorkId(f.workIds, w.id) }))} style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                  border: `1px solid ${form.workIds.includes(w.id) ? 'var(--accent)' : 'var(--border)'}`,
                  background: form.workIds.includes(w.id) ? 'rgba(245,166,35,0.15)' : 'var(--surface)',
                  color: form.workIds.includes(w.id) ? 'var(--accent)' : 'var(--muted)',
                  transition: 'all 0.15s',
                }}>
                  {w.name}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)',
              borderRadius: 6, padding: '8px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 12,
            }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowAdd(false)} style={{
              padding: '9px 18px', background: 'transparent', border: '1px solid var(--border)',
              borderRadius: 7, color: 'var(--muted)', fontSize: 12, cursor: 'pointer',
            }}>Cancel</button>
            <button onClick={handleCreate} disabled={saving} style={{
              padding: '9px 24px', background: 'var(--accent)', border: 'none',
              borderRadius: 7, color: '#000', fontWeight: 700, fontSize: 12, cursor: 'pointer',
            }}>
              {saving ? 'Saving…' : 'Create User →'}
            </button>
          </div>
        </div>
      )}

      {/* Users table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Loading users…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.map(u => (
            <div key={u.id} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '14px 18px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: u.role === 'admin' ? 'rgba(245,166,35,0.2)' : 'rgba(79,195,247,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700,
                    color: u.role === 'admin' ? 'var(--accent)' : 'var(--accent2)',
                  }}>
                    {u.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {u.email} · <span style={{ color: u.role === 'admin' ? 'var(--accent)' : 'var(--accent2)' }}>
                        {u.role.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setEditingUser(editingUser === u.id ? null : u.id); setEditWorkIds(u.work_ids || []); }} style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', color: 'var(--text)',
                  }}>
                    {editingUser === u.id ? '✕ Cancel' : '⚙ Works'}
                  </button>
                  <button onClick={() => handleDelete(u.id)} style={{
                    background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)',
                    color: 'var(--red)', borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer',
                  }}>🗑</button>
                </div>
              </div>

              {/* Assigned works chips */}
              {editingUser !== u.id && u.work_ids?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
                  {u.work_ids.map(wid => {
                    const w = works.find(x => x.id === wid);
                    return w ? (
                      <span key={wid} style={{
                        fontSize: 11, padding: '3px 9px', borderRadius: 20,
                        background: 'rgba(79,195,247,0.1)', color: 'var(--accent2)',
                        border: '1px solid rgba(79,195,247,0.2)',
                      }}>{w.name}</span>
                    ) : null;
                  })}
                </div>
              )}

              {/* Edit work assignments inline */}
              {editingUser === u.id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 2, marginBottom: 10 }}>ASSIGN WORKS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {works.map(w => (
                      <button key={w.id} onClick={() => setEditWorkIds(ids => toggleWorkId(ids, w.id))} style={{
                        padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                        border: `1px solid ${editWorkIds.includes(w.id) ? 'var(--accent)' : 'var(--border)'}`,
                        background: editWorkIds.includes(w.id) ? 'rgba(245,166,35,0.15)' : 'var(--surface)',
                        color: editWorkIds.includes(w.id) ? 'var(--accent)' : 'var(--muted)',
                        transition: 'all 0.15s',
                      }}>
                        {w.name}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => handleSaveWorks(u.id)} style={{
                    padding: '8px 20px', background: 'var(--accent)', border: 'none',
                    borderRadius: 7, color: '#000', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                  }}>
                    Save Assignments →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
