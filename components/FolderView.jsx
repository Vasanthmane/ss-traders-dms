'use client';
import { useState, useEffect, useRef } from 'react';

export default function FolderView({ work, folderKey, folderDef, session, onFilesChanged }) {
  const [files, setFiles]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [uploading, setUploading]         = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [description, setDescription]    = useState('');
  const [fileDate, setFileDate]           = useState('');
  const [dragOver, setDragOver]           = useState(false);
  const [previewFile, setPreviewFile]     = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [xlsxData, setXlsxData]           = useState(null);
  const [docxHtml, setDocxHtml]           = useState(null);
  const fileInputRef = useRef();

  async function fetchFiles() {
    setLoading(true);
    try {
      const res  = await fetch(`/api/files?work_id=${work.id}&folder_key=${folderKey}`);
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { fetchFiles(); }, [work.id, folderKey]);

  async function handleUpload(file) {
    if (!file) return;
    setUploading(true); setUploadProgress('Getting upload URL…');
    try {
      const urlRes = await fetch('/api/files/upload-url', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream', workId: work.id, folderKey }),
      });
      const { uploadUrl, r2Key } = await urlRes.json();
      setUploadProgress('Uploading…');
      const up = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type || 'application/octet-stream' } });
      if (!up.ok) throw new Error('Upload failed');
      setUploadProgress('Saving…');
      const ext = file.name.split('.').pop().toLowerCase();
      await fetch('/api/files', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ work_id: work.id, folder_key: folderKey, name: file.name, r2_key: r2Key, size: file.size, ext, description: description || null, file_date: fileDate || null }),
      });
      setDescription(''); setFileDate('');
      await fetchFiles(); onFilesChanged?.();
    } catch (e) { alert('Upload failed: ' + e.message); }
    finally { setUploading(false); setUploadProgress(null); }
  }

  async function handleDownload(file) {
    const res  = await fetch(`/api/download/${file.id}`);
    const { url } = await res.json();
    const a    = document.createElement('a'); a.href = url; a.download = file.name; a.click();
  }

  async function handlePreview(file) {
    setPreviewFile({ file, url: null }); setXlsxData(null); setDocxHtml(null); setPreviewLoading(true);
    try {
      const { url } = await fetch(`/api/download/${file.id}`).then(r => r.json());
      const ext = (file.ext || '').toLowerCase();
      if (['xlsx','xls','csv'].includes(ext)) {
        const ab = await fetch(url).then(r => r.blob()).then(b => b.arrayBuffer());
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
        const wb = window.XLSX.read(ab, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        setXlsxData(window.XLSX.utils.sheet_to_html(ws));
        setPreviewFile({ file, url });
      } else if (['doc','docx'].includes(ext)) {
        const ab = await fetch(url).then(r => r.blob()).then(b => b.arrayBuffer());
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
        const result = await window.mammoth.convertToHtml({ arrayBuffer: ab });
        setDocxHtml(result.value); setPreviewFile({ file, url });
      } else { setPreviewFile({ file, url }); }
    } catch (e) { alert('Preview failed: ' + e.message); setPreviewFile(null); }
    finally { setPreviewLoading(false); }
  }

  function loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
      const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  async function handleDelete(file) {
    if (!confirm(`Delete "${file.name}"?`)) return;
    await fetch(`/api/files/${file.id}`, { method: 'DELETE' });
    await fetchFiles(); onFilesChanged?.();
  }

  function fmtSize(b) {
    if (!b) return '—';
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  }

  function extColor(ext) {
    const m = {
      pdf: '#ef4444', xlsx: '#22c55e', xls: '#22c55e', csv: '#22c55e',
      doc: '#3b82f6', docx: '#3b82f6',
      jpg: '#a78bfa', jpeg: '#a78bfa', png: '#a78bfa', gif: '#a78bfa', webp: '#a78bfa',
      zip: '#f59e0b', rar: '#f59e0b',
    };
    return m[(ext || '').toLowerCase()] || '#6b7694';
  }

  function canPreview(ext) {
    return ['pdf','jpg','jpeg','png','gif','webp','xlsx','xls','csv','doc','docx'].includes((ext || '').toLowerCase());
  }

  const pExt  = previewFile ? (previewFile.file.ext || '').toLowerCase() : '';
  const isImg  = ['jpg','jpeg','png','gif','webp'].includes(pExt);
  const isPdf  = pExt === 'pdf';
  const isXlsx = ['xlsx','xls','csv'].includes(pExt);
  const isDocx = ['doc','docx'].includes(pExt);

  return (
    <>
      <div className="card fade-up" style={{
        border: `1px solid ${folderDef.color}25`,
        overflow: 'hidden',
        boxShadow: `0 0 24px ${folderDef.color}08`,
      }}>
        {/* Folder header */}
        <div style={{
          padding: '14px 18px', borderBottom: `1px solid ${folderDef.color}18`,
          background: `linear-gradient(135deg, ${folderDef.color}0a, transparent)`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{folderDef.icon}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: folderDef.color }}>{folderDef.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{files.length} {files.length === 1 ? 'file' : 'files'}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '14px 16px' }}>
          {/* File list */}
          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>Loading…</div>
          ) : files.length === 0 ? (
            <div style={{ padding: '20px 0 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 13, borderBottom: `1px solid ${folderDef.color}12`, marginBottom: 14 }}>
              No files yet — upload one below ↓
            </div>
          ) : (
            <div style={{ marginBottom: 14 }}>
              {files.map((f, i) => (
                <div key={f.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 9, marginBottom: 5,
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid var(--border)',
                  animation: `fadeUp 0.18s ease ${i * 0.035}s both`,
                  transition: 'background 0.15s',
                }}>
                  {/* Ext badge */}
                  <div style={{
                    padding: '3px 7px', borderRadius: 5, fontSize: 9, fontWeight: 700,
                    background: extColor(f.ext) + '18', color: extColor(f.ext),
                    border: `1px solid ${extColor(f.ext)}30`,
                    fontFamily: "'JetBrains Mono', monospace", flexShrink: 0, minWidth: 38, textAlign: 'center',
                  }}>{(f.ext || '?').toUpperCase()}</div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                      {fmtSize(f.size)}
                      {f.file_date && <span> · {new Date(f.file_date).toLocaleDateString('en-IN')}</span>}
                      {f.description && <span> · {f.description}</span>}
                      {f.uploader_name && <span> · {f.uploader_name}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    {canPreview(f.ext) && (
                      <button onClick={() => handlePreview(f)} className="btn btn-outline btn-sm" style={{ borderRadius: 8 }}>
                        👁 View
                      </button>
                    )}
                    <button onClick={() => handleDownload(f)} className="btn btn-sm" style={{
                      borderRadius: 8, background: 'var(--blue-soft)', border: '1px solid rgba(59,130,246,0.25)', color: 'var(--blue-light)',
                    }}>
                      ⬇ Get
                    </button>
                    {(session.role === 'admin' || f.uploaded_by === session.id) && (
                      <button onClick={() => handleDelete(f)} className="btn btn-danger btn-sm" style={{ borderRadius: 8, padding: '0 9px' }}>🗑</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files[0]); }}
            onClick={() => !uploading && fileInputRef.current.click()}
            style={{
              border: `2px dashed ${dragOver ? folderDef.color : folderDef.color + '28'}`,
              borderRadius: 10, padding: '18px 16px', textAlign: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              background: dragOver ? `${folderDef.color}06` : 'transparent',
              transition: 'all 0.18s', marginBottom: 12,
            }}
          >
            <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={e => handleUpload(e.target.files[0])} />
            {uploading ? (
              <div>
                <div style={{ fontSize: 18, marginBottom: 5, display: 'inline-block', animation: 'spin 1s linear infinite' }}>⚙️</div>
                <div style={{ fontSize: 12, color: 'var(--blue-light)', fontWeight: 600 }}>{uploadProgress}</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 20, marginBottom: 6, color: folderDef.color }}>☁</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Click to upload or drag & drop</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>PDF, Excel, Word, Images, ZIP — any file</div>
              </>
            )}
          </div>

          {/* Metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.15em', display: 'block', marginBottom: 5 }}>DESCRIPTION (OPTIONAL)</label>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Final invoice Phase 2" style={{ height: 36, fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.15em', display: 'block', marginBottom: 5 }}>FILE DATE (OPTIONAL)</label>
              <input type="date" value={fileDate} onChange={e => setFileDate(e.target.value)} style={{ height: 36, fontSize: 12 }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── FULLSCREEN PREVIEW ── */}
      {previewFile && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(5,8,18,0.96)', backdropFilter: 'blur(16px)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Preview topbar */}
          <div style={{
            height: 56, padding: '0 20px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(13,17,23,0.98)', borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                padding: '3px 9px', borderRadius: 5, fontSize: 10, fontWeight: 700,
                background: extColor(previewFile.file.ext) + '18', color: extColor(previewFile.file.ext),
                border: `1px solid ${extColor(previewFile.file.ext)}30`,
                fontFamily: "'JetBrains Mono', monospace",
              }}>{(previewFile.file.ext || '?').toUpperCase()}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{previewFile.file.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{fmtSize(previewFile.file.size)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleDownload(previewFile.file)} className="btn btn-primary btn-sm" style={{ borderRadius: 8 }}>⬇ Download</button>
              <button onClick={() => { setPreviewFile(null); setXlsxData(null); setDocxHtml(null); }} className="btn btn-danger btn-sm" style={{ borderRadius: 8 }}>✕ Close</button>
            </div>
          </div>

          {/* Preview body */}
          <div style={{
            flex: 1, overflow: 'auto',
            display: 'flex',
            alignItems: isPdf || isXlsx || isDocx ? 'flex-start' : 'center',
            justifyContent: 'center',
            padding: isPdf ? 0 : 24,
          }}>
            {previewLoading ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', paddingTop: '20vh' }}>
                <div style={{ fontSize: 40, marginBottom: 14, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</div>
                <div style={{ fontSize: 14, color: 'var(--blue-light)' }}>Loading preview…</div>
              </div>
            ) : isPdf && previewFile.url ? (
              <iframe src={previewFile.url} style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} title={previewFile.file.name} />
            ) : isImg && previewFile.url ? (
              <img src={previewFile.url} alt={previewFile.file.name} style={{ maxWidth: '95vw', maxHeight: '90vh', borderRadius: 10, objectFit: 'contain' }} />
            ) : isXlsx && xlsxData ? (
              <div style={{ width: '100%', background: '#fff', minHeight: '100%' }}>
                <style>{`.xp table{border-collapse:collapse;width:100%;font-size:12px;font-family:'JetBrains Mono',monospace}.xp td,.xp th{border:1px solid #e2e8f0;padding:7px 12px;white-space:nowrap;color:#111}.xp tr:nth-child(even) td{background:#f8faff}.xp tr:first-child td{background:#1e40af;color:#fff;font-weight:700;font-size:11px;letter-spacing:.05em}`}</style>
                <div className="xp" dangerouslySetInnerHTML={{ __html: xlsxData }} />
              </div>
            ) : isDocx && docxHtml ? (
              <div style={{ background: '#fff', width: '100%', maxWidth: 820, padding: '48px 60px', minHeight: '100%', color: '#111', fontSize: 14, lineHeight: 1.8, fontFamily: 'Georgia, serif' }}>
                <style>{`.dp h1,.dp h2,.dp h3{margin:24px 0 12px;color:#111;font-family:'Inter',sans-serif}.dp p{margin-bottom:12px}.dp table{border-collapse:collapse;width:100%;margin:16px 0}.dp td,.dp th{border:1px solid #e2e8f0;padding:8px 14px}.dp tr:first-child td{background:#1e40af;color:#fff;font-weight:700}`}</style>
                <div className="dp" dangerouslySetInnerHTML={{ __html: docxHtml }} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--muted)', paddingTop: '20vh' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>📄</div>
                <div style={{ fontSize: 14, marginBottom: 12 }}>Preview not available for this file type</div>
                <button onClick={() => handleDownload(previewFile.file)} className="btn btn-primary">⬇ Download instead</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
