import { useEffect, useState } from 'react';
import AgendaCalendar from './AgendaCalendar';
import SharedCalendar from './SharedCalendar';

export default function Dashboard({ config }) {
  const [user, setUser] = useState(null);
  const [links, setLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [linksError, setLinksError] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const linksPerSlide = 4;
  const totalSlides = Math.ceil(links.length / linksPerSlide);

  useEffect(() => {
    fetch('/api/auth/status', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.isAuthenticated && data.user?.profile) {
          setUser(data.user.profile);
        }
      })
      .catch(() => {});

    fetch('/api/links', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setLinks(Array.isArray(data) ? data : []);
        setLinksLoading(false);
      })
      .catch(() => {
        // Fall back to defaults from server config — no hardcoded values here
        const fallback = config?.default_links ?? [];
        setLinks(fallback);
        setLinksLoading(false);
        setLinksError(true);
      });
  }, [config]);

  const getCurrentSlideLinks = () => {
    const start = currentSlide * linksPerSlide;
    return links.slice(start, start + linksPerSlide);
  };

  const goToPrev = () => setCurrentSlide(p => (p === 0 ? totalSlides - 1 : p - 1));
  const goToNext = () => setCurrentSlide(p => (p === totalSlides - 1 ? 0 : p + 1));

  const primaryColor = config?.branding?.primary_color ?? '#115948';

  return (
    <div className="flex flex-col gap-6 w-full h-full p-8 overflow-y-auto scrollbar-hide">
      <h1 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">
        Welcome back{user ? `, ${user.displayName}` : ''}
      </h1>

      {linksError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded-lg text-sm mb-4">
          Could not load links from server. Showing defaults.
        </div>
      )}

      {/* Links slider */}
      <div className="relative">
        {linksLoading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mr-3" style={{ borderColor: primaryColor }}></div>
            <span className="text-slate-500 font-medium">Loading shortcuts...</span>
          </div>
        ) : (
          <>
            <div className="flex gap-6 mb-2 overflow-hidden px-2 pb-4 pt-2">
              {getCurrentSlideLinks().map((link, idx) => (
                <a
                  key={link.id ?? idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl flex flex-col gap-3 items-center justify-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-95 flex-shrink-0 bg-white shadow-sm border border-gray-100 group"
                  style={{
                    width: '180px',
                    height: '110px',
                    borderTopWidth: '4px',
                    borderTopColor: link.background_color || primaryColor,
                  }}
                  title={link.is_personalized ? `${link.name} (Personalised)` : link.name}
                >
                  {link.logo ? (
                    <img src={link.logo} alt={link.name} className="h-10 object-contain transition-transform duration-200 group-hover:scale-110" />
                  ) : (
                    <span className="text-slate-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </span>
                  )}
                  <span className="text-sm font-semibold text-slate-700 max-w-[150px] truncate">{link.name}</span>
                </a>
              ))}
            </div>

            {totalSlides > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 bg-white text-slate-500 rounded-full w-10 h-10 flex items-center justify-center shadow-md border border-gray-100 transition-all duration-200 hover:text-slate-800 hover:scale-110 z-10"
                  aria-label="Previous"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 bg-white text-slate-500 rounded-full w-10 h-10 flex items-center justify-center shadow-md border border-gray-100 transition-all duration-200 hover:text-slate-800 hover:scale-110 z-10"
                  aria-label="Next"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="flex justify-center mb-6 space-x-2">
                  {Array.from({ length: totalSlides }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${i === currentSlide ? 'scale-125' : 'bg-gray-200 hover:bg-gray-300'}`}
                      style={i === currentSlide ? { backgroundColor: primaryColor } : {}}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Two-column calendar layout */}
      <div className="flex gap-6 flex-grow pb-8 min-h-[400px]">
        <div className="flex-[0_0_60%] rounded-2xl p-6 overflow-auto bg-white border border-gray-100 shadow-sm flex flex-col">
          <AgendaCalendar />
        </div>
        <div className="flex-[0_0_35%] rounded-2xl p-6 overflow-auto bg-white border border-gray-100 shadow-sm flex flex-col">
          <SharedCalendar />
        </div>
      </div>
    </div>
  );
}
