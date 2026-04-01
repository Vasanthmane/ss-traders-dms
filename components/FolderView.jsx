'use client';
import { useState, useEffect, useRef } from 'react';

export default function FolderView({ work, folderKey, folderDef, session, onFilesChanged }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [description, setDescription] = useState('');
  const [fileDate, setFileDate] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [xlsxData, setXlsxData] = useState(null);
  const [docxHtml, setDocxHtml] = useState(null);
  const fileInputRef = useRef();

  async function fetchFiles() {
    setLoading(true);
    try {
      const res = await fetch(`/api/files?work_id=${work.id}&folder_key=${folderKey}`);
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchFiles(); }, [work.id, folderKey]);

  async function handleUpload(file) {
    if (!file) return;
    setUploading(true);
    setUploadProgress('Getting upload URL…');
    try {
      const urlRes = await fetch('/api/files/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type || 'application/octet-stream', workId: work.id, folderKey }),
      });
      const { uploadUrl, r2Key } = await urlRes.json();
      setUploadProgress('Uploading to cloud…');
      const uploadRes = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type || 'application/octet-stream' } });
      if (!uploadRes.ok) throw new Error('R2 upload failed');
      setUploadProgress('Saving record…');
      const ext = file.name.split('.').pop().toLowerCase();
      await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ work_id: work.id, folder_key: folderKey, name: file.name, r2_key: r2Key, size: file.size, ext, description: description || null, file_date: fileDate || null }),
      });
      setDescription(''); setFileDate('');
      await fetchFiles(); onFilesChanged?.();
    } catch (e) { alert('Upload failed: ' + e.message); }
    finally { setUploading(false); setUploadProgress(null); }
  }

  async function handleDownload(file) {
    const res = await fetch(`/api/download/${file.id}`);
    const { url } = await res.json();
    const a = document.createElement('a'); a.href = url; a.download = file.name; a.click();
  }

  async function handlePreview(file) {
    setPreviewFile({ file, url: null });
    setXlsxData(null); setDocxHtml(null); setPreviewLoading(true);
    try {
      const res = await fetch(`/api/download/${file.id}`);
      const { url } = await res.json();
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
        setDocxHtml(result.value);
        setPreviewFile({ file, url });
      } else {
        setPreviewFile({ file, url });
      }
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
    if (b < 1048576) return (b/1024).toFixed(1)+' KB';
    return (b/1048576).toFixed(1)+' MB';
  }

  function extColor(ext) {
    const m = { pdf:'#ff4466', xlsx:'#00ff88', xls:'#00ff88', csv:'#00ff88', doc:'#00d4ff', docx:'#00d4ff', jpg:'#b06aff', jpeg:'#b06aff', png:'#b06aff', gif:'#b06aff', webp:'#b06aff', zip:'#ffaa00', rar:'#ffaa00' };
    return m[(ext||'').toLowerCase()] || '#4a7a8a';
  }

  function canPreview(ext) {
    return ['pdf','jpg','jpeg','png','gif','webp','xlsx','xls','csv','doc','docx'].includes((ext||'').toLowerCase());
  }

  const pExt = previewFile ? (previewFile.file.ext||'').toLowerCase() : '';
  const isImg = ['jpg','jpeg','png','gif','webp'].includes(pExt);
  const isPdf = pExt === 'pdf';
  const isXlsx = ['xlsx','xls','csv'].includes(pExt);
  const isDocx = ['doc','docx'].includes(pExt);

  return (
    <>
      <div className="fade-up" style={{
        background: 'rgba(13,24,32,0.8)',
        border: `1px solid ${folderDef.color}30`,
        borderRadius: 12, overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        boxShadow: `0 0 30px ${folderDef.color}10`,
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px', borderBottom: `1px solid ${folderDef.color}20`,
          background: `linear-gradient(135deg, ${folderDef.color}10, transparent)`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 24 }}>{folderDef.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: folderDef.color, letterSpacing: 1 }}>{folderDef.name}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{files.length} file{files.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        <div style={{ padding: '12px 14px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
          ) : files.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--muted)', fontSize: 13, borderBottom: `1px solid ${folderDef.color}15`, marginBottom: 14 }}>
              No files yet — upload one below ↓
            </div>
          ) : (
            <div style={{ marginBottom: 14 }}>
              {files.map((f, i) => (
                <div key={f.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, marginBottom: 5,
                  border: `1px solid ${extColor(f.ext)}18`,
                  background: `linear-gradient(135deg, ${extColor(f.ext)}06, rgba(13,24,32,0.8))`,
                  animation: `fadeUp 0.2s ease ${i*0.04}s both`,
                  transition: 'all 0.15s',
                }}>
                  <div style={{
                    padding: '3px 7px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                    background: extColor(f.ext)+'22', color: extColor(f.ext),
                    border: `1px solid ${extColor(f.ext)}44`,
                    fontFamily: "'IBM Plex Mono', monospace", flexShrink: 0, minWidth: 40, textAlign: 'center',
                    boxShadow: `0 0 8px ${extColor(f.ext)}30`,
                  }}>{(f.ext||'?').toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text)' }}>{f.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>
                      {fmtSize(f.size)}
                      {f.file_date && <span> · {new Date(f.file_date).toLocaleDateString('en-IN')}</span>}
                      {f.description && <span> · {f.description}</span>}
                      {f.uploader_name && <span> · {f.uploader_name}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    {canPreview(f.ext) && (
                      <button onClick={() => handlePreview(f)} style={{
                        background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)',
                        color: 'var(--accent)', borderRadius: 6, padding: '5px 10px',
                        fontSize: 11, cursor: 'pointer', fontWeight: 700, letterSpacing: 0.5,
                        boxShadow: '0 0 10px rgba(0,255,136,0.1)',
                      }}>👁 Preview</button>
                    )}
                    <button onClick={() => handleDownload(f)} style={{
                      background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)',
                      color: 'var(--accent2)', borderRadius: 6, padding: '5px 10px',
                      fontSize: 11, cursor: 'pointer', fontWeight: 700,
                    }}>⬇ Get</button>
                    {(session.role === 'admin' || f.uploaded_by === session.id) && (
                      <button onClick={() => handleDelete(f)} style={{
                        background: 'rgba(255,68,102,0.08)', border: '1px solid rgba(255,68,102,0.2)',
                        color: 'var(--red)', borderRadius: 6, padding: '5px 9px', fontSize: 12, cursor: 'pointer',
                      }}>🗑</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files[0]); }}
            onClick={() => !uploading && fileInputRef.current.click()}
            style={{
              border: `2px dashed ${dragOver ? folderDef.color : folderDef.color+'30'}`,
              borderRadius: 10, padding: '18px 16px', textAlign: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              background: dragOver ? `${folderDef.color}08` : 'transparent',
              marginBottom: 10,
              boxShadow: dragOver ? `0 0 20px ${folderDef.color}20` : 'none',
            }}
          >
            <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={e => handleUpload(e.target.files[0])} />
            {uploading ? (
              <div>
                <div style={{ fontSize: 18, marginBottom: 6, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</div>
                <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>{uploadProgress}</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 22, marginBottom: 5 }}>☁️</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: folderDef.color }}>Click to upload or drag & drop</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>PDF, Excel, Word, Images, ZIP — any file</div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: 2, display: 'block', marginBottom: 4 }}>DESCRIPTION (optional)</label>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Final invoice Phase 2" />
            </div>
            <div>
              <label style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: 2, display: 'block', marginBottom: 4 }}>FILE DATE (optional)</label>
              <input type="date" value={fileDate} onChange={e => setFileDate(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* ── FULL SCREEN PREVIEW MODAL ── */}
      {previewFile && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(2,4,8,0.97)',
          display: 'flex', flexDirection: 'column',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Modal top bar */}
          <div style={{
            background: 'rgba(8,15,20,0.98)',
            borderBottom: '1px solid rgba(0,255,136,0.15)',
            padding: '12px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                background: extColor(previewFile.file.ext)+'22', color: extColor(previewFile.file.ext),
                border: `1px solid ${extColor(previewFile.file.ext)}44`,
                fontFamily: "'IBM Plex Mono', monospace",
                boxShadow: `0 0 10px ${extColor(previewFile.file.ext)}40`,
              }}>{(previewFile.file.ext||'?').toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{previewFile.file.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{fmtSize(previewFile.file.size)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleDownload(previewFile.file)} style={{
                background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.35)',
                color: 'var(--accent2)', borderRadius: 7, padding: '8px 18px',
                fontSize: 12, cursor: 'pointer', fontWeight: 700,
                boxShadow: '0 0 15px rgba(0,212,255,0.2)',
              }}>⬇ Download</button>
              <button onClick={() => { setPreviewFile(null); setXlsxData(null); setDocxHtml(null); }} style={{
                background: 'rgba(255,68,102,0.1)', border: '1px solid rgba(255,68,102,0.3)',
                borderRadius: 7, padding: '8px 18px', color: 'var(--red)',
                fontSize: 12, cursor: 'pointer', fontWeight: 700,
              }}>✕ CLOSE</button>
            </div>
          </div>

          {/* Preview body — takes all remaining height, fully scrollable */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            alignItems: isPdf || isXlsx || isDocx ? 'flex-start' : 'center',
            justifyContent: 'center',
            padding: isPdf ? 0 : 24,
          }}>
            {previewLoading ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', paddingTop: '20vh' }}>
                <div style={{ fontSize: 48, marginBottom: 16, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</div>
                <div style={{ fontSize: 15, color: 'var(--accent)' }}>Loading preview…</div>
              </div>
            ) : isPdf && previewFile.url ? (
              /* PDF — full height iframe, no padding */
              <iframe
                src={previewFile.url}
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                title={previewFile.file.name}
              />
            ) : isImg && previewFile.url ? (
              <img
                src={previewFile.url}
                alt={previewFile.file.name}
                style={{
                  maxWidth: '95vw', maxHeight: '90vh',
                  borderRadius: 10, objectFit: 'contain',
                  boxShadow: '0 0 60px rgba(0,255,136,0.15)',
                }}
              />
            ) : isXlsx && xlsxData ? (
              <div style={{ width: '100%', background: '#fff', minHeight: '100%' }}>
                <style>{`
                  .xp table{border-collapse:collapse;width:100%;font-size:12px;font-family:'IBM Plex Mono',monospace}
                  .xp td,.xp th{border:1px solid #d1d5db;padding:7px 12px;white-space:nowrap;color:#111}
                  .xp tr:nth-child(even) td{background:#f0fdf4}
                  .xp tr:first-child td{background:#14532d;color:#fff;font-weight:700;font-size:11px;letter-spacing:1px}
                `}</style>
                <div className="xp" dangerouslySetInnerHTML={{ __html: xlsxData }} />
              </div>
            ) : isDocx && docxHtml ? (
              <div style={{
                background: '#fff', width: '100%', maxWidth: 860,
                padding: '48px 60px', minHeight: '100%',
                color: '#111', fontSize: 14, lineHeight: 1.8,
                fontFamily: 'Georgia, serif',
              }}>
                <style>{`
                  .dp h1,.dp h2,.dp h3{margin:24px 0 12px;color:#111;font-family:'IBM Plex Sans',sans-serif}
                  .dp p{margin-bottom:12px}
                  .dp table{border-collapse:collapse;width:100%;margin:16px 0}
                  .dp td,.dp th{border:1px solid #ccc;padding:8px 14px}
                  .dp tr:first-child td{background:#14532d;color:#fff;font-weight:700}
                `}</style>
                <div className="dp" dangerouslySetInnerHTML={{ __html: docxHtml }} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--muted)', paddingTop: '20vh' }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>📄</div>
                <div style={{ fontSize: 15, marginBottom: 12 }}>Preview not available for this file type</div>
                <button onClick={() => handleDownload(previewFile.file)} style={{
                  background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.4)',
                  color: 'var(--accent)', borderRadius: 8, padding: '12px 28px',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(0,255,136,0.2)',
                }}>⬇ Download instead</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
