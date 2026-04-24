import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SupportIcon() {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" width={24} height={24} xmlns="http://www.w3.org/2000/svg">
      <g><g><path d="M12,2v7.1c1.2,0.4,2,1.5,2,2.8c0,0.5-0.1,1-0.4,1.4l2,1.6c0.1,0,0.2-0.1,0.4-0.1c0.6,0,1,0.4,1,1c0,0.6-0.4,1-1,1 c-0.6,0-1-0.4-1-1v-0.1l-2-1.6c-0.5,0.5-1.2,0.8-2,0.8c-1.7,0-3-1.3-3-3c0-1.3,0.8-2.4,2-2.8v-7H9.9C6.4,2.5,3.5,5.4,3.1,9 c-0.3,2.2,0.3,4.2,1.5,5.8C5.5,16,6,17.3,6,18.8V22h9v-3h2c1.1,0,2-0.9,2-2v-3l1.5-0.6c0.4-0.2,0.6-0.8,0.4-1.2l-1.9-3 C18.6,5.5,15.7,2.5,12,2z M11,10.5c-0.8,0-1.5,0.7-1.5,1.5s0.7,1.5,1.5,1.5s1.5-0.7,1.5-1.5S11.8,10.5,11,10.5z"/></g><rect fill="none" width="24" height="24"/></g>
    </svg>
  );
}

export default function RightPanel({ onShowDocs, config }) {
  const defaultLink = config?.right_panel_default ?? { name: 'Outlook', url: 'https://outlook.office.com' };

  const [user, setUser] = useState(null);
  const [rightPanelLink, setRightPanelLink] = useState({ ...defaultLink, is_personalized: false });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/auth/status', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.isAuthenticated && data.user?.profile) {
          setUser(data.user.profile);
        }
      })
      .catch(() => {});

    fetch('/api/links/rightpanel', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setRightPanelLink({
          name: data.name || defaultLink.name,
          url: data.url  || defaultLink.url,
          is_personalized: data.is_personalized || false,
        });
      })
      .catch(() => {
        // Keep the config default on error — no hardcoded fallback
      });
  }, [config]);

  const profilePic = user?.userPrincipalName
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.userPrincipalName)}&background=115948&color=fff&size=128`
    : null;

  const primaryColor   = config?.branding?.primary_color   ?? '#115948';
  const secondaryColor = config?.branding?.secondary_color ?? '#177761';

  return (
    <div className="w-72 h-full bg-white border-l border-gray-100 shadow-sm flex flex-col justify-between items-center py-8 px-4 z-10">
      <div className="flex flex-col items-center w-full">
        <div className="bg-slate-50 rounded-full w-24 h-24 mb-4 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
          {profilePic && <img src={profilePic} alt="Profile" className="w-24 h-24 object-cover" />}
        </div>
        <div className="text-slate-800 text-xl font-bold text-center px-2">{user?.displayName ?? ''}</div>
        <div className="text-slate-500 text-xs font-medium mb-16 text-center">{user?.jobTitle ?? ''}</div>

        <div className="flex flex-col w-full px-6 gap-5 bg-slate-50 rounded-2xl py-6 border border-gray-100">
          <a
            href="#"
            onClick={e => { e.preventDefault(); onShowDocs(); }}
            className="text-slate-700 text-sm font-medium transition duration-200 hover:text-slate-900 flex justify-between items-center group"
          >
            <span>{config?.right_panel?.document_directory_label ?? 'Document Directory'}</span>
            <span className="text-slate-300 group-hover:text-slate-500 transition-colors">→</span>
          </a>
          <hr className="border-gray-200 w-full" />
          <a
            href="#"
            onClick={e => { e.preventDefault(); window.open(rightPanelLink.url, '_blank'); }}
            className={`text-slate-700 text-sm transition duration-200 hover:text-slate-900 flex justify-between items-center group ${rightPanelLink.is_personalized ? 'font-semibold' : 'font-medium'}`}
            title={rightPanelLink.is_personalized ? `Personalised: ${rightPanelLink.url}` : rightPanelLink.name}
          >
            <span>{rightPanelLink.name}</span>
            <span className="text-slate-300 group-hover:text-slate-500 transition-colors">→</span>
          </a>
        </div>
      </div>

      <div className="w-full flex justify-center mb-4 px-6">
        <button
          onClick={() => {
            const url = config?.right_panel?.support_url;
            if (url) window.open(url, '_blank');
            else navigate('/memo-approval');
          }}
          className="w-full rounded-xl flex items-center justify-center gap-3 py-3 font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 text-slate-700 bg-white border border-gray-200 shadow-sm hover:bg-slate-50 focus:ring-2 focus:ring-offset-1 focus:ring-gray-200"
        >
          <SupportIcon /> {config?.right_panel?.support_label ?? 'Support'}
        </button>
      </div>
    </div>
  );
}
