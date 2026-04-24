import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function TopNav({ config }) {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileInfo();
  }, []);

  const fetchProfileInfo = async () => {
    try {
      const res = await axios.get('/api/auth/status');
      if (res.data.isAuthenticated && res.data.user?.profile) {
        setProfile(res.data.user.profile);
      }
    } catch {
      // ignore
    }
  };

  const getInitials = () => {
    if (!profile?.displayName) return 'RC';
    const parts = profile.displayName.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  return (
    <header className="h-16 flex items-center justify-end px-8 bg-white border-b border-slate-200 sticky top-0 z-10 flex-shrink-0">
      
      {/* Right side - Profile link */}
      <button 
        onClick={() => navigate('/account')}
        className="flex items-center gap-3 py-1.5 px-3 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-green-100"
      >
        <div className="w-8 h-8 rounded-full bg-[#115948] flex items-center justify-center text-white font-bold text-xs shadow-sm">
          {getInitials()}
        </div>
      </button>

    </header>
  );
}
