import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuthStatus } from '../authCache';

const BRAND = '#115948';

// Generic link icon with coloured background from DB or fallback
function LinkTile({ link }) {
  const bg = link.background_color || BRAND;
  const letter = (link.name || '?')[0].toUpperCase();

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="group flex-1 min-w-[160px] flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      {link.logo ? (
        <img
          src={link.logo}
          alt={link.name}
          className="w-10 h-10 object-contain mb-3"
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
      ) : null}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-black mb-3"
        style={{ backgroundColor: bg, display: link.logo ? 'none' : 'flex' }}
      >
        {letter}
      </div>
      <span className="text-sm font-bold text-slate-700 text-center">{link.name}</span>
    </a>
  );
}

export default function Dashboard({ config }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [quickLinks, setQuickLinks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date(); d.setHours(0,0,0,0); return new Date(d);
  });

  useEffect(() => {
    fetchProfile();
    fetchSchedule();
    fetchAnnouncements();
    fetchQuickLinks();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getAuthStatus();
      if (data.isAuthenticated && data.user?.profile) setProfile(data.user.profile);
    } catch {}
  };

  const fetchQuickLinks = async () => {
    try {
      const res = await axios.get('/api/links');
      if (Array.isArray(res.data)) setQuickLinks(res.data);
    } catch {}
  };

  const fetchSchedule = async () => {
    setScheduleLoading(true);
    try {
      const res = await axios.get('/api/auth/calendar');
      const raw = res.data?.events ?? [];
      const parsed = raw.map(ev => ({
        ...ev,
        subject: ev.subject,
        start: new Date(ev.start?.dateTime || ev.start),
        end:   new Date(ev.end?.dateTime   || ev.end),
      }));
      setEvents(parsed);
    } catch {}
    finally { setScheduleLoading(false); }
  };

  const fetchAnnouncements = async () => {
    setIsRefreshing(true);
    try {
      const res = await axios.get('/api/announcements/latest');
      setAnnouncements(Array.isArray(res.data) ? res.data : []);
    } catch {}
    finally { setIsRefreshing(false); }
  };

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  };

  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const thisWeekEvents = events.filter(ev => ev.start >= currentWeekStart && ev.start < weekEnd);

  return (
    <div className="p-8 h-full flex flex-col space-y-8 overflow-y-auto">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          {greeting()}, {profile?.displayName?.split(' ')[0] || 'Team'} 👋
        </h1>
        <p className="text-slate-500 font-medium mt-1 text-base">Here's your overview for today.</p>
      </div>

      {/* Quick Links — from DB, no hardcoded logos */}
      {quickLinks.length > 0 && (
        <section className="flex flex-wrap gap-4">
          {quickLinks.map((link, i) => <LinkTile key={i} link={link} />)}
        </section>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">

        {/* Schedule */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-7 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: BRAND }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              My Schedule
            </h3>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-0.5">
              <button onClick={() => setCurrentWeekStart(new Date(new Date().setHours(0,0,0,0)))}
                className="px-3 py-1.5 text-xs font-bold rounded-lg hover:bg-white text-slate-700 transition-all">Today</button>
              <button onClick={() => { const d = new Date(currentWeekStart); d.setDate(d.getDate()-7); setCurrentWeekStart(d); }}
                className="px-3 py-1.5 text-xs font-bold hover:bg-white text-slate-500 rounded-lg transition-all">‹ Prev</button>
              <button onClick={() => { const d = new Date(currentWeekStart); d.setDate(d.getDate()+7); setCurrentWeekStart(d); }}
                className="px-3 py-1.5 text-xs font-bold hover:bg-white text-slate-500 rounded-lg transition-all">Next ›</button>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">
            {currentWeekStart.toLocaleDateString()} — {weekEnd.toLocaleDateString()}
          </p>

          {scheduleLoading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BRAND, borderTopColor: 'transparent' }} />
            </div>
          ) : thisWeekEvents.length === 0 ? (
            <div className="h-40 flex items-center justify-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm font-medium">No calendar events this week.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {thisWeekEvents.map((ev, i) => (
                <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white"
                    style={{ backgroundColor: BRAND }}>
                    <span className="text-[10px] font-bold uppercase">{ev.start.toLocaleString('default',{month:'short'})}</span>
                    <span className="text-xl font-black leading-none">{ev.start.getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{ev.subject}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {ev.start.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} – {ev.end.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Announcements */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-7 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-extrabold text-slate-900">Updates</h3>
            <button onClick={fetchAnnouncements} disabled={isRefreshing}
              className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all disabled:opacity-50">
              <svg className={`w-4 h-4 text-slate-400 ${isRefreshing?'animate-spin':''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {announcements.length === 0 ? (
              <div className="h-40 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm font-medium">No announcements yet.</p>
              </div>
            ) : (
              announcements.map((ann, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer"
                  onClick={() => navigate('/announcements')}>
                  <div className="flex items-start gap-2">
                    {ann.is_pinned && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-md text-white flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: BRAND }}>Pinned</span>
                    )}
                    <p className="font-bold text-slate-900 text-sm">{ann.title}</p>
                  </div>
                  {/* ann.body is the DB field — ann.content does not exist */}
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{ann.body}</p>
                  {ann.created_at && (
                    <p className="text-[10px] font-semibold text-slate-400 mt-2">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          <button onClick={() => navigate('/announcements')}
            className="mt-5 w-full py-2.5 rounded-xl font-bold text-sm text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: BRAND }}>
            View All
          </button>
        </div>
      </div>
    </div>
  );
}
