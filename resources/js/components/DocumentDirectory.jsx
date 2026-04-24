import { useEffect, useRef, useState } from 'react';
import { getAuthStatus } from '../authCache';

const BRAND = '#115948';

export default function DocumentDirectory({ config }) {
  const [docs, setDocs]             = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRoles, setUserRoles]   = useState([]);
  const [userEmail, setUserEmail]   = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [uploadMsg, setUploadMsg]   = useState(null);
  const [form, setForm]             = useState({ title: '', category: '', description: '' });
  const fileRef = useRef(null);

  const adminGroups = config?.admin_groups ?? ['Admin', 'HR', 'HR Manager'];
  const superadmins = config?.superadmin_emails ?? [];
  const isAdmin = superadmins.map(e => e.toLowerCase()).includes(userEmail.toLowerCase()) ||
    userRoles.some(r => adminGroups.map(g => g.toLowerCase()).includes(r.toLowerCase()));

  useEffect(() => {
    getAuthStatus().then(d => {
      if (d.isAuthenticated) {
        setUserRoles(d.user?.roles ?? []);
        setUserEmail(d.user?.profile?.userPrincipalName ?? d.user?.profile?.mail ?? '');
      }
    });
    loadDocs();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) { setFiltered(docs); return; }
    const q = searchTerm.toLowerCase();
    setFiltered(docs.filter(d =>
      (d.title || '').toLowerCase().includes(q) ||
      (d.original_filename || '').toLowerCase().includes(q) ||
      (d.category || '').toLowerCase().includes(q) ||
      (d.description || '').toLowerCase().includes(q)
    ));
  }, [searchTerm, docs]);

  const loadDocs = () => {
    setLoading(true); setError(null);
    fetch('/api/documents', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { const list = Array.isArray(data) ? data : []; setDocs(list); setFiltered(list); })
      .catch(() => setError('Failed to load documents.'))
      .finally(() => setLoading(false));
  };

  const handleUpload = async e => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || !form.title) return;
    setUploading(true); setUploadMsg(null);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', form.title);
    fd.append('category', form.category);
    fd.append('description', form.description);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content },
        body: fd,
      });
      if (res.ok) {
        setUploadMsg({ type: 'ok', text: 'Uploaded successfully.' });
        setForm({ title: '', category: '', description: '' });
        if (fileRef.current) fileRef.current.value = '';
        setShowUpload(false);
        loadDocs();
      } else {
        const err = await res.json();
        setUploadMsg({ type: 'err', text: err?.message || 'Upload failed.' });
      }
    } catch { setUploadMsg({ type: 'err', text: 'Network error.' }); }
    finally { setUploading(false); }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this document?')) return;
    await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content },
    });
    loadDocs();
  };

  const getTypeBadge = doc => {
    const ext = (doc.original_filename || doc.title || '').split('.').pop()?.toUpperCase() || 'FILE';
    const colors = { PDF: 'bg-red-100 text-red-700', DOCX: 'bg-blue-100 text-blue-700', DOC: 'bg-blue-100 text-blue-700', XLSX: 'bg-green-100 text-green-700', XLS: 'bg-green-100 text-green-700', PPTX: 'bg-orange-100 text-orange-700', PPT: 'bg-orange-100 text-orange-700' };
    return { ext, color: colors[ext] || 'bg-slate-100 text-slate-600' };
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Document Directory</h1>
          <p className="text-slate-500 text-sm mt-0.5">Company documents, policies and templates</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setShowUpload(v => !v); setUploadMsg(null); }}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
            style={{ backgroundColor: BRAND }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Document
          </button>
        )}
      </div>

      {/* Upload form */}
      {showUpload && (
        <form onSubmit={handleUpload} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6 flex flex-col gap-4">
          <h2 className="font-bold text-slate-800">Upload New Document</h2>
          {uploadMsg && (
            <div className={`text-sm px-4 py-2 rounded-lg ${uploadMsg.type === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
              {uploadMsg.text}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Title *</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                placeholder="e.g. IT Security Policy 2025" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Category</label>
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                placeholder="e.g. Policy, Template, Guide" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                placeholder="Brief description (optional)" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 mb-1 block">File * (max 20 MB)</label>
              <input ref={fileRef} type="file" required
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg"
                className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:text-white file:cursor-pointer"
                style={{ '--file-bg': BRAND }}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={uploading}
              className="px-6 py-2 text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
              style={{ backgroundColor: BRAND }}>
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
            <button type="button" onClick={() => setShowUpload(false)}
              className="px-6 py-2 border rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input type="text" placeholder="Search documents…"
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm" />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BRAND, borderTopColor: 'transparent' }} />
            <span className="text-slate-500 font-medium">Loading documents…</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      ) : docs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium">No documents yet.</p>
            {isAdmin && <p className="text-slate-400 text-sm mt-1">Click "Upload Document" to add the first one.</p>}
          </div>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400 font-medium mb-3">
            {filtered.length === docs.length ? `${docs.length} document${docs.length !== 1 ? 's' : ''}` : `${filtered.length} of ${docs.length} documents`}
          </p>
          <div className="flex-1 overflow-y-auto">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-500">No documents match your search.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filtered.map(doc => {
                    const { ext, color } = getTypeBadge(doc);
                    return (
                      <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${color}`}>{ext}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-700 truncate">{doc.title || doc.original_filename}</p>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            {doc.category && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{doc.category}</span>}
                            {doc.description && <span className="text-xs text-slate-400 truncate">{doc.description}</span>}
                            {doc.uploaded_by_name && <span className="text-[10px] text-slate-400">by {doc.uploaded_by_name}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={doc.download_url || `/api/documents/${doc.id}/download`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download
                          </a>
                          {isAdmin && (
                            <button onClick={() => handleDelete(doc.id)}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
