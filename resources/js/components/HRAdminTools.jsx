import { useState, useEffect } from 'react';

const BRAND = '#115948';

const TABS = [
  { id: 'overview',     label: 'Overview' },
  { id: 'jobs',         label: 'Jobs' },
  { id: 'candidates',   label: 'Candidates' },
  { id: 'create-job',   label: '1. Create Job' },
  { id: 'add-candidate',label: '2. Add Candidate' },
  { id: 'assign',       label: '3. Assign to Job' },
  { id: 'approve',      label: '4. Approve' },
  { id: 'interview',    label: '5. Interview' },
  { id: 'offer',        label: '6. Offer' },
  { id: 'onboard',      label: '7. Onboard' },
  { id: 'resignation',  label: '8. Resign' },
];

const INPUT   = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all';
const SELECT  = INPUT;
const TEXTAREA = INPUT + ' resize-none';
const BTN_PRIMARY = 'px-4 py-2.5 text-sm font-bold text-white rounded-xl transition hover:opacity-90 disabled:opacity-50';
const BTN_GHOST   = 'px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition';

function StatCard({ label, value, color = BRAND }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black" style={{ color }}>{value}</p>
    </div>
  );
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
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-2xl">
      <h2 className="text-base font-extrabold text-slate-900 mb-5">{title}</h2>
      {children}
    </div>
  );
}

