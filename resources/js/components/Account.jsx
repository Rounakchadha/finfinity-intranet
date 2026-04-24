import { useEffect, useState } from 'react';

export default function Account() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch fresh (bypass cache) so local DB overrides for department/jobTitle are applied
    fetch('/api/auth/status', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data.isAuthenticated && data.user?.profile) setUser(data.user.profile); })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'GET', credentials: 'include' });
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="p-8 h-full flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center text-slate-500">
        Could not load account details.
      </div>
    );
  }

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';

  return (
    <div className="p-8 max-w-4xl mx-auto h-full w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 mt-1">Manage your profile and session preferences.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Profile Card View */}
        <div className="bg-slate-50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 min-w-[280px]">
          <div className="w-24 h-24 rounded-full bg-[#115948] text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-sm">
            {getInitials(user.displayName)}
          </div>
          <h2 className="text-xl font-bold text-slate-900 text-center">{user.displayName}</h2>
          <p className="text-sm text-slate-500 text-center mt-1 font-medium">{user.jobTitle || 'Employee'}</p>
        </div>

        {/* Details List */}
        <div className="p-8 flex-1">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Profile Details</h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
              <p className="text-slate-800 font-medium">{user.mail || user.userPrincipalName || 'N/A'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                <p className="text-slate-800 font-medium">{user.department || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Office Location</p>
                <p className="text-slate-800 font-medium">{user.officeLocation || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100">
            <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-4">Danger Zone</h3>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 hover:border-red-300 transition-colors"
            >
              Sign Out of FinFinity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
