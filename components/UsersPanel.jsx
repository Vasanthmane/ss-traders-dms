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
    workIds: []
  });

  async function fetchUsers() {
    setLoading(true);

    try {
      const res = await fetch('/api/users');
      const data = await res.json();

      setUsers(Array.isArray(data) ? data : []);

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function toggleWorkId(arr, wid) {
    return arr.includes(wid)
      ? arr.filter(x => x !== wid)
      : [...arr, wid];
  }

  async function handleCreate() {

    if (!form.name.trim() ||
        !form.email.trim() ||
        !form.password.trim()) {

      setError('Name, email, and password are required');
      return;
    }

    setSaving(true);
    setError('');

    try {

      const res = await fetch('/api/users', {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          email: form.email.trim()
        })

      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed');
        return;
      }

      setForm({
        name: '',
        email: '',
        password: '',
        role: 'user',
        workIds: []
      });

      setShowAdd(false);

      fetchUsers();

    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {

    if (!confirm('Delete this user?'))
      return;

    await fetch(`/api/users/${id}`, {
      method: 'DELETE'
    });

    fetchUsers();
  }

  async function handleSaveWorks(id) {

    await fetch(`/api/users/${id}`, {

      method: 'PATCH',   // 🔥 FIXED

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        workIds: editWorkIds
      })

    });

    setEditingUser(null);

    fetchUsers();
  }

  return (
    <div className="fade-up">

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 18
      }}>

        <h2 className="premium-title">
          Users
        </h2>

        <button
          onClick={() => setShowAdd(v => !v)}
          className="btn-premium"
        >
          + Add User
        </button>

      </div>

      {showAdd && (

        <div className="panel">

          <input
            placeholder="Full name"
            value={form.name}
            onChange={e =>
              setForm(f => ({
                ...f,
                name: e.target.value
              }))
            }
          />

          <input
            placeholder="Username"
            value={form.email}
            onChange={e =>
              setForm(f => ({
                ...f,
                email: e.target.value
              }))
            }
          />

          <input
            placeholder="Password"
            value={form.password}
            onChange={e =>
              setForm(f => ({
                ...f,
                password: e.target.value
              }))
            }
          />

          <button
            onClick={handleCreate}
            className="btn-premium"
          >
            CREATE USER
          </button>

        </div>

      )}

    </div>
  );
}
