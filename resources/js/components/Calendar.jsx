import { useEffect, useRef, useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format, parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay, locales,
});

const BRAND = '#115948';

// Centered overlay modal
function Modal({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// Quick-add modal — just a title input + Save/Cancel, like Google Calendar
function QuickAddModal({ slot, onAdd, onClose }) {
  const [title, setTitle] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleKey = e => {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') onClose();
  };

  const submit = () => {
    if (!title.trim()) return;
    const start = slot.start;
    const end   = slot.end || new Date(slot.start.getTime() + 60 * 60 * 1000);
    onAdd({ title: title.trim(), start, end, allDay: slot.allDay ?? false });
    onClose();
  };

  const label = slot.allDay
    ? slot.start.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
    : slot.start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) +
      ' · ' + slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden">
        {/* Coloured top bar */}
        <div className="h-2" style={{ backgroundColor: BRAND }} />
        <div className="p-5">
          <p className="text-xs font-semibold text-slate-400 mb-3">{label}</p>
          <input
            ref={inputRef}
            placeholder="Add title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={handleKey}
            className="w-full text-lg font-semibold text-slate-800 border-b-2 border-slate-200 focus:border-emerald-600 outline-none pb-1 mb-5 bg-transparent placeholder:font-normal placeholder:text-slate-300"
          />
          <div className="flex items-center justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition">Cancel</button>
            <button
              onClick={submit}
              disabled={!title.trim()}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-40 transition hover:opacity-90"
              style={{ backgroundColor: BRAND }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// Event detail modal
function EventModal({ event, onClose, onDelete }) {
  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden">
        <div className="h-2" style={{ backgroundColor: event.source === 'local' ? BRAND : '#3b82f6' }} />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-base font-bold text-slate-800 leading-snug">{event.title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 mt-0.5 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {event.allDay
                  ? event.start.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
                  : <>
                      {event.start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' · '}
                      {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' – '}
                      {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </>
                }
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{event.location}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${event.source === 'local' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
              {event.source === 'local' ? 'Local event' : 'Outlook'}
            </span>
            {event.source === 'local' && (
              <button onClick={() => { onDelete(event.id); onClose(); }}
                className="text-xs font-semibold text-red-500 hover:text-red-700 transition">
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function Calendar() {
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [syncError, setSyncError]   = useState(null);
  const [quickSlot, setQuickSlot]   = useState(null);  // slot clicked → QuickAddModal
  const [selectedEv, setSelectedEv] = useState(null);  // event clicked → EventModal

  const parseEvents = raw => raw.map(ev => ({
    id:       ev.id || Math.random(),
    title:    ev.subject || ev.title || 'No Title',
    start:    new Date(ev.start?.dateTime || ev.start),
    end:      new Date(ev.end?.dateTime   || ev.end),
    allDay:   ev.isAllDay || ev.allDay || false,
    location: ev.location?.displayName || ev.location || '',
    source:   ev.source || 'outlook',
  }));

  const loadFromSession = async () => {
    setLoading(true); setSyncError(null);
    try {
      // Load Outlook events from session + local DB events in parallel
      const [sessionRes, localRes] = await Promise.all([
        fetch('/api/auth/calendar', { credentials: 'include' }),
        fetch('/api/calendar/events', { credentials: 'include' }),
      ]);
      const sessionData = await sessionRes.json();
      const localData   = await localRes.json();

      const outlookEvents = parseEvents(sessionData.events ?? []);
      const localEvents   = Array.isArray(localData) ? localData.map(e => ({
        id:       'local-' + e.db_id,
        db_id:    e.db_id,
        title:    e.title,
        start:    new Date(e.start),
        end:      new Date(e.end),
        allDay:   e.allDay,
        location: e.location || '',
        source:   'local',
      })) : [];

      const all = [...outlookEvents, ...localEvents];
      setEvents(all);
      if (all.length === 0) setSyncError('No events loaded yet. Click "Sync from Outlook" to fetch your calendar.');
    } catch { setSyncError('Could not load calendar. Try syncing from Outlook.'); }
    finally { setLoading(false); }
  };

  const syncFromOutlook = async () => {
    setLoading(true); setSyncError(null);
    try {
      const res  = await fetch('/api/auth/calendar/refresh', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) { setSyncError(data.error || 'Sync failed — try logging out and back in.'); setLoading(false); return; }
      const raw = data.events ?? [];
      setEvents(parseEvents(raw));
      if (raw.length === 0) setSyncError('No upcoming events found in your Outlook calendar.');
    } catch { setSyncError('Sync failed. Check your connection and try again.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadFromSession(); }, []);

  const handleSelectSlot = ({ start, end, slots }) => {
    const allDay = slots?.length > 1 || (end - start) >= 86400000;
    setSelectedEv(null);
    setQuickSlot({ start, end, allDay });
  };

  const handleAddEvent = async ({ title, start, end, allDay }) => {
    // Optimistic add
    const tempId = 'local-tmp-' + Date.now();
    setEvents(prev => [...prev, { id: tempId, title, start, end, allDay, source: 'local' }]);
    try {
      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
        },
        body: JSON.stringify({ title, start: start.toISOString(), end: end.toISOString(), all_day: allDay }),
      });
      if (res.ok) {
        const data = await res.json();
        // Replace temp id with real db_id
        setEvents(prev => prev.map(e => e.id === tempId
          ? { ...e, id: 'local-' + data.id, db_id: data.id }
          : e
        ));
      }
    } catch {}
  };

  const handleDeleteEvent = async id => {
    setEvents(prev => prev.filter(e => e.id !== id));
    // Extract numeric db_id from 'local-123'
    const dbId = id.toString().replace('local-', '');
    if (!isNaN(dbId)) {
      await fetch(`/api/calendar/events/${dbId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content },
      }).catch(() => {});
    }
  };

  return (
    <div className="p-8 h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Calendar</h1>
          <p className="text-slate-500 text-sm mt-0.5">Click any slot to add an event</p>
        </div>
        <button onClick={syncFromOutlook} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition shadow-sm disabled:opacity-50">
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Sync from Outlook
        </button>
      </div>

      {syncError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {syncError}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 p-4 overflow-auto min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BRAND, borderTopColor: 'transparent' }} />
              <span className="text-slate-500 font-medium">Loading calendar…</span>
            </div>
          </div>
        ) : (
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%', minHeight: 500 }}
            popup
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={ev => { setQuickSlot(null); setSelectedEv(ev); }}
            eventPropGetter={ev => ({
              style: {
                backgroundColor: ev.source === 'local' ? BRAND : '#3b82f6',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }
            })}
          />
        )}
      </div>

      {/* Quick-add modal — centered, no dates shown */}
      {quickSlot && (
        <QuickAddModal
          slot={quickSlot}
          onAdd={handleAddEvent}
          onClose={() => setQuickSlot(null)}
        />
      )}

      {/* Event detail modal */}
      {selectedEv && (
        <EventModal
          event={selectedEv}
          onClose={() => setSelectedEv(null)}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
}
