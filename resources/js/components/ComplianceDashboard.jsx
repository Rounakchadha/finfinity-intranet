import { useState, useEffect } from 'react';

const BRAND = '#115948';

function StatCard({ label, value, sub, color = BRAND }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function AckBar({ count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const color = pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold w-12 text-right" style={{ color }}>{pct}%</span>
      <span className="text-xs text-slate-400 w-16 text-right">{count} / {total}</span>
    </div>
  );
}

export default function ComplianceDashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [acks, setAcks] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // selected announcement for detail

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [ar, er] = await Promise.all([
        fetch('/api/announcements', { credentials: 'include' }),
        fetch('/api/employees',     { credentials: 'include' }),
      ]);
      const annData = await ar.json();
      const empData = await er.json();
      const anns = Array.isArray(annData) ? annData : (annData.announcements ?? []);
      setAnnouncements(anns);
      setEmployeeCount(Array.isArray(empData) ? empData.length : 0);

      // Fetch acks for each announcement in parallel
      const ackResults = await Promise.all(
        anns.map(a =>
          fetch(`/api/announcements/${a.id}/acknowledgements`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : [])
            .catch(() => [])
        )
      );
      setAcks(ackResults);
    } catch {}
    finally { setLoading(false); }
  };

  const totalAnnouncements = announcements.length;
  const fullyAcknowledged  = announcements.filter((_, i) => {
    const count = Array.isArray(acks[i]) ? acks[i].length : 0;
    return employeeCount > 0 && count >= employeeCount;
  }).length;
  const avgAckRate = employeeCount > 0 && totalAnnouncements > 0
    ? Math.round(announcements.reduce((sum, _, i) => {
        const count = Array.isArray(acks[i]) ? acks[i].length : 0;
        return sum + count / employeeCount;
      }, 0) / totalAnnouncements * 100)
    : 0;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BRAND, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 h-full overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Compliance Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Track announcement acknowledgments and policy acceptance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Announcements"       value={totalAnnouncements} />
        <StatCard label="Avg Acknowledgment"  value={`${avgAckRate}%`}   color={avgAckRate >= 80 ? '#16a34a' : '#d97706'} />
        <StatCard label="Fully Acknowledged"  value={fullyAcknowledged}  color="#16a34a" sub="100% of employees" />
        <StatCard label="Total Employees"     value={employeeCount}      color="#2563eb" />
      </div>

      {/* Acknowledgment rates per announcement */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-extrabold text-slate-900">Acknowledgment by Announcement</h2>
        </div>
        {announcements.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No announcements yet.</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {announcements.map((ann, i) => {
              const ackList = Array.isArray(acks[i]) ? acks[i] : [];
              const count   = ackList.length;
              return (
                <div
                  key={ann.id}
                  className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelected(selected?.id === ann.id ? null : { ...ann, ackList })}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{ann.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Posted by {ann.posted_by_name} · {new Date(ann.created_at).toLocaleDateString()}
                        {ann.is_pinned && <span className="ml-2 text-amber-600 font-bold">Pinned</span>}
                      </p>
                    </div>
                    <svg className={`w-4 h-4 text-slate-300 flex-shrink-0 transition-transform mt-1 ${selected?.id === ann.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  <AckBar count={count} total={employeeCount} />

                  {/* Expanded ack list */}
                  {selected?.id === ann.id && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      {ackList.length === 0 ? (
                        <p className="text-xs text-slate-400">No acknowledgments yet.</p>
                      ) : (
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {ackList.map(a => (
                            <div key={a.id} className="flex items-center justify-between text-xs">
                              <span className="text-slate-700 font-medium">{a.acknowledged_by_name}</span>
                              <span className="text-slate-400">{a.acknowledged_by_email} · {new Date(a.acknowledged_at).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center">
        Acknowledgment rate is based on {employeeCount} active employees in the directory.
      </p>
    </div>
  );
}
