import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RightPanel from './components/RightPanel';
import Login from './components/Login';
import Calendar from './components/Calendar';
import DocumentDirectory from './components/DocumentDirectory';
import EmployeeDirectory from './components/EmployeeDirectory';
import MemoApproval from './components/MemoApproval';
import Announcements from './components/Announcements';
import QrCodeManager from './components/QrCodeManager';
import ITAdminTools from './components/ITAdminTools';
import HRAdminTools from './components/HRAdminTools';
import { useState } from 'react';
import '../css/globals.css';

export default function AppRoutes({ isAuthenticated, config }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showEmployeeDirectory, setShowEmployeeDirectory] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // Full-screen pages (no sidebar/right panel) — driven by config
  const fullscreenPaths = config?.fullscreen_paths ?? ['/it-admin-tools', '/hr-admin-tools'];
  if (fullscreenPaths.includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/it-admin-tools" element={<ITAdminTools />} />
        <Route path="/hr-admin-tools" element={<HRAdminTools />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      <Sidebar
        onCalendarClick={() => setShowCalendar(true)}
        onDocumentsClick={() => setShowDocs(true)}
        onEmployeeDirectoryClick={() => setShowEmployeeDirectory(true)}
        config={config}
      />
      <div className="flex-grow overflow-auto">
        <Routes>
          <Route path="/"              element={<Dashboard config={config} />} />
          <Route path="/app"           element={<Dashboard config={config} />} />
          <Route path="/announcements"  element={<Announcements config={config} />} />
          <Route path="/qr-codes"       element={<QrCodeManager config={config} />} />
          <Route path="/memo-approval"  element={<MemoApproval onClose={() => navigate('/')} />} />
        </Routes>
      </div>
      <RightPanel onShowDocs={() => setShowDocs(true)} config={config} />
      {showCalendar        && <Calendar           onClose={() => setShowCalendar(false)} />}
      {showDocs            && <DocumentDirectory  onClose={() => setShowDocs(false)} />}
      {showEmployeeDirectory && <EmployeeDirectory onClose={() => setShowEmployeeDirectory(false)} />}
    </div>
  );
}
