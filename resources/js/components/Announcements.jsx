import { useEffect, useState } from 'react';
import { getAuthStatus } from '../authCache';

function PinIcon() {
  return (
    <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
    </svg>
  );
}

function AnnouncementCard({ item, isAdminOrHR, onAcknowledge, onEdit, onDelete }) {
  const isExpired = item.expires_at && new Date(item.expires_at) < new Date();
  const expiresDate = item.expires_at ? new Date(item.expires_at).toLocaleDateString() : null;

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 border ${item.is_pinned ? 'border-yellow-400 bg-yellow-50/30' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {item.is_pinned && (
              <span className="text-yellow-500 text-xs font-semibold uppercase">
                <PinIcon /> Pinned
              </span>
            )}
            <h3 className="text-lg font-bold text-slate-800 truncate">{item.title}</h3>
          </div>
          <p className="text-slate-600 text-sm whitespace-pre-wrap mb-3">{item.body}</p>
          <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
            <span>Posted by {item.posted_by}</span>
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
            {expiresDate && (
              <span className={isExpired ? 'text-red-400' : 'text-gray-400'}>
                {isExpired ? 'Expired' : `Expires ${expiresDate}`}
              </span>
            )}
            <span>{item.ack_count} acknowledgement{item.ack_count !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {!item.acknowledged_by_me && !isExpired && (
            <button
              onClick={() => onAcknowledge(item.id)}
              className="bg-[#115948] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#0f4a3e] transition"
            >
              Acknowledge
            </button>
          )}
          {item.acknowledged_by_me && (
            <span className="text-green-600 text-xs font-semibold">✓ Acknowledged</span>
          )}
          {isAdminOrHR && (
            <div className="flex gap-1">
              <button
                onClick={() => onEdit(item)}
                className="text-xs text-blue-600 hover:underline"
              >
                Edit
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => onDelete(item.id)}
                className="text-xs text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const emptyForm = { title: '', body: '', is_pinned: false, expires_at: '' };

export default function Announcements({ config }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const adminGroups = config?.admin_groups ?? ['Admin', 'HR', 'HR Manager'];
  const isAdminOrHR = userRoles.some(r => adminGroups.map(g => g.toLowerCase()).includes(r.toLowerCase()));

  useEffect(() => {
    getAuthStatus().then(data => {
      if (data.isAuthenticated && data.user?.roles) setUserRoles(data.user.roles);
    });

    loadAnnouncements();
  }, []);

  function loadAnnouncements() {
    setLoading(true);
    fetch('/api/announcements', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setAnnouncements(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  function handleAcknowledge(id) {
    fetch(`/api/announcements/${id}/acknowledge`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content },
    })
      .then(r => r.json())
      .then(() => loadAnnouncements())
      .catch(() => {});
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const url    = editingId ? `/api/announcements/${editingId}` : '/api/announcements';
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
      },
      body: JSON.stringify({ ...form, expires_at: form.expires_at || null }),
    })
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(() => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);
        loadAnnouncements();
      })
      .catch(() => setError('Failed to save announcement. Please try again.'))
      .finally(() => setSubmitting(false));
  }

  function handleEdit(item) {
    setForm({
      title:      item.title,
      body:       item.body,
      is_pinned:  item.is_pinned,
      expires_at: item.expires_at ? item.expires_at.slice(0, 10) : '',
    });
    setEditingId(item.id);
    setShowForm(true);
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this announcement?')) return;
    fetch(`/api/announcements/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content },
    })
      .then(() => loadAnnouncements())
      .catch(() => {});
  }

  function cancelForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  }

  const primary = config?.branding?.primary_color ?? '#115948';

  return (
    <div className="flex flex-col gap-6 w-full h-full p-8 overflow-y-auto scrollbar-hide">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Announcements</h1>
        {isAdminOrHR && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-white px-4 py-2 rounded-xl text-sm font-semibold transition hover:opacity-90"
            style={{ backgroundColor: primary }}
          >
            + New Announcement
          </button>
        )}
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 flex flex-col gap-4">
          <h2 className="font-bold text-lg">{editingId ? 'Edit Announcement' : 'New Announcement'}</h2>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <input
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#115948]"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />
          <textarea
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#115948] min-h-[100px]"
            placeholder="Body"
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            required
          />
          <div className="flex gap-6 items-center flex-wrap">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_pinned}
                onChange={e => setForm(f => ({ ...f, is_pinned: e.target.checked }))}
              />
              Pin to top
            </label>
            <label className="flex items-center gap-2 text-sm">
              Expires:
              <input
                type="date"
                className="border rounded px-2 py-1 text-sm"
                value={form.expires_at}
                onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
              />
            </label>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="text-white px-5 py-2 rounded-xl text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: primary }}
            >
              {submitting ? 'Saving...' : editingId ? 'Update' : 'Post'}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="border px-5 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mr-3" style={{ borderColor: primary }}></div>
          <span className="text-gray-500">Loading announcements...</span>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No announcements yet.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map(item => (
            <AnnouncementCard
              key={item.id}
              item={item}
              isAdminOrHR={isAdminOrHR}
              onAcknowledge={handleAcknowledge}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
