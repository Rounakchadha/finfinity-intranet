import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Calendar from './components/Calendar';
import DocumentDirectory from './components/DocumentDirectory';
import EmployeeDirectory from './components/EmployeeDirectory';
import MemoApproval from './components/MemoApproval';
import Announcements from './components/Announcements';
import QrCodeManager from './components/QrCodeManager';
import ITAdminTools from './components/ITAdminTools';
import HRAdminTools from './components/HRAdminTools';
import Account from './components/Account';
import AssetRequestPage from './components/AssetRequestPage';
import ComplianceDashboard from './components/ComplianceDashboard';
import '../css/globals.css';

export default function AppRoutes({ isAuthenticated, config }) {
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // Full-screen pages (no sidebar/top nav) — empty by default, all tools are now in-layout
  const fullscreenPaths = config?.fullscreen_paths ?? [];
  if (fullscreenPaths.length > 0 && fullscreenPaths.includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/it-admin-tools" element={<ITAdminTools />} />
        <Route path="/hr-admin-tools" element={<HRAdminTools />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Sidebar config={config} />

      <div className="flex flex-col flex-1 min-w-0">
        <TopNav config={config} />

        <main className="flex-1 min-w-0 overflow-y-auto">
          <Routes>
            <Route path="/"               element={<Dashboard config={config} />} />
            <Route path="/app"            element={<Dashboard config={config} />} />
            <Route path="/account"        element={<Account />} />
            <Route path="/announcements"  element={<Announcements config={config} />} />
            <Route path="/qr-codes"       element={<QrCodeManager config={config} />} />
            <Route path="/calendar"       element={<Calendar />} />
            <Route path="/documents"      element={<DocumentDirectory config={config} />} />
            <Route path="/directory"      element={<EmployeeDirectory config={config} />} />
            <Route path="/employees"      element={<EmployeeDirectory config={config} />} />
            <Route path="/memo-approval"  element={<MemoApproval />} />
            <Route path="/asset-request"  element={<AssetRequestPage />} />
            <Route path="/it-admin-tools" element={<ITAdminTools />} />
            <Route path="/hr-admin-tools" element={<HRAdminTools />} />
            <Route path="/compliance"     element={<ComplianceDashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
