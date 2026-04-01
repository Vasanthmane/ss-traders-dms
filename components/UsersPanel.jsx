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
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    workIds: [],
  });

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      const data = await res.json();

      if (!res.ok) {
        setUsers([]);
        setError(data.error || 'Failed to load users');
        return;
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function toggleWorkId(arr, wid) {
    return arr.includes(wid) ? arr.filter((x) => x !== wid) : [...arr, wid];
  }

  async function handleCreate() {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Name, username, and password are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          email: form.email.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create user');
        return;
      }

      setForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        workIds: [],
      });
      setShowAdd(false);
      await fetchUsers();
    } catch {
      setError('Failed to create user');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this user?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    await fetchUsers();
  }

  async function handleSaveWorks(id) {
    await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workIds: editWorkIds }),
    });
    setEditingUser(null);
    await fetchUsers();
  }

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <div className="section-eyebrow">Access Control</div>
          <div className="premium-title section-title" style={{ fontSize: 44 }}>Users</div>
          <div className="section-copy" style={{ maxWidth: 560 }}>
            Create users, assign work access, and manage internal permissions.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowAdd((v) => !v)} className="btn-premium">
            + Add User
          </button>
          <button onClick={onClose} className="btn-ghost">
            Close
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="panel" style={{ padding: 22, marginBottom: 18 }}>
          <div className="modal-grid-2">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Full name"
            />
            <input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="Username or email"
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Temporary password"
            />
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="mono-font" style={{ color: 'var(--muted)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 10 }}>
              Assign Works
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {works.map((w) => {
                const active = form.workIds.includes(w.id);
                return (
                  <button
                    key={w.id}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        workIds: toggleWorkId(f.workIds, w.id),
                      }))
                    }
                    style={{
                      height: 34,
                      padding: '0 14px',
                      borderRadius: 999,
                      border: `1px solid ${active ? 'rgba(139,92,246,0.42)' : 'var(--border)'}`,
                      background: active ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.03)',
                      color: active ? '#f6ecff' : 'var(--text-soft)',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {w.name}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="login-error" style={{ marginTop: 14, marginBottom: 0 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
            <button onClick={() => setShowAdd(false)} className="btn-ghost">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={saving} className="btn-premium">
              {saving ? 'Saving…' : 'Create User'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="panel" style={{ padding: 22, color: 'var(--muted)' }}>
          Loading users…
        </div>
      ) : (
        <div className="user-list">
          {users.map((u) => (
            <div key={u.id} className="panel user-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 16,
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 900,
                      fontSize: 18,
                      background: u.role === 'admin' ? 'rgba(247,201,72,0.14)' : 'rgba(139,92,246,0.16)',
                      color: u.role === 'admin' ? '#ffd86b' : '#cfb4ff',
                    }}
                  >
                    {u.name?.[0]?.toUpperCase() || 'U'}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{u.name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 13 }}>{u.email}</div>
                    <div style={{ marginTop: 8 }}>
                      <span className={`tag-pill ${u.role === 'admin' ? 'tag-admin' : 'tag-user'}`}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => {
                      setEditingUser(editingUser === u.id ? null : u.id);
                      setEditWorkIds(u.work_ids || []);
                    }}
                    className="btn-secondary"
                  >
                    {editingUser === u.id ? 'Close' : 'Works'}
                  </button>

                  <button onClick={() => handleDelete(u.id)} className="btn-danger">
                    Delete
                  </button>
                </div>
              </div>

              {editingUser !== u.id && (u.work_ids || []).length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                  {u.work_ids.map((wid) => {
                    const w = works.find((x) => x.id === wid);
                    return w ? (
                      <span
                        key={wid}
                        style={{
                          height: 30,
                          padding: '0 12px',
                          borderRadius: 999,
                          display: 'inline-flex',
                          alignItems: 'center',
                          border: '1px solid var(--border)',
                          background: 'rgba(255,255,255,0.03)',
                          color: 'var(--text-soft)',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {w.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {editingUser === u.id && (
                <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
                  <div className="mono-font" style={{ color: 'var(--muted)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 10 }}>
                    Adjust Work Access
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {works.map((w) => {
                      const active = editWorkIds.includes(w.id);
                      return (
                        <button
                          key={w.id}
                          onClick={() => setEditWorkIds((ids) => toggleWorkId(ids, w.id))}
                          style={{
                            height: 34,
                            padding: '0 14px',
                            borderRadius: 999,
                            border: `1px solid ${active ? 'rgba(255,53,94,0.42)' : 'var(--border)'}`,
                            background: active ? 'rgba(255,53,94,0.14)' : 'rgba(255,255,255,0.03)',
                            color: active ? '#ffdce6' : 'var(--text-soft)',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {w.name}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                    <button onClick={() => handleSaveWorks(u.id)} className="btn-premium">
                      Save Assignments
                    </button>
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
