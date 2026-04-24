import { useEffect, useState } from 'react';
import { getAuthStatus } from '../authCache';

const BRAND = '#115948';
const AVATAR_COLORS = ['bg-violet-500','bg-blue-500','bg-sky-500','bg-teal-500','bg-emerald-600','bg-amber-500','bg-rose-500','bg-pink-500'];
const getInitials = n => n ? n.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase() : '?';
const getColor    = n => AVATAR_COLORS[(n?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

function EmployeeDrawer({ employee, isAdmin, onClose, onSaved, onDeleted }) {
  const [detail, setDetail]     = useState(null);
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState({});
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg]           = useState(null);

  useEffect(() => {
    if (!employee) return;
    setEditing(false); setMsg(null);
    // Seed immediately from card data so fields show right away
    const seed = {
      name:            employee.name            ?? '',
      email:           employee.email           ?? '',
      job_title:       employee.job_title       ?? '',
      department:      employee.department      ?? '',
      office_location: employee.office_location ?? '',
      phone:           '',
      personal_email:  '',
      manager_email:   '',
      start_date:      '',
      status:          'Active',
    };
    setDetail(seed);
    setForm(seed);
    // Then enrich with local DB extras (phone, personal_email, etc.)
    fetch(`/api/employees/by-email?email=${encodeURIComponent(employee.email)}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        const merged = { ...seed, ...Object.fromEntries(Object.entries(d).filter(([,v]) => v !== null && v !== '')) };
        setDetail(merged);
        setForm(merged);
      })
      .catch(() => {});
  }, [employee?.email]);

  const deleteEmployee = async () => {
    if (!confirm(`Remove ${detail?.name || employee.name} from the directory? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/employees/by-email?email=${encodeURIComponent(employee.email)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content },
      });
      if (res.ok) { onDeleted?.(employee.email); onClose(); }
      else setMsg({ type: 'err', text: 'Failed to delete employee.' });
    } catch { setMsg({ type: 'err', text: 'Network error.' }); }
    finally { setDeleting(false); }
  };

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      const res = await fetch(`/api/employees/by-email?email=${encodeURIComponent(employee.email)}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMsg({ type: 'ok', text: 'Saved successfully.' });
        setEditing(false);
        const updated = { ...detail, ...form };
        setDetail(updated);
        onSaved?.(updated);
      } else {
        const err = await res.json().catch(() => ({}));
        setMsg({ type: 'err', text: err.error || 'Failed to save.' });
      }
    } catch { setMsg({ type: 'err', text: 'Network error.' }); }
    finally { setSaving(false); }
  };

  if (!employee) return null;

  const d = detail ?? employee;
  const field = (label, key, type = 'text') => (
    <div key={key}>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      {editing ? (
        <input
          type={type}
          value={form[key] ?? ''}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': BRAND }}
        />
      ) : (
        <p className="text-slate-800 font-medium text-sm">{d[key] || <span className="text-slate-400">—</span>}</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${getColor(d.name)}`}>
            {getInitials(d.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900 truncate">{d.name || employee.name}</h2>
            <p className="text-sm text-slate-500 truncate">{d.job_title || employee.job_title || 'Employee'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5 flex-1">
          {msg && (
            <div className={`text-sm px-4 py-2 rounded-lg ${msg.type === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
              {msg.text}
            </div>
          )}

          {!detail ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BRAND, borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {field('Full Name',       'name')}
                {field('Job Title',       'job_title')}
                {field('Department',      'department')}
                {field('Office Location', 'office_location')}
                {field('Work Email',      'email')}
                {field('Personal Email',  'personal_email', 'email')}
                {field('Phone',           'phone', 'tel')}
                {field('Manager Email',   'manager_email', 'email')}
                {field('Start Date',      'start_date', 'date')}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${d.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {d.status || 'Active'}
                </span>
              </div>

              {/* Laptop / Device section */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Device</p>
                {d.laptop ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-800">{d.laptop.model || 'Laptop'}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        d.laptop.ownership === 'Rental' ? 'bg-emerald-50 text-emerald-700' :
                        d.laptop.ownership === 'SGPL'   ? 'bg-purple-50 text-purple-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>{d.laptop.ownership}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
                      <div><span className="text-slate-400">Tag:</span> <span className="font-mono font-semibold text-slate-700">{d.laptop.tag}</span></div>
                      {d.laptop.serial_number && <div><span className="text-slate-400">Serial:</span> {d.laptop.serial_number}</div>}
                      {d.laptop.location && <div><span className="text-slate-400">Location:</span> {d.laptop.location}</div>}
                      <div><span className="text-slate-400">Warranty:</span> {d.laptop.warranty || <span className="italic text-slate-300">null</span>}</div>
                      {d.laptop.assigned_on && <div><span className="text-slate-400">Since:</span> {new Date(d.laptop.assigned_on).toLocaleDateString()}</div>}
                    </div>
                  </div>
                ) : d.device_type === 'BYOD' ? (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                    <span className="text-xs font-bold text-blue-700">BYOD</span>
                    <span className="text-xs text-blue-600">{d.personal_device ? `— ${d.personal_device}` : '— Personal device'}</span>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No laptop assigned</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex gap-3">
            {d.email && (
              <a href={`mailto:${d.email}`}
                className="flex-1 text-center text-sm font-semibold py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                Email
              </a>
            )}
            {isAdmin && !editing && (
              <button onClick={() => setEditing(true)}
                className="flex-1 text-sm font-semibold py-2 rounded-xl text-white transition hover:opacity-90"
                style={{ backgroundColor: BRAND }}>
                Edit Details
              </button>
            )}
            {isAdmin && editing && (
              <>
                <button onClick={() => { setEditing(false); setForm(detail); setMsg(null); }}
                  className="flex-1 text-sm font-semibold py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button onClick={save} disabled={saving}
                  className="flex-1 text-sm font-semibold py-2 rounded-xl text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: BRAND }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </>
            )}
          </div>
          {isAdmin && !editing && (
            <button onClick={deleteEmployee} disabled={deleting}
              className="w-full text-sm font-semibold py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50">
              {deleting ? 'Removing…' : 'Remove Employee'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EmployeeDirectory({ config }) {
  const [employees, setEmployees]   = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [userRoles, setUserRoles]   = useState([]);
  const [userEmail, setUserEmail]   = useState('');

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
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch('/api/employees', { credentials: 'include' });
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch { setError('Failed to fetch employees'); setEmployees([]); }
    finally { setLoading(false); }
  };

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))].sort();
  const filtered = employees.filter(emp => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || [emp.name, emp.email, emp.job_title, emp.department, emp.group_name]
      .some(v => v?.toLowerCase().includes(q));
    return matchSearch && (!filterDept || emp.department === filterDept);
  });

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Employee Directory</h1>
          <p className="text-slate-500 text-sm mt-0.5">Find colleagues across all departments</p>
        </div>
        <button onClick={fetchEmployees} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50">
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input type="text" placeholder="Search by name, email, title or department…"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm" />
        </div>
        {departments.length > 0 && (
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
      </div>

      {!loading && !error && (
        <p className="text-xs text-slate-400 font-medium mb-3">
          Showing {filtered.length} of {employees.length} employee{employees.length !== 1 ? 's' : ''}
          {isAdmin && <span className="ml-2 text-emerald-600">• Admin mode — click any card to view & edit</span>}
        </p>
      )}

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BRAND, borderTopColor: 'transparent' }} />
              <span className="text-slate-500 font-medium">Loading directory…</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <div className="text-center space-y-3">
              <p className="text-slate-600 font-medium">{error}</p>
              <button onClick={fetchEmployees} className="text-emerald-700 font-semibold hover:underline text-sm">Try again</button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <p className="text-slate-500 font-medium">No employees found.</p>
              {(searchTerm || filterDept) && (
                <button onClick={() => { setSearchTerm(''); setFilterDept(''); }} className="text-emerald-700 text-sm font-semibold hover:underline mt-2">Clear filters</button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((emp, i) => (
              <div key={emp.id || i}
                onClick={() => setSelected(emp)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col cursor-pointer group">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${getColor(emp.name)}`}>
                    {getInitials(emp.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate group-hover:text-emerald-700 transition-colors">{emp.name}</p>
                    {emp.job_title && <p className="text-xs text-slate-500 truncate">{emp.job_title}</p>}
                  </div>
                </div>
                <div className="space-y-1.5 flex-1">
                  {emp.department && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="truncate">{emp.department}</span>
                    </div>
                  )}
                  {emp.office_location && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="truncate">{emp.office_location}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Click to view</span>
                  {isAdmin && <span className="text-xs font-semibold text-emerald-600">+ Edit</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EmployeeDrawer
        employee={selected}
        isAdmin={isAdmin}
        onClose={() => setSelected(null)}
        onSaved={updated => {
          setEmployees(prev => prev.map(e => e.email === updated.email ? { ...e, ...updated } : e));
        }}
        onDeleted={email => {
          setEmployees(prev => prev.filter(e => e.email !== email));
          setSelected(null);
        }}
      />
    </div>
  );
}
