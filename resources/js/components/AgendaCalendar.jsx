import { useEffect, useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export default function AgendaCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/auth/status', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const calendarData = data.user && data.user.calendar;
        if (Array.isArray(calendarData) && calendarData.length > 0) {
          const mapped = calendarData.map(ev => ({
            id: ev.id,
            title: ev.subject || 'No Title',
            start: new Date(ev.start?.dateTime),
            end: new Date(ev.end?.dateTime),
            allDay: false,
            location: ev.location?.displayName || '',
          }));
          setEvents(mapped);
        } else {
          setError('No agenda events found.');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch agenda events.');
        setLoading(false);
        console.error('Agenda fetch error:', err);
      });
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      {loading ? (
        <div className="flex items-center justify-center py-12">
           <span className="text-slate-500 font-medium">Loading agenda events...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 bg-red-50 p-4 rounded-xl text-center my-8 border border-red-100 font-medium">{error}</div>
      ) : (
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', minHeight: 400 }}
          views={['agenda']}
          defaultView="agenda"
          popup
        />
      )}
    </div>
  );
} 