import { useEffect, useState } from 'react';

export default function SharedCalendar({ config }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSharedEvents();
  }, []);

  const fetchSharedEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/shared-calendar', { credentials: 'include' });
      const data = await response.json();
      
      // Backend returns a flat array; also handle legacy {events:[]} shape
      const list = Array.isArray(data) ? data : (Array.isArray(data.events) ? data.events : []);
      if (list.length > 0) {
        setEvents(list);
      } else {
        setError('No shared calendar events available');
      }
    } catch (error) {
      console.error('SharedCalendar fetch error:', error);
      setError('Failed to fetch shared calendar events');
    } finally {
      setLoading(false);
    }
  };

  const formatEventTime = (event) => {
    try {
      const startTime = new Date(event.start?.dateTime || event.start);
      const endTime = new Date(event.end?.dateTime || event.end);
      
      const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      };
      
      const start = startTime.toLocaleTimeString([], timeOptions);
      const end = endTime.toLocaleTimeString([], timeOptions);
      
      return `${start} - ${end}`;
    } catch (error) {
      return 'Time TBD';
    }
  };

  const formatEventDate = (event) => {
    try {
      const eventDate = new Date(event.start?.dateTime || event.start);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Check if it's today
      if (eventDate.toDateString() === today.toDateString()) {
        return 'Today';
      }
      
      // Check if it's tomorrow
      if (eventDate.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      }
      
      // Otherwise show date
      return eventDate.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Date TBD';
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{config?.right_panel?.shared_calendar_title ?? 'Company Announcements'}</h3>
        <button
          onClick={fetchSharedEvents}
          className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          disabled={loading}
          title="Refresh shared calendar"
        >
          <span className={`inline-block ${loading ? 'animate-spin' : ''}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="text-slate-500 font-medium">Loading shared events...</span>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 font-medium text-sm">{error}</div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-gray-200">
          <div className="text-slate-500 font-medium text-sm">No shared events available</div>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-2 scrollbar-hide">
          {events.map((event, index) => (
            <div
              key={event.id || index}
              className="bg-slate-50 rounded-xl p-4 border border-gray-100 hover:bg-white hover:shadow-sm hover:-translate-y-[1px] hover:border-slate-200 transition-all cursor-default"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                <div className="font-bold text-slate-800 text-sm truncate">
                  {event.subject || 'Untitled Event'}
                </div>
              </div>
              <div className="text-xs text-slate-500 ml-4 font-medium">
                {formatEventDate(event)} • {formatEventTime(event)}
              </div>
              {event.location?.displayName && (
                <div className="text-xs text-slate-400 mt-2 ml-4 flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {event.location.displayName}
                </div>
              )}
              {event.organizer?.emailAddress?.name && (
                <div className="text-xs text-slate-400 mt-2 ml-4 flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {event.organizer.emailAddress.name}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 