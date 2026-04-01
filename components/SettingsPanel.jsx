'use client';

import { useEffect, useState } from 'react';

const DEFAULT_CATEGORY_COLOR = '#8b5cf6';

export default function SettingsPanel({ onClose }) {
  const [categories, setCategories] = useState([]);
  const [folderTypes, setFolderTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState(DEFAULT_CATEGORY_COLOR);

  const [folderName, setFolderName] = useState('');
  const [folderKey, setFolderKey] = useState('');
  const [folderIcon, setFolderIcon] = useState('📁');
  const [folderColor, setFolderColor] = useState('#ff355e');

  async function loadAll() {
    setLoading(true);
    try {
      const [cRes, fRes] = await Promise.all([
        fetch('/api/categories', { cache: 'no-store' }),
        fetch('/api/folder-types', { cache: 'no-store' }),
      ]);

      const [cData, fData] = await Promise.all([cRes.json(), fRes.json()]);
      setCategories(Array.isArray(cData) ? cData : []);
      setFolderTypes(Array.isArray(fData) ? fData : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function createCategory() {
    if (!categoryName.trim()) return;
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: categoryName.trim(), color: categoryColor }),
    });
    setCategoryName('');
    setCategoryColor(DEFAULT_CATEGORY_COLOR);
    await loadAll();
  }

  async function createFolderType() {
    if (!folderName.trim() || !folderKey.trim()) return;
    await fetch('/api/folder-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: folderName.trim(),
        key: folderKey.trim().toLowerCase(),
        icon: folderIcon || '📁',
        color: folderColor || '#ff355e',
      }),
    });
    setFolderName('');
    setFolderKey('');
    setFolderIcon('📁');
    setFolderColor('#ff355e');
    await loadAll();
  }

  async function deleteCategory(id) {
    if (!confirm('Delete this category?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    await loadAll();
  }

  async function deleteFolderType(id) {
    if (!confirm('Delete this folder type?')) return;
    await fetch(`/api/folder-types/${id}`, { method: 'DELETE' });
    await loadAll();
  }

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <div className="section-eyebrow">Control Center</div>
          <div className="premium-title section-title" style={{ fontSize: 44 }}>Settings</div>
          <div className="section-copy" style={{ maxWidth: 620 }}>
            Manage categories and folder types used across the document system.
          </div>
        </div>

        <button onClick={onClose} className="btn-ghost">Close</button>
      </div>

      <div className="modal-grid-2">
        <div className="panel" style={{ padding: 22 }}>
          <div className="mono-font" style={{ color: 'var(--yellow)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>
            Work Categories
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Category name"
            />
            <input
              value={categoryColor}
              onChange={(e) => setCategoryColor(e.target.value)}
              placeholder="Hex color"
            />
            <button onClick={createCategory} className="btn-premium" style={{ width: 'fit-content' }}>
              Add Category
            </button>
          </div>

          <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
            {loading ? (
              <div style={{ color: 'var(--muted)' }}>Loading…</div>
            ) : (
              categories.map((c) => (
                <div key={c.id} className="glass-card" style={{ borderRadius: 18, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 999,
                        background: c.color || DEFAULT_CATEGORY_COLOR,
                        boxShadow: `0 0 14px ${c.color || DEFAULT_CATEGORY_COLOR}`,
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>{c.color || DEFAULT_CATEGORY_COLOR}</div>
                    </div>
                  </div>

                  <button onClick={() => deleteCategory(c.id)} className="btn-danger">Delete</button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel" style={{ padding: 22 }}>
          <div className="mono-font" style={{ color: 'var(--yellow)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>
            Folder Types
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Folder type name"
            />
            <input
              value={folderKey}
              onChange={(e) => setFolderKey(e.target.value)}
              placeholder="Folder key"
            />
            <div className="modal-grid-2">
              <input
                value={folderIcon}
                onChange={(e) => setFolderIcon(e.target.value)}
                placeholder="Icon"
              />
              <input
                value={folderColor}
                onChange={(e) => setFolderColor(e.target.value)}
                placeholder="Hex color"
              />
            </div>

            <button onClick={createFolderType} className="btn-premium" style={{ width: 'fit-content' }}>
              Add Folder Type
            </button>
          </div>

          <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
            {loading ? (
              <div style={{ color: 'var(--muted)' }}>Loading…</div>
            ) : (
              folderTypes.map((f) => (
                <div key={f.id} className="glass-card" style={{ borderRadius: 18, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{f.icon || '📁'}</span>
                    <div>
                      <div style={{ fontWeight: 700 }}>{f.name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                        {f.key} · {f.color || '#ff355e'}
                      </div>
                    </div>
                  </div>

                  <button onClick={() => deleteFolderType(f.id)} className="btn-danger">Delete</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
