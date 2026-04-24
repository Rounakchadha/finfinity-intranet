import { useState, useEffect, useMemo } from 'react';

const BRAND = '#115948';

const TABS = [
  { id: 'overview',   label: 'Overview' },
  { id: 'inventory',  label: 'Asset Inventory' },
  { id: 'requests',   label: 'IT Requests' },
  { id: 'add',        label: 'Add Asset' },
  { id: 'audit',      label: 'Audit Log' },
];

function StatCard({ label, value, sub, color = BRAND }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function Badge({ status }) {
  const map = {
    active:         'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive:       'bg-amber-50 text-amber-700 border-amber-200',
    decommissioned: 'bg-red-50 text-red-600 border-red-200',
    pending:        'bg-amber-50 text-amber-700 border-amber-200',
    approved:       'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected:       'bg-red-50 text-red-600 border-red-200',
  };
  const cls = map[status] ?? 'bg-slate-100 text-slate-600 border-slate-200';
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${cls}`}>{status}</span>;
}

function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  const cls = type === 'error'
    ? 'bg-red-50 border-red-200 text-red-700'
    : 'bg-emerald-50 border-emerald-200 text-emerald-700';
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold ${cls}`}>
      <span className="flex-1">{msg}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="h-1 rounded-t-2xl" style={{ backgroundColor: BRAND }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// Employee picker — searchable dropdown
function EmployeePicker({ employees, value, onChange, placeholder = 'Search employee…' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selected = employees.find(e => e.employee_email === value);

  const filtered = useMemo(() => {
    if (!query) return employees.slice(0, 40);
    const q = query.toLowerCase();
    return employees.filter(e =>
      e.name?.toLowerCase().includes(q) ||
      e.employee_email?.toLowerCase().includes(q) ||
      e.job_title?.toLowerCase().includes(q)
    ).slice(0, 40);
  }, [employees, query]);

  return (
    <div className="relative">
      <div
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus-within:ring-2 focus-within:bg-white transition-all cursor-pointer flex items-center justify-between"
        onClick={() => setOpen(o => !o)}
      >
        {selected ? (
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-slate-900">{selected.name}</span>
            <span className="text-slate-400 text-xs ml-2">{selected.employee_email}</span>
          </div>
        ) : (
          <span className="text-slate-400">{placeholder}</span>
        )}
        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Type to filter…"
              className="w-full px-3 py-2 text-sm bg-slate-50 rounded-lg outline-none"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400">No employees found</div>
            ) : filtered.map(e => (
              <button
                key={e.employee_email}
                onClick={() => { onChange(e.employee_email); setOpen(false); setQuery(''); }}
                className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 transition text-sm ${value === e.employee_email ? 'bg-emerald-50' : ''}`}
              >
                <span className="font-semibold text-slate-900">{e.name}</span>
                <span className="text-slate-400 text-xs ml-2">{e.job_title}</span>
                <div className="text-xs text-slate-400">{e.employee_email}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmployeeDeviceTable({ title, subtitle, rows, tagColor, showDevice }) {
  return (
    <div>
      <div className="mb-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Emp No', 'Name', 'Email', 'Job Title', 'Location', showDevice ? 'Device' : 'Type'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map(e => (
              <tr key={e.employee_email} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5 text-xs text-slate-400 font-mono">{e.employee_number || '—'}</td>
                <td className="px-4 py-2.5 font-semibold text-slate-800 text-sm">{e.name}</td>
                <td className="px-4 py-2.5 text-xs text-slate-400">{e.employee_email}</td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{e.job_title || '—'}</td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{normalizeLocation(e.location) || '—'}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tagColor}`}>
                    {showDevice ? (e.personal_device || e.device_type || '—') : (e.device_type || 'NA')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const normalizeLocation = loc => loc ? loc.replace(/^SGPL\s+/i, '').trim() : loc;

const INPUT   = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all';
const BTN_PRIMARY = 'px-4 py-2.5 text-sm font-bold text-white rounded-xl transition hover:opacity-90 disabled:opacity-50';
const BTN_GHOST   = 'px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition';

export default function ITToolsPage() {
  const [tab, setTab] = useState('overview');
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [requests, setRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [laptopMatrix, setLaptopMatrix] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  // Dropdown data from API
  const [assetTypes, setAssetTypes] = useState([]);
  const [locations, setLocations] = useState([]);

  // Allocation modal state
  const [actionModal, setActionModal] = useState(null);
  const [actionEmail, setActionEmail] = useState('');
  const [conflictWarning, setConflictWarning] = useState(null);

  // Review modal state
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // Edit asset modal
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const [form, setForm] = useState({
    tag: '', ownership: 'Rental', warranty: '',
    serial_number: '', model: '',
    location: '', locationCustom: false,
    assign_to: 'none', assign_email: '', assign_contractor_name: '',
  });

  const csrf = () => document.querySelector('meta[name="csrf-token"]')?.content;
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => { loadEmployees(); loadAssetTypes(); loadLocations(); }, []);

  useEffect(() => {
    if (tab === 'inventory') loadAssets(filterStatus);
    if (tab === 'requests')  loadRequests();
    if (tab === 'audit')     loadAuditLogs();
    if (tab === 'overview')  { loadAssets('all'); loadRequests(); loadLaptopMatrix(); }
  }, [tab]);

  useEffect(() => { if (tab === 'inventory') loadAssets(filterStatus); }, [filterStatus]);

  const loadEmployees = async () => {
    try {
      const r = await fetch('/api/employees', { credentials: 'include' });
      const d = await r.json();
      setEmployees(Array.isArray(d) ? d : []);
    } catch {}
  };

  const loadAssetTypes = async () => {
    try {
      const r = await fetch('/api/assets/types', { credentials: 'include' });
      const d = await r.json();
      setAssetTypes(Array.isArray(d) ? d : []);
    } catch {}
  };

  const loadLocations = async () => {
    try {
      const r = await fetch('/api/assets/locations', { credentials: 'include' });
      const d = await r.json();
      setLocations(Array.isArray(d) ? d : []);
    } catch {}
  };

  const loadAssets = async (filter = 'all') => {
    setLoading(true);
    try {
      const r = await fetch(`/api/assets?filter=${filter}`, { credentials: 'include' });
      const d = await r.json();
      setAssets(Array.isArray(d.assets) ? d.assets : []);
    } catch { setAssets([]); }
    finally { setLoading(false); }
  };

  const loadLaptopMatrix = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/assets/laptop-matrix', { credentials: 'include' });
      const d = await r.json();
      setLaptopMatrix(d);
    } catch { setLaptopMatrix(null); }
    finally { setLoading(false); }
  };

  const loadRequests = async () => {
    try {
      const r = await fetch('/api/asset-requests', { credentials: 'include' });
      const d = await r.json();
      setRequests(Array.isArray(d) ? d : []);
    } catch { setRequests([]); }
  };

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/assets/audit-logs', { credentials: 'include' });
      const d = await r.json();
      setAuditLogs(Array.isArray(d) ? d : []);
    } catch { setAuditLogs([]); }
    finally { setLoading(false); }
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        tag:                    form.tag || undefined,
        ownership:              form.ownership,
        model:                  form.model || undefined,
        serial_number:          form.serial_number || undefined,
        warranty:               form.warranty || undefined,
        location:               form.location || undefined,
        assign_to:              form.assign_to !== 'none' ? form.assign_to : undefined,
        assign_email:           form.assign_email || undefined,
        assign_contractor_name: form.assign_contractor_name || undefined,
      };
      const r = await fetch('/api/assets', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (r.ok) {
        const assigned = form.assign_to !== 'none';
        showToast(`Laptop ${d.tag} registered${assigned ? ' and assigned' : ' as spare'}`);
        setForm({
          tag: '', ownership: 'Rental', warranty: '',
          serial_number: '', model: '',
          location: '', locationCustom: false,
          assign_to: 'none', assign_email: '', assign_contractor_name: '',
        });
        loadAssets('all');
        if (tab === 'overview') loadLaptopMatrix();
      } else {
        showToast(d.error || d.message || 'Failed to create asset', 'error');
      }
    } catch { showToast('Network error', 'error'); }
    finally { setLoading(false); }
  };

  const handleEditAsset = async () => {
    if (!editModal) return;
    setEditSaving(true);
    try {
      const r = await fetch(`/api/assets/${editModal.tag}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
        body: JSON.stringify(editForm),
      });
      const d = await r.json();
      if (r.ok) {
        showToast('Asset updated');
        setEditModal(null);
        loadAssets(filterStatus);
        loadLocations();
      } else {
        showToast(d.error || d.message || 'Failed to update', 'error');
      }
    } catch { showToast('Network error', 'error'); }
    finally { setEditSaving(false); }
  };

  const handleAllocate = async (force = false) => {
    if (!actionEmail || !actionModal) return;
    setConflictWarning(null);
    try {
      const r = await fetch('/api/assets/allocate', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
        body: JSON.stringify({ asset_tag: actionModal.asset.tag, user_email: actionEmail, force }),
      });
      const d = await r.json();
      if (r.status === 409 && d.warning) {
        setConflictWarning(d);
        return;
      }
      if (r.ok) {
        showToast('Asset allocated');
        setActionModal(null); setActionEmail('');
        loadAssets(filterStatus);
        if (tab === 'laptops') loadLaptopMatrix();
      } else {
        showToast(d.error || 'Failed', 'error');
      }
    } catch { showToast('Network error', 'error'); }
  };

  const handleDeallocate = async (tag) => {
    try {
      const r = await fetch('/api/assets/deallocate', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
        body: JSON.stringify({ asset_tag: tag }),
      });
      const d = await r.json();
      if (r.ok) {
        showToast('Asset returned');
        loadAssets(filterStatus);
        if (tab === 'laptops') loadLaptopMatrix();
      } else showToast(d.error || 'Failed', 'error');
    } catch { showToast('Network error', 'error'); }
  };

  const handleReallocate = async () => {
    if (!actionEmail || !actionModal) return;
    try {
      const r = await fetch('/api/assets/reallocate', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
        body: JSON.stringify({ asset_tag: actionModal.asset.tag, new_user_email: actionEmail }),
      });
      const d = await r.json();
      if (r.ok) {
        showToast('Asset reassigned');
        setActionModal(null); setActionEmail('');
        loadAssets(filterStatus);
        if (tab === 'laptops') loadLaptopMatrix();
      } else showToast(d.error || 'Failed', 'error');
    } catch { showToast('Network error', 'error'); }
  };

  const handleDecommission = async (tag) => {
    if (!confirm(`Decommission asset ${tag}? This cannot be undone.`)) return;
    try {
      const r = await fetch('/api/assets/decommission', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
        body: JSON.stringify({ asset_tags: [tag] }),
      });
      const d = await r.json();
      if (r.ok) { showToast('Asset decommissioned'); loadAssets(filterStatus); }
      else showToast(d.error || 'Failed', 'error');
    } catch { showToast('Network error', 'error'); }
  };

  const handleReview = async () => {
    if (!reviewModal) return;
    try {
      const r = await fetch(`/api/asset-requests/${reviewModal.id}/review`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
        body: JSON.stringify({ status: reviewModal.status, review_notes: reviewNotes }),
      });
      const d = await r.json();
      if (r.ok) { showToast(`Request ${reviewModal.status}`); setReviewModal(null); setReviewNotes(''); loadRequests(); }
      else showToast(d.error || 'Failed', 'error');
    } catch { showToast('Network error', 'error'); }
  };

  const openAllocateModal = (asset, type = 'allocate') => {
    setActionModal({ type, asset });
    setActionEmail('');
    setConflictWarning(null);
  };

  const filtered = assets.filter(a => {
    const matchesType = filterType === 'all' || a.type === filterType;
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      a.tag?.toLowerCase().includes(q) ||
      a.model?.toLowerCase().includes(q) ||
      a.type?.toLowerCase().includes(q) ||
      a.serial_number?.toLowerCase().includes(q) ||
      a.allocated_to_name?.toLowerCase().includes(q) ||
      a.allocated_to_email?.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const stats = {
    total:           assets.filter(a => a.ownership !== 'BYOD').length,
    active:          assets.filter(a => a.status === 'active' && a.ownership !== 'BYOD').length,
    inactive:        assets.filter(a => a.status === 'inactive' && a.ownership !== 'BYOD').length,
    decommissioned:  assets.filter(a => a.status === 'decommissioned').length,
    openRequests:    requests.filter(r => r.status === 'pending').length,
  };

  const ls = laptopMatrix?.stats ?? {};

  return (
    <div className="p-8 space-y-6 h-full overflow-y-auto overflow-x-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">IT Admin</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage assets, review requests, and track inventory</p>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Section 1: Vendor Rental Pool */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Vendor Laptop Pool</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total in Pool"
                value={laptopMatrix ? (ls.total_laptops ?? 0) - (ls.decommissioned ?? 0) : stats.total}
                sub={ls.decommissioned ? `${ls.decommissioned} decommissioned` : undefined} />
              <StatCard label="Assigned Out"    value={laptopMatrix ? (ls.allocated ?? 0) : stats.active}   color="#16a34a" />
              <StatCard label="In Stock (Spare)" value={laptopMatrix ? (ls.spare ?? 0) : stats.inactive}     color="#d97706" />
              <StatCard label="Open Requests"   value={stats.openRequests}   color="#2563eb" />
            </div>
          </div>

          {/* Section 2: Employee Device Mix */}
          {laptopMatrix && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Employee Device Mix</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Vendor Rented"    value={ls.rented_assigned ?? 0}  color="#16a34a"
                  sub={`${(ls.rented_not_linked ?? 0) > 0 ? `${ls.rented_not_linked} not yet linked` : ''}`} />
                <StatCard label="Company Owned"    value={ls.finfinity_owned ?? 0}  color="#7c3aed" />
                <StatCard label="BYOD (Personal)"  value={ls.byod_count ?? 0}       color="#2563eb" />
                <StatCard label="No Device"        value={ls.no_device ?? 0}        color="#94a3b8" />
              </div>
            </div>
          )}

          {stats.openRequests > 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm font-semibold">
              {stats.openRequests} pending IT request{stats.openRequests > 1 ? 's' : ''} need your review.{' '}
              <button onClick={() => setTab('requests')} className="underline">Review now</button>
            </div>
          )}
        </div>
      )}

      {/* ── LAPTOP MATRIX ────────────────────────────────────────────────────── */}
      {tab === 'laptops' && (
        <div className="space-y-6">
          {/* Stats bar */}
          {laptopMatrix && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard label="Total Laptops"      value={ls.total_laptops ?? 0} />
              <StatCard label="Rented — Assigned"  value={ls.allocated ?? 0}          color="#16a34a" />
              <StatCard label="Spare / Returned"   value={ls.spare ?? 0}              color="#d97706" />
              <StatCard label="BYOD (Personal)"    value={ls.byod_count ?? 0}         color="#2563eb" />
              <StatCard label="Finfinity Owned"    value={ls.finfinity_owned ?? 0}    color="#7c3aed" />
            </div>
          )}

          {/* ── Rented Laptop Inventory ── */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rented Laptop Inventory</p>
              <input
                placeholder="Search by asset no, model, serial, employee, city…"
                value={laptopSearch}
                onChange={e => setLaptopSearch(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs w-72 focus:outline-none focus:ring-2"
              />
              <span className="text-xs text-slate-400">{filteredLaptops.length} records</span>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BRAND, borderTopColor: 'transparent' }} />
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {['Asset No', 'Model', 'Serial No', 'Office Location', 'Employee City', 'Status', 'Assigned To', 'Job Title', 'Monthly Rent', 'Out Date', 'Contract End', 'Actions'].map(h => (
                        <th key={h} className="text-left px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredLaptops.map(l => (
                      <tr key={l.tag} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2.5 font-bold text-slate-800 text-xs font-mono whitespace-nowrap">{l.tag}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">{l.model}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-500 font-mono">{l.serial_number || '—'}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-500">{l.location || '—'}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-500">{l.city || '—'}</td>
                        <td className="px-3 py-2.5"><Badge status={l.status} /></td>
                        <td className="px-3 py-2.5">
                          {l.allocated_to_email ? (
                            <div>
                              <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">{l.allocated_to_name || l.allocated_to_email}</p>
                              <p className="text-xs text-slate-400">{l.allocated_to_email}</p>
                              {l.allocated_to_emp_no && <p className="text-[10px] text-slate-300 font-mono">{l.allocated_to_emp_no}</p>}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">{l.allocated_to_title || '—'}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">{l.monthly_rent || '—'}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-400 whitespace-nowrap">{l.out_date || '—'}</td>
                        <td className="px-3 py-2.5 text-xs max-w-[140px]">
                          {l.contract_end_note ? (
                            <span className="text-amber-700 font-semibold">{l.contract_end_note}</span>
                          ) : '—'}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1">
                            {l.status === 'inactive' && (
                              <button
                                onClick={() => openAllocateModal({ tag: l.tag, type: 'Laptop' }, 'allocate')}
                                className="text-xs px-2.5 py-1 rounded-lg font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition whitespace-nowrap"
                              >Assign</button>
                            )}
                            {l.status === 'active' && (
                              <>
                                <button
                                  onClick={() => openAllocateModal({ tag: l.tag, type: 'Laptop', allocated_to_email: l.allocated_to_email }, 'reallocate')}
                                  className="text-xs px-2.5 py-1 rounded-lg font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                                >Reassign</button>
                                <button
                                  onClick={() => handleDeallocate(l.tag)}
                                  className="text-xs px-2.5 py-1 rounded-lg font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
                                >Return</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── BYOD Employees ── */}
          {laptopMatrix?.byod?.length > 0 && (
            <EmployeeDeviceTable
              title={`BYOD — Personal Laptops (${laptopMatrix.byod.length})`}
              subtitle="These employees use their own personal devices"
              rows={laptopMatrix.byod}
              tagColor="bg-blue-50 text-blue-700"
              showDevice={false}
            />
          )}

          {/* ── Finfinity Owned ── */}
          {laptopMatrix?.finfinity_owned?.length > 0 && (
            <EmployeeDeviceTable
              title={`Finfinity Owned Devices (${laptopMatrix.finfinity_owned.length})`}
              subtitle="Company-owned devices (not part of rented inventory)"
              rows={laptopMatrix.finfinity_owned}
              tagColor="bg-purple-50 text-purple-700"
              showDevice={true}
            />
          )}

          {/* ── No Device ── */}
          {laptopMatrix?.no_device?.length > 0 && (
            <EmployeeDeviceTable
              title={`No Device Assigned (${laptopMatrix.no_device.length})`}
              subtitle="Employees with no laptop on record"
              rows={laptopMatrix.no_device}
              tagColor="bg-slate-100 text-slate-500"
              showDevice={false}
            />
          )}

          {/* ── Rented but not linked in system ── */}
          {laptopMatrix?.rented_not_linked?.length > 0 && (
            <EmployeeDeviceTable
              title={`Rented — Not Yet Linked in System (${laptopMatrix.rented_not_linked.length})`}
              subtitle="Marked as 'Rented' in employee data but no active allocation found"
              rows={laptopMatrix.rented_not_linked}
              tagColor="bg-amber-50 text-amber-700"
              showDevice={false}
            />
          )}
        </div>
      )}

      {/* ── ASSET INVENTORY ──────────────────────────────────────────────────── */}
      {tab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              placeholder="Search by tag, model, type, serial, employee…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-64 focus:outline-none focus:ring-2"
            />
            {/* Status filter */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {['all', 'active', 'inactive', 'decommissioned'].map(f => (
                <button key={f} onClick={() => setFilterStatus(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                    filterStatus === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >{f}</button>
              ))}
            </div>
            {/* Type filter */}
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none"
            >
              <option value="all">All Types</option>
              {assetTypes.map(t => <option key={t.type} value={t.type}>{t.type}</option>)}
            </select>
            <button onClick={() => setTab('add')} className={BTN_PRIMARY} style={{ backgroundColor: BRAND }}>
              + Add Asset
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BRAND, borderTopColor: 'transparent' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-16 text-center text-slate-400 text-sm">
              No assets found.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Tag', 'Ownership', 'Model', 'Serial', 'Warranty', 'Location', 'Status', 'Assigned To', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(a => (
                    <tr key={a.tag} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800 text-xs font-mono whitespace-nowrap">{a.tag}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{a.ownership || '—'}</td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{a.model || '—'}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-mono">{a.serial_number || '—'}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {a.warranty
                          ? <span className={a.warranty === 'Under Warranty' ? 'text-emerald-600 font-semibold' : 'text-slate-500'}>{a.warranty}</span>
                          : <span className="text-slate-300 italic">null</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm whitespace-nowrap">{a.location || '—'}</td>
                      <td className="px-4 py-3"><Badge status={a.status} /></td>
                      <td className="px-4 py-3">
                        {a.allocated_to_email ? (
                          <div>
                            <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">{a.allocated_to_name || a.allocated_to_email}</p>
                            <p className="text-xs text-slate-400">{a.allocated_to_email}</p>
                          </div>
                        ) : <span className="text-xs text-slate-300 italic">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-nowrap">
                          <button
                            onClick={() => { setEditModal(a); setEditForm({ model: a.model || '', serial_number: a.serial_number || '', warranty: a.warranty || '', location: a.location || '', ownership: a.ownership || 'Rental', locationCustom: false }); }}
                            className="text-xs px-2.5 py-1 rounded-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                          >Edit</button>
                          {a.status === 'inactive' && (
                            <button
                              onClick={() => openAllocateModal(a, 'allocate')}
                              className="text-xs px-2.5 py-1 rounded-lg font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition whitespace-nowrap"
                            >Assign</button>
                          )}
                          {a.status === 'active' && (
                            <>
                              <button
                                onClick={() => openAllocateModal(a, 'reallocate')}
                                className="text-xs px-2.5 py-1 rounded-lg font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                              >Move</button>
                              <button
                                onClick={() => handleDeallocate(a.tag)}
                                className="text-xs px-2.5 py-1 rounded-lg font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
                              >Return</button>
                            </>
                          )}
                          {a.status === 'inactive' && (
                            <button
                              onClick={() => handleDecommission(a.tag)}
                              className="text-xs px-2.5 py-1 rounded-lg font-bold text-red-600 bg-red-50 hover:bg-red-100 transition"
                            >Decommission</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── IT REQUESTS ──────────────────────────────────────────────────────── */}
      {tab === 'requests' && (
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-16 text-center text-slate-400 text-sm">
              No requests yet.
            </div>
          ) : requests.map(req => (
            <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-slate-900">{req.asset_type}</p>
                  <Badge status={req.status} />
                </div>
                <p className="text-xs text-slate-500">{req.employee_name} · {req.employee_email}</p>
                {req.notes && <p className="text-xs text-slate-500 mt-1">{req.notes}</p>}
                {req.review_notes && (
                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                    Review note: {req.review_notes}
                  </p>
                )}
                <p className="text-[10px] text-slate-400 mt-2">
                  {new Date(req.created_at).toLocaleDateString()}
                  {req.reviewed_at && ` · Reviewed ${new Date(req.reviewed_at).toLocaleDateString()}`}
                </p>
              </div>
              {req.status === 'pending' && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setReviewModal({ id: req.id, status: 'approved' }); setReviewNotes(''); }}
                    className="text-xs px-3 py-1.5 rounded-lg font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
                  >Approve</button>
                  <button
                    onClick={() => { setReviewModal({ id: req.id, status: 'rejected' }); setReviewNotes(''); }}
                    className="text-xs px-3 py-1.5 rounded-lg font-bold text-red-600 bg-red-50 hover:bg-red-100 transition"
                  >Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── ADD ASSET ────────────────────────────────────────────────────────── */}
      {tab === 'add' && (
        <div className="max-w-2xl">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-900 mb-1">Register New Laptop</h2>
            <p className="text-xs text-slate-400 mb-5">Asset tag is auto-generated if left blank.</p>
            <form onSubmit={handleAddAsset} className="space-y-5">

              {/* Row 1: Asset Tag + Ownership */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Asset Tag</label>
                  <input type="text" value={form.tag} onChange={e => setForm({...form, tag: e.target.value})}
                    placeholder="e.g. 538LAPCCS (auto if blank)" className={INPUT} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Ownership *</label>
                  <select
                    value={form.ownership}
                    onChange={e => {
                      const o = e.target.value;
                      setForm(f => ({
                        ...f, ownership: o,
                        ...(o === 'BYOD' ? { model: '', serial_number: '', warranty: '', location: '', locationCustom: false } : {}),
                      }));
                    }}
                    required className={INPUT}
                  >
                    <option value="Rental">Rental</option>
                    <option value="SGPL">SGPL (Company Owned)</option>
                    <option value="BYOD">BYOD (Personal)</option>
                  </select>
                </div>
              </div>

              {/* BYOD notice */}
              {form.ownership === 'BYOD' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 font-medium">
                  BYOD devices are personal — they appear in the directory but are not counted in company inventory totals.
                </div>
              )}

              {/* Model + Serial (hidden for BYOD) */}
              {form.ownership !== 'BYOD' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Model *</label>
                    <input type="text" value={form.model} onChange={e => setForm({...form, model: e.target.value})}
                      maxLength={50} required placeholder="e.g. Dell Latitude 5540" className={INPUT} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Serial Number</label>
                    <input type="text" value={form.serial_number} onChange={e => setForm({...form, serial_number: e.target.value})}
                      maxLength={30} placeholder="Found under the device" className={INPUT} />
                  </div>
                </div>
              )}

              {/* Warranty + Location (hidden for BYOD) */}
              {form.ownership !== 'BYOD' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Warranty</label>
                    <select value={form.warranty} onChange={e => setForm({...form, warranty: e.target.value})} className={INPUT}>
                      <option value="">— (not set)</option>
                      <option value="Under Warranty">Under Warranty</option>
                      <option value="Out of Warranty">Out of Warranty</option>
                      <option value="NA">N/A</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Location</label>
                    <select
                      value={form.locationCustom ? '__other__' : form.location}
                      onChange={e => {
                        if (e.target.value === '__other__') {
                          setForm(f => ({...f, locationCustom: true, location: ''}));
                        } else {
                          setForm(f => ({...f, locationCustom: false, location: e.target.value}));
                        }
                      }}
                      className={INPUT}
                    >
                      <option value="">Select location…</option>
                      {locations.map(l => <option key={l.unique_location} value={l.unique_location}>{l.unique_location}</option>)}
                      <option value="__other__">Other (type new)…</option>
                    </select>
                    {form.locationCustom && (
                      <input
                        type="text" value={form.location}
                        onChange={e => setForm(f => ({...f, location: e.target.value}))}
                        placeholder="Type location name…"
                        className={INPUT + ' mt-2'}
                        autoFocus
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Assigned To */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold text-slate-700 mb-2">Assigned To</label>
                <div className="flex gap-2 mb-3">
                  {[['none', 'Not Assigned'], ['employee', 'Employee'], ['contractor', 'Contractor']].map(([v, lbl]) => (
                    <button type="button" key={v}
                      onClick={() => setForm(f => ({...f, assign_to: v, assign_email: '', assign_contractor_name: ''}))}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        form.assign_to === v
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >{lbl}</button>
                  ))}
                </div>
                {form.assign_to === 'employee' && (
                  <EmployeePicker employees={employees} value={form.assign_email}
                    onChange={v => setForm(f => ({...f, assign_email: v}))} />
                )}
                {form.assign_to === 'contractor' && (
                  <input type="text" value={form.assign_contractor_name}
                    onChange={e => setForm(f => ({...f, assign_contractor_name: e.target.value}))}
                    placeholder="Contractor full name" className={INPUT} />
                )}
              </div>

              <button type="submit" disabled={loading} className={BTN_PRIMARY + ' w-full'} style={{ backgroundColor: BRAND }}>
                {loading ? 'Saving…' : 'Register Laptop →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── AUDIT LOG ────────────────────────────────────────────────────────── */}
      {tab === 'audit' && (
        <div>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BRAND, borderTopColor: 'transparent' }} />
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-16 text-center text-slate-400 text-sm">
              No audit logs yet.
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Asset Tag', 'Action', 'Performed By', 'Details', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-800 font-mono text-xs">{log.asset_tag}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          log.action === 'created'     ? 'bg-slate-100 text-slate-600' :
                          log.action === 'allocated'   ? 'bg-emerald-50 text-emerald-700' :
                          log.action === 'deallocated' ? 'bg-amber-50 text-amber-700' :
                          log.action === 'reallocated' ? 'bg-blue-50 text-blue-700' :
                          'bg-red-50 text-red-600'
                        }`}>{log.action}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{log.performed_by_name || log.performed_by_email}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {log.to_user_email && `→ ${log.to_user_email}`}
                        {log.from_user_email && `← ${log.from_user_email}`}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{new Date(log.performed_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── ALLOCATE / REALLOCATE MODAL ───────────────────────────────────────── */}
      {actionModal && (
        <Modal
          title={actionModal.type === 'allocate'
            ? `Assign ${actionModal.asset.tag}`
            : `Reassign ${actionModal.asset.tag}`}
          onClose={() => { setActionModal(null); setConflictWarning(null); }}
        >
          <div className="space-y-4">
            {actionModal.type === 'reallocate' && actionModal.asset.allocated_to_email && (
              <p className="text-sm text-slate-500">
                Currently assigned to: <strong>{actionModal.asset.allocated_to_email}</strong>
              </p>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {actionModal.type === 'allocate' ? 'Assign to employee' : 'Reassign to employee'}
              </label>
              <EmployeePicker
                employees={employees}
                value={actionEmail}
                onChange={v => { setActionEmail(v); setConflictWarning(null); }}
              />
            </div>

            {/* Conflict warning */}
            {conflictWarning && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-amber-800">Laptop Already Assigned</p>
                    <p className="text-xs text-amber-700 mt-1">{conflictWarning.message}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConflictWarning(null)}
                    className="flex-1 text-xs px-3 py-2 rounded-lg font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 transition"
                  >Cancel</button>
                  <button
                    onClick={() => handleAllocate(true)}
                    className="flex-1 text-xs px-3 py-2 rounded-lg font-bold text-white bg-amber-600 hover:bg-amber-700 transition"
                  >Assign Anyway</button>
                </div>
              </div>
            )}

            {!conflictWarning && (
              <div className="flex gap-3">
                <button onClick={() => { setActionModal(null); setConflictWarning(null); }} className={BTN_GHOST}>Cancel</button>
                <button
                  onClick={() => actionModal.type === 'allocate' ? handleAllocate(false) : handleReallocate()}
                  disabled={!actionEmail}
                  className={BTN_PRIMARY + ' flex-1'}
                  style={{ backgroundColor: BRAND }}
                >
                  {actionModal.type === 'allocate' ? 'Assign' : 'Reassign'}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── EDIT ASSET MODAL ─────────────────────────────────────────────────── */}
      {editModal && (
        <Modal title={`Edit ${editModal.tag}`} onClose={() => setEditModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ownership</label>
                <select value={editForm.ownership} onChange={e => setEditForm(f => ({...f, ownership: e.target.value}))} className={INPUT}>
                  <option value="Rental">Rental</option>
                  <option value="SGPL">SGPL (Company Owned)</option>
                  <option value="BYOD">BYOD (Personal)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Model</label>
                <input type="text" value={editForm.model} onChange={e => setEditForm(f => ({...f, model: e.target.value}))} maxLength={50} className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Serial Number</label>
                <input type="text" value={editForm.serial_number} onChange={e => setEditForm(f => ({...f, serial_number: e.target.value}))} maxLength={30} className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Warranty</label>
                <select value={editForm.warranty} onChange={e => setEditForm(f => ({...f, warranty: e.target.value}))} className={INPUT}>
                  <option value="">— (not set)</option>
                  <option value="Under Warranty">Under Warranty</option>
                  <option value="Out of Warranty">Out of Warranty</option>
                  <option value="NA">N/A</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Location</label>
              <select
                value={editForm.locationCustom ? '__other__' : editForm.location}
                onChange={e => {
                  if (e.target.value === '__other__') {
                    setEditForm(f => ({...f, locationCustom: true, location: ''}));
                  } else {
                    setEditForm(f => ({...f, locationCustom: false, location: e.target.value}));
                  }
                }}
                className={INPUT}
              >
                <option value="">— (not set)</option>
                {locations.map(l => <option key={l.unique_location} value={l.unique_location}>{l.unique_location}</option>)}
                <option value="__other__">Other (type new)…</option>
              </select>
              {editForm.locationCustom && (
                <input
                  type="text" value={editForm.location}
                  onChange={e => setEditForm(f => ({...f, location: e.target.value}))}
                  placeholder="Type location name…"
                  className={INPUT + ' mt-2'}
                  autoFocus
                />
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditModal(null)} className={BTN_GHOST}>Cancel</button>
              <button
                onClick={handleEditAsset}
                disabled={editSaving}
                className={BTN_PRIMARY + ' flex-1'}
                style={{ backgroundColor: BRAND }}
              >{editSaving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── REVIEW MODAL ─────────────────────────────────────────────────────── */}
      {reviewModal && (
        <Modal
          title={reviewModal.status === 'approved' ? 'Approve Request' : 'Reject Request'}
          onClose={() => setReviewModal(null)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Note to employee (optional)</label>
              <textarea
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Will be delivered by Friday…"
                className={INPUT + ' resize-none'}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setReviewModal(null)} className={BTN_GHOST}>Cancel</button>
              <button
                onClick={handleReview}
                className={BTN_PRIMARY + ' flex-1'}
                style={{ backgroundColor: reviewModal.status === 'approved' ? BRAND : '#dc2626' }}
              >
                {reviewModal.status === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
