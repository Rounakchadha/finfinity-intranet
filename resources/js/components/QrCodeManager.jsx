import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

const CATEGORIES = [
  { value: 'wifi',       label: 'Wi-Fi' },
  { value: 'cafeteria',  label: 'Cafeteria' },
  { value: 'parking',    label: 'Parking' },
  { value: 'emergency',  label: 'Emergency' },
  { value: 'custom',     label: 'Custom' },
];

function QrCanvas({ content }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && content) {
      QRCode.toCanvas(canvasRef.current, content, { width: 180, margin: 2 }).catch(() => {});
    }
  }, [content]);

  return <canvas ref={canvasRef} />;
}

function QrCard({ item, isAdmin, onEdit, onDelete }) {
  function handleDownload() {
    QRCode.toDataURL(item.content, { width: 400, margin: 2 }).then(url => {
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.name.replace(/\s+/g, '_')}_qr.png`;
      a.click();
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow p-5 flex flex-col items-center gap-3 border border-gray-100">
      <QrCanvas content={item.content} />
      <div className="text-center">
        <p className="font-bold text-gray-800">{item.name}</p>
        {item.description && <p className="text-xs text-gray-400 mt-1">{item.description}</p>}
        <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 capitalize">
          {item.category}
        </span>
        {item.is_dynamic && (
          <span className="inline-block ml-1 text-xs bg-blue-100 text-blue-600 rounded-full px-2 py-0.5">Dynamic</span>
        )}
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        <button
          onClick={handleDownload}
          className="text-xs bg-[#115948] text-white px-3 py-1.5 rounded-lg hover:bg-[#0f4a3e] transition"
        >
          Download
        </button>
        {isAdmin && (
          <>
            <button onClick={() => onEdit(item)} className="text-xs text-blue-600 hover:underline">Edit</button>
            <button onClick={() => onDelete(item.id)} className="text-xs text-red-500 hover:underline">Delete</button>
          </>
        )}
      </div>
    </div>
  );
}

const emptyForm = { name: '', category: 'wifi', description: '', content: '', is_dynamic: false };

export default function QrCodeManager({ config }) {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const adminGroups = config?.admin_groups ?? ['Admin', 'HR', 'HR Manager', 'IT Manager'];
  const isAdmin = userRoles.some(r => adminGroups.includes(r));

  useEffect(() => {
    fetch('/api/auth/status', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data.user?.roles) setUserRoles(data.user.roles); })
      .catch(() => {});
    loadQrCodes();
  }, []);

  function loadQrCodes() {
    setLoading(true);
    fetch('/api/qr-codes', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setQrCodes(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const url    = editingId ? `/api/qr-codes/${editingId}` : '/api/qr-codes';
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
      },
      body: JSON.stringify(form),
    })
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(() => { setForm(emptyForm); setEditingId(null); setShowForm(false); loadQrCodes(); })
      .catch(() => setError('Failed to save. Please try again.'))
      .finally(() => setSubmitting(false));
  }

  function handleEdit(item) {
    setForm({ name: item.name, category: item.category, description: item.description ?? '', content: item.content, is_dynamic: item.is_dynamic });
    setEditingId(item.id);
    setShowForm(true);
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this QR code?')) return;
    fetch(`/api/qr-codes/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content },
    }).then(() => loadQrCodes());
  }

  const filtered = filter === 'all' ? qrCodes : qrCodes.filter(q => q.category === filter);
  const primary  = config?.branding?.primary_color ?? '#115948';

  return (
    <div className="flex flex-col gap-4 w-full h-full px-8 py-6 overflow-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold">QR Codes</h1>
        {isAdmin && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition"
            style={{ backgroundColor: primary }}
          >
            + New QR Code
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`text-xs px-3 py-1.5 rounded-full border transition ${filter === 'all' ? 'text-white border-transparent' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
          style={filter === 'all' ? { backgroundColor: primary } : {}}
        >
          All
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${filter === c.value ? 'text-white border-transparent' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            style={filter === c.value ? { backgroundColor: primary } : {}}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col gap-4 max-w-lg">
          <h2 className="font-bold text-lg">{editingId ? 'Edit QR Code' : 'New QR Code'}</h2>
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <select className="border rounded-lg px-3 py-2 text-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <textarea className="border rounded-lg px-3 py-2 text-sm" placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
          <textarea className="border rounded-lg px-3 py-2 text-sm font-mono" placeholder="Content (URL or text to encode)" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={3} required />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_dynamic} onChange={e => setForm(f => ({ ...f, is_dynamic: e.target.checked }))} />
            Dynamic (content can be updated later)
          </label>

          {form.content && (
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-gray-400">Preview</p>
              <QrCanvas content={form.content} />
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="text-white px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition" style={{ backgroundColor: primary }}>
              {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(false); setError(null); }} className="border px-5 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mr-3" style={{ borderColor: primary }}></div>
          <span className="text-gray-500">Loading QR codes...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No QR codes found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map(item => (
            <QrCard key={item.id} item={item} isAdmin={isAdmin} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