export default function HRAdminTools() {
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Data
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [availableCandidates, setAvailableCandidates] = useState([]);
  const [forApproval, setForApproval] = useState([]);
  const [verifiedCandidates, setVerifiedCandidates] = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]);

  // Forms
  const [jobForm, setJobForm] = useState({
    job_title: '', department: '', location: '', hiring_manager: '',
    job_description: '', experience_requirements: '', education_requirements: '',
    number_of_openings: 1, salary_min: '', salary_max: '',
  });
  const [candidateForm, setCandidateForm] = useState({
    name: '', email: '', phone: '', source_id: '', skills: [], notes: '', resume: null,
  });
  const [assignForm, setAssignForm] = useState({ candidate_ids: [], job_id: '', assignment_status: 'Applied', email_content: '' });
  const [interviewForm, setInterviewForm] = useState({
    candidate_id: '', job_id: '', interviewer_emails: [''], interview_datetime: '',
    mode: 'Video', meeting_link_or_location: '', notes: '',
  });
  const [offerForm, setOfferForm] = useState({ candidate_id: '', job_id: '', subject_line: '', email_content: '', offer_document: null });
  const [onboardForm, setOnboardForm] = useState({ candidate_id: '', job_id: '', start_date: '', manager_email: '' });
  const [resignForm, setResignForm] = useState({ employee_ids: [], last_working_day: '', resignation_reason: '' });

  const csrf = () => document.querySelector('meta[name="csrf-token"]')?.content;
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  useEffect(() => { loadBase(); }, []);
  useEffect(() => {
    if (tab === 'assign')      loadAvailableCandidates();
    if (tab === 'approve')     loadForApproval();
    if (tab === 'interview' || tab === 'offer' || tab === 'onboard') loadVerifiedCandidates();
    if (tab === 'resignation') loadActiveEmployees();
  }, [tab]);

  const loadBase = async () => {
    try {
      const [jr, cr] = await Promise.all([
        fetch('/api/hr/jobs',       { credentials: 'include' }),
        fetch('/api/hr/candidates', { credentials: 'include' }),
      ]);
      if (jr.ok) setJobs(await jr.json());
      if (cr.ok) setCandidates(await cr.json());
    } catch {}
  };

  const loadAvailableCandidates = async () => {
    try { const r = await fetch('/api/hr/available-candidates', { credentials: 'include' }); if (r.ok) setAvailableCandidates(await r.json()); } catch {}
  };
  const loadForApproval = async () => {
    try { const r = await fetch('/api/hr/candidates-for-approval', { credentials: 'include' }); if (r.ok) setForApproval((await r.json()).map(c => ({...c, selected: false}))); } catch {}
  };
  const loadVerifiedCandidates = async () => {
    try { const r = await fetch('/api/hr/verified-candidates', { credentials: 'include' }); if (r.ok) setVerifiedCandidates(await r.json()); } catch {}
  };
  const loadActiveEmployees = async () => {
    try { const r = await fetch('/api/hr/active-employees', { credentials: 'include' }); if (r.ok) setActiveEmployees((await r.json()).map(e => ({...e, selected: false}))); } catch {}
  };

  const post = async (url, body, isForm = false) => {
    const opts = { method: 'POST', credentials: 'include' };
    if (isForm) { opts.body = body; }
    else { opts.headers = { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() }; opts.body = JSON.stringify(body); }
    if (!isForm) opts.headers['X-CSRF-TOKEN'] = csrf();
    return fetch(url, opts);
  };

  // 1. Create Job
  const handleCreateJob = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const r = await post('/api/hr/jobs', jobForm);
      if (r.ok) {
        showToast('Job created');
        setJobForm({ job_title: '', department: '', location: '', hiring_manager: '', job_description: '', experience_requirements: '', education_requirements: '', number_of_openings: 1, salary_min: '', salary_max: '' });
        loadBase();
      } else { const d = await r.json(); showToast(d.message || 'Failed', 'error'); }
    } catch { showToast('Error', 'error'); }
    setLoading(false);
  };

  // 2. Add Candidate
  const handleAddCandidate = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(candidateForm).forEach(([k, v]) => {
        if (k === 'skills') v.forEach((s, i) => fd.append(`skills[${i}]`, s));
        else if (k === 'resume' && v) fd.append(k, v);
        else fd.append(k, v ?? '');
      });
      fd.append('X-CSRF-TOKEN', csrf() ?? '');
      const r = await fetch('/api/hr/candidates', { method: 'POST', credentials: 'include', body: fd });
      if (r.ok) {
        showToast('Candidate added');
        setCandidateForm({ name: '', email: '', phone: '', source_id: '', skills: [], notes: '', resume: null });
        loadBase();
      } else { const d = await r.json(); showToast(d.message || 'Failed', 'error'); }
    } catch { showToast('Error', 'error'); }
    setLoading(false);
  };

  // 3. Assign
  const handleAssign = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const r = await post('/api/hr/assign-to-job', assignForm);
      if (r.ok) { const d = await r.json(); showToast(`${d.assigned_count} assigned`); setAssignForm({ candidate_ids: [], job_id: '', assignment_status: 'Applied', email_content: '' }); }
      else { const d = await r.json(); showToast(d.message || 'Failed', 'error'); }
    } catch { showToast('Error', 'error'); }
    setLoading(false);
  };

  // 4. Approve
  const handleApprove = async () => {
    setLoading(true);
    const selected = forApproval.filter(c => c.selected).map(c => c.id);
    if (!selected.length) { showToast('Select candidates first', 'error'); setLoading(false); return; }
    try {
      const r = await post('/api/hr/approve-candidate', { candidate_job_ids: selected });
      if (r.ok) { const d = await r.json(); showToast(`${d.verified_count} approved`); loadForApproval(); }
      else { const d = await r.json(); showToast(d.message || 'Failed', 'error'); }
    } catch { showToast('Error', 'error'); }
    setLoading(false);
  };

  // 5. Interview
  const handleInterview = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const r = await post('/api/hr/schedule-interview', interviewForm);
      if (r.ok) { showToast('Interview scheduled'); setInterviewForm({ candidate_id: '', job_id: '', interviewer_emails: [''], interview_datetime: '', mode: 'Video', meeting_link_or_location: '', notes: '' }); }
      else { const d = await r.json(); showToast(d.message || 'Failed', 'error'); }
    } catch { showToast('Error', 'error'); }
    setLoading(false);
  };

  // 6. Offer
  const handleOffer = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(offerForm).forEach(([k, v]) => { if (k === 'offer_document' && v) fd.append(k, v); else fd.append(k, v ?? ''); });
      const r = await fetch('/api/hr/send-offer', { method: 'POST', credentials: 'include', body: fd });
      if (r.ok) { showToast('Offer sent'); setOfferForm({ candidate_id: '', job_id: '', subject_line: '', email_content: '', offer_document: null }); }
      else { const d = await r.json(); showToast(d.message || 'Failed', 'error'); }
    } catch { showToast('Error', 'error'); }
    setLoading(false);
  };

  // 7. Onboard
  const handleOnboard = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const r = await post('/api/hr/start-onboarding', onboardForm);
      if (r.ok) { const d = await r.json(); showToast(`Onboarding started · ${d.employee_email}`); setOnboardForm({ candidate_id: '', job_id: '', start_date: '', manager_email: '' }); }
      else { const d = await r.json(); showToast(d.message || 'Failed', 'error'); }
    } catch { showToast('Error', 'error'); }
    setLoading(false);
  };

  // 8. Resign
  const handleResign = async (e) => {
    e.preventDefault(); setLoading(true);
    const selected = activeEmployees.filter(e => e.selected).map(e => e.id);
    if (!selected.length) { showToast('Select employees first', 'error'); setLoading(false); return; }
    try {
      const r = await post('/api/hr/mark-resignation', { ...resignForm, employee_ids: selected });
      if (r.ok) { const d = await r.json(); showToast(`${d.resigned_count} marked resigned`); loadActiveEmployees(); }
      else { const d = await r.json(); showToast(d.message || 'Failed', 'error'); }
    } catch { showToast('Error', 'error'); }
    setLoading(false);
  };

  const PIPELINE_TABS = ['create-job','add-candidate','assign','approve','interview','offer','onboard','resignation'];
  const mainTabs  = TABS.filter(t => !PIPELINE_TABS.includes(t.id));
  const pipeTabs  = TABS.filter(t => PIPELINE_TABS.includes(t.id));

  return (
    <div className="p-8 space-y-6 h-full overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">HR Admin</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage jobs, candidates, and the full hiring pipeline</p>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Tab groups */}
      <div className="space-y-2">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {mainTabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          <span className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Pipeline:</span>
          {pipeTabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Open Jobs"         value={jobs.filter(j => j.status === 'Open').length} />
          <StatCard label="Total Candidates"  value={candidates.length} color="#2563eb" />
          <StatCard label="Active Employees"  value={activeEmployees.length || '—'} color="#16a34a" />
          <StatCard label="Total Openings"    value={jobs.reduce((s, j) => s + (j.number_of_openings || 0), 0)} color="#d97706" />
        </div>
      )}

      {/* Jobs list */}
      {tab === 'jobs' && (
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-16 text-center text-slate-400 text-sm">
              No jobs yet. Use "1. Create Job" to add one.
            </div>
          ) : jobs.map(j => (
            <div key={j.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{j.job_title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{j.department} · {j.location} · {j.number_of_openings} opening{j.number_of_openings !== 1 ? 's' : ''}</p>
                  {j.hiring_manager && <p className="text-xs text-slate-400 mt-0.5">Manager: {j.hiring_manager}</p>}
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${j.status === 'Open' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{j.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidates list */}
      {tab === 'candidates' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {candidates.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">No candidates yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Name','Email','Phone','Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {candidates.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{c.name}</td>
                    <td className="px-4 py-3 text-slate-500">{c.email}</td>
                    <td className="px-4 py-3 text-slate-500">{c.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{c.current_status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 1. Create Job */}
      {tab === 'create-job' && (
        <Section title="Create New Job Opening">
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Job Title *</label>
                <input value={jobForm.job_title} onChange={e => setJobForm({...jobForm, job_title: e.target.value})} required className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Department *</label>
                <input value={jobForm.department} onChange={e => setJobForm({...jobForm, department: e.target.value})} required className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Location *</label>
                <input value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} required className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Hiring Manager *</label>
                <input value={jobForm.hiring_manager} onChange={e => setJobForm({...jobForm, hiring_manager: e.target.value})} required className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Openings</label>
                <input type="number" min="1" value={jobForm.number_of_openings} onChange={e => setJobForm({...jobForm, number_of_openings: parseInt(e.target.value)})} className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Salary Range</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={jobForm.salary_min} onChange={e => setJobForm({...jobForm, salary_min: e.target.value})} className={INPUT} />
                  <input type="number" placeholder="Max" value={jobForm.salary_max} onChange={e => setJobForm({...jobForm, salary_max: e.target.value})} className={INPUT} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Job Description *</label>
              <textarea rows={4} value={jobForm.job_description} onChange={e => setJobForm({...jobForm, job_description: e.target.value})} required className={TEXTAREA} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Experience Requirements</label>
                <textarea rows={2} value={jobForm.experience_requirements} onChange={e => setJobForm({...jobForm, experience_requirements: e.target.value})} className={TEXTAREA} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Education Requirements</label>
                <textarea rows={2} value={jobForm.education_requirements} onChange={e => setJobForm({...jobForm, education_requirements: e.target.value})} className={TEXTAREA} />
              </div>
            </div>
            <button type="submit" disabled={loading} className={BTN_PRIMARY + ' w-full'} style={{ backgroundColor: BRAND }}>
              {loading ? 'Creating…' : 'Create Job Opening'}
            </button>
          </form>
        </Section>
      )}

      {/* 2. Add Candidate */}
      {tab === 'add-candidate' && (
        <Section title="Add New Candidate">
          <form onSubmit={handleAddCandidate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                <input value={candidateForm.name} onChange={e => setCandidateForm({...candidateForm, name: e.target.value})} required className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email *</label>
                <input type="email" value={candidateForm.email} onChange={e => setCandidateForm({...candidateForm, email: e.target.value})} required className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone</label>
                <input value={candidateForm.phone} onChange={e => setCandidateForm({...candidateForm, phone: e.target.value})} className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Source</label>
                <input type="text" value={candidateForm.source_id} onChange={e => setCandidateForm({...candidateForm, source_id: e.target.value})} placeholder="e.g. LinkedIn, Referral, Walk-in" className={INPUT} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Notes</label>
              <textarea rows={3} value={candidateForm.notes} onChange={e => setCandidateForm({...candidateForm, notes: e.target.value})} className={TEXTAREA} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Resume (PDF/DOC)</label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={e => setCandidateForm({...candidateForm, resume: e.target.files[0] || null})} className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:text-white file:cursor-pointer" style={{ '--file-bg': BRAND }} />
            </div>
            <button type="submit" disabled={loading} className={BTN_PRIMARY + ' w-full'} style={{ backgroundColor: BRAND }}>
              {loading ? 'Adding…' : 'Add Candidate'}
            </button>
          </form>
        </Section>
      )}

      {/* 3. Assign */}
      {tab === 'assign' && (
        <Section title="Assign Candidates to a Job">
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Job *</label>
              <input type="text" value={assignForm.job_id} onChange={e => setAssignForm({...assignForm, job_id: e.target.value})} required placeholder="Job title or ID" className={INPUT} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Candidates *</label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                {availableCandidates.length === 0
                  ? <p className="text-xs text-slate-400">No available candidates.</p>
                  : availableCandidates.map(c => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={assignForm.candidate_ids.includes(c.id)}
                        onChange={e => setAssignForm({...assignForm, candidate_ids: e.target.checked ? [...assignForm.candidate_ids, c.id] : assignForm.candidate_ids.filter(id => id !== c.id)})} />
                      <span className="text-sm text-slate-700">{c.name} <span className="text-slate-400">({c.email})</span></span>
                    </label>
                  ))
                }
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
              <input type="text" value={assignForm.assignment_status} onChange={e => setAssignForm({...assignForm, assignment_status: e.target.value})} placeholder="e.g. Applied, Screening, Interview" className={INPUT} />
            </div>
            <button type="submit" disabled={loading || !assignForm.job_id || !assignForm.candidate_ids.length} className={BTN_PRIMARY + ' w-full'} style={{ backgroundColor: BRAND }}>
              {loading ? 'Assigning…' : 'Assign to Job'}
            </button>
          </form>
        </Section>
      )}

      {/* 4. Approve */}
      {tab === 'approve' && (
        <Section title="Approve Candidates">
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-64 overflow-y-auto space-y-2">
              {forApproval.length === 0
                ? <p className="text-xs text-slate-400">No candidates pending approval.</p>
                : forApproval.map((c, i) => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={c.selected}
                      onChange={() => setForApproval(forApproval.map((x, j) => j === i ? {...x, selected: !x.selected} : x))} />
                    <span className="text-sm text-slate-700">{c.candidate_name} <span className="text-slate-400">— {c.job_title}</span></span>
                  </label>
                ))
              }
            </div>
            <button onClick={handleApprove} disabled={loading || !forApproval.some(c => c.selected)} className={BTN_PRIMARY + ' w-full'} style={{ backgroundColor: BRAND }}>
              {loading ? 'Approving…' : 'Approve Selected'}
            </button>
          </div>
        </Section>
      )}

      {/* 5. Interview */}
      {tab === 'interview' && (
        <Section title="Schedule Interview">
          <form onSubmit={handleInterview} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Candidate *</label>
                <input type="text" value={interviewForm.candidate_id} onChange={e => setInterviewForm({...interviewForm, candidate_id: e.target.value})} required placeholder="Candidate name or ID" className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Job *</label>
                <input type="text" value={interviewForm.job_id} onChange={e => setInterviewForm({...interviewForm, job_id: e.target.value})} required placeholder="Job title or ID" className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Date & Time *</label>
                <input type="datetime-local" value={interviewForm.interview_datetime} onChange={e => setInterviewForm({...interviewForm, interview_datetime: e.target.value})} required className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mode</label>
                <input type="text" value={interviewForm.mode} onChange={e => setInterviewForm({...interviewForm, mode: e.target.value})} placeholder="e.g. Video, In-Person, Phone" className={INPUT} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Interviewer Email(s)</label>
              {interviewForm.interviewer_emails.map((email, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input type="email" value={email} onChange={e => setInterviewForm({...interviewForm, interviewer_emails: interviewForm.interviewer_emails.map((x, j) => j === i ? e.target.value : x)})} className={INPUT} placeholder="interviewer@company.com" />
                  {i > 0 && <button type="button" onClick={() => setInterviewForm({...interviewForm, interviewer_emails: interviewForm.interviewer_emails.filter((_, j) => j !== i)})} className="text-slate-400 hover:text-red-500 text-lg">×</button>}
                </div>
              ))}
              <button type="button" onClick={() => setInterviewForm({...interviewForm, interviewer_emails: [...interviewForm.interviewer_emails, '']})} className="text-xs font-bold text-emerald-700 hover:underline">+ Add interviewer</button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Meeting link / Location</label>
              <input value={interviewForm.meeting_link_or_location} onChange={e => setInterviewForm({...interviewForm, meeting_link_or_location: e.target.value})} className={INPUT} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Notes</label>
              <textarea rows={2} value={interviewForm.notes} onChange={e => setInterviewForm({...interviewForm, notes: e.target.value})} className={TEXTAREA} />
            </div>
            <button type="submit" disabled={loading} className={BTN_PRIMARY + ' w-full'} style={{ backgroundColor: BRAND }}>
              {loading ? 'Scheduling…' : 'Schedule Interview'}
            </button>
          </form>
        </Section>
      )}

      {/* 6. Offer */}
      {tab === 'offer' && (
        <Section title="Send Offer Letter">
          <form onSubmit={handleOffer} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Candidate *</label>
                <input type="text" value={offerForm.candidate_id} onChange={e => setOfferForm({...offerForm, candidate_id: e.target.value})} required placeholder="Candidate name or ID" className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Job *</label>
                <input type="text" value={offerForm.job_id} onChange={e => setOfferForm({...offerForm, job_id: e.target.value})} required placeholder="Job title or ID" className={INPUT} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject Line *</label>
              <input value={offerForm.subject_line} onChange={e => setOfferForm({...offerForm, subject_line: e.target.value})} required className={INPUT} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Content *</label>
              <textarea rows={5} value={offerForm.email_content} onChange={e => setOfferForm({...offerForm, email_content: e.target.value})} required className={TEXTAREA} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Offer Document (PDF)</label>
              <input type="file" accept=".pdf" onChange={e => setOfferForm({...offerForm, offer_document: e.target.files[0] || null})} className="w-full text-sm text-slate-600" />
            </div>
            <button type="submit" disabled={loading} className={BTN_PRIMARY + ' w-full'} style={{ backgroundColor: BRAND }}>
              {loading ? 'Sending…' : 'Send Offer'}
            </button>
          </form>
        </Section>
      )}

      {/* 7. Onboard */}
      {tab === 'onboard' && (
        <Section title="Start Onboarding">
          <form onSubmit={handleOnboard} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Candidate *</label>
                <input type="text" value={onboardForm.candidate_id} onChange={e => setOnboardForm({...onboardForm, candidate_id: e.target.value})} required placeholder="Candidate name or ID" className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Job *</label>
                <input type="text" value={onboardForm.job_id} onChange={e => setOnboardForm({...onboardForm, job_id: e.target.value})} required placeholder="Job title or ID" className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Start Date *</label>
                <input type="date" value={onboardForm.start_date} onChange={e => setOnboardForm({...onboardForm, start_date: e.target.value})} required className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Manager Email *</label>
                <input type="email" value={onboardForm.manager_email} onChange={e => setOnboardForm({...onboardForm, manager_email: e.target.value})} required className={INPUT} />
              </div>
            </div>
            <button type="submit" disabled={loading} className={BTN_PRIMARY + ' w-full'} style={{ backgroundColor: BRAND }}>
              {loading ? 'Starting…' : 'Start Onboarding'}
            </button>
          </form>
        </Section>
      )}

      {/* 8. Resignation */}
      {tab === 'resignation' && (
        <Section title="Mark Resignation">
          <form onSubmit={handleResign} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Employees *</label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                {activeEmployees.length === 0
                  ? <p className="text-xs text-slate-400">No active employees found.</p>
                  : activeEmployees.map((emp, i) => (
                    <label key={emp.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={emp.selected}
                        onChange={() => setActiveEmployees(activeEmployees.map((x, j) => j === i ? {...x, selected: !x.selected} : x))} />
                      <span className="text-sm text-slate-700">{emp.name} <span className="text-slate-400">({emp.email})</span></span>
                    </label>
                  ))
                }
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Last Working Day *</label>
                <input type="date" value={resignForm.last_working_day} onChange={e => setResignForm({...resignForm, last_working_day: e.target.value})} required className={INPUT} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Reason</label>
                <input value={resignForm.resignation_reason} onChange={e => setResignForm({...resignForm, resignation_reason: e.target.value})} className={INPUT} />
              </div>
            </div>
            <button type="submit" disabled={loading || !activeEmployees.some(e => e.selected)} className={BTN_PRIMARY + ' w-full'} style={{ backgroundColor: '#dc2626' }}>
              {loading ? 'Processing…' : 'Mark as Resigned'}
            </button>
          </form>
        </Section>
      )}
    </div>
  );
}
