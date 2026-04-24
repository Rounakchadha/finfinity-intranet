import { useState, useEffect } from 'react';

const BRAND = '#115948';

const STATUS_STYLES = {
  pending:  { label: 'Pending',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Approved', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-600 border-red-200' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600 border-slate-200' };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${s.cls}`}>{s.label}</span>
  );
}

export default function AssetRequestPage() {
  const [assetType, setAssetType] = useState('');
  const [notes, setNotes]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState(null);

  const [requests, setRequests]   = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(true);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    setLoadingReqs(true);
    try {
      const res = await fetch('/api/asset-requests', { credentials: 'include' });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoadingReqs(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assetType.trim()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/asset-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
        },
        credentials: 'include',
        body: JSON.stringify({ asset_type: assetType, notes }),
      });
      if (res.ok) {
        setSuccess(true);
        setAssetType('');
        setNotes('');
        fetchRequests();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? 'Request failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">IT Support</h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">
          Submit a request for new equipment or report a technical issue. IT will review and respond.
        </p>
      </div>

      {/* Submit form */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-2xl shadow-sm">
        <h2 className="text-base font-extrabold text-slate-900 mb-6">New Request</h2>

        {success && (
          <div className="mb-5 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Request submitted! IT will review it shortly.
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Asset type / issue <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={assetType}
              onChange={e => setAssetType(e.target.value)}
              placeholder="e.g. Broken Laptop, Need Mouse, VPN access…"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all hover:border-slate-300"
              style={{ '--tw-ring-color': BRAND }}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">Additional notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any extra details, location, urgency…"
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:bg-white transition-all hover:border-slate-300"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !assetType.trim()}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: BRAND }}
          >
            {submitting ? 'Submitting…' : 'Submit IT Request'}
          </button>
        </form>
      </div>

      {/* My requests */}
      <div className="max-w-2xl">
        <h2 className="text-base font-extrabold text-slate-900 mb-4">My Requests</h2>

        {loadingReqs ? (
          <div className="flex items-center gap-3 py-8 text-slate-400 text-sm">
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BRAND, borderTopColor: 'transparent' }} />
            Loading…
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-10 text-center">
            <p className="text-slate-400 text-sm font-medium">No requests yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm">{req.asset_type}</p>
                    {req.notes && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{req.notes}</p>}
                    {req.review_notes && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                        <span className="font-bold">IT note:</span> {req.review_notes}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-3">
                  Submitted {new Date(req.created_at).toLocaleDateString()}
                  {req.reviewed_at && ` · Reviewed ${new Date(req.reviewed_at).toLocaleDateString()}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
