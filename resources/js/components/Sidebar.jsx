import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import finLogo from '../assets/fin-logo.png';

// ─── Icons ──────────────────────────────────────────────────────────────────

const Icon = ({ d, d2, fill }) => (
  <svg viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg" width={20} height={20}>
    <path d={d} stroke={fill ? undefined : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    {d2 && <path d={d2} stroke={fill ? undefined : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>}
  </svg>
);

const HomeIcon   = () => <Icon d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.55 5.45 21 6 21H9M19 10L21 12M19 10V20C19 20.55 18.55 21 18 21H15M9 21C9 21 9 15 12 15C15 15 15 21 15 21M9 21H15" />;
const CalendarIcon = () => <Icon d="M3 9H21M17 13H7M10 17H7M7 3V5M17 3V5M6.2 21H17.8C18.92 21 19.48 21 19.91 20.78C20.28 20.59 20.59 20.28 20.78 19.91C21 19.48 21 18.92 21 17.8V8.2C21 7.08 21 6.52 20.78 6.09C20.59 5.72 20.28 5.41 19.91 5.22C19.48 5 18.92 5 17.8 5H6.2C5.08 5 4.52 5 4.09 5.22C3.72 5.41 3.41 5.72 3.22 6.09C3 6.52 3 7.08 3 8.2V17.8C3 18.92 3 19.48 3.22 19.91C3.41 20.28 3.72 20.59 4.09 20.78C4.52 21 5.08 21 6.2 21Z" />;
const DocumentIcon = () => <Icon d="M14 2H6C5.47 2 4.96 2.21 4.59 2.59C4.21 2.96 4 3.47 4 4V20C4 20.53 4.21 21.04 4.59 21.41C4.96 21.79 5.47 22 6 22H18C18.53 22 19.04 21.79 19.41 21.41C19.79 21.04 20 20.53 20 20V8L14 2Z" d2="M14 2V8H20M16 13H8M16 17H8M10 9H8" />;
const PeopleIcon = () => <Icon d="M17 21V19C17 17.93 16.58 16.92 15.83 16.17C15.08 15.42 14.06 15 13 15H5C3.94 15 2.92 15.42 2.17 16.17C1.42 16.92 1 17.93 1 19V21M23 21V19C23 18.11 22.7 17.25 22.16 16.55C21.62 15.85 20.86 15.35 20 15.13M16 3.13C16.86 3.35 17.62 3.85 18.17 4.55C18.71 5.25 19.01 6.12 19.01 7C19.01 7.89 18.71 8.76 18.17 9.46C17.62 10.16 16.86 10.66 16 10.88M13 7C13 9.21 11.21 11 9 11C6.79 11 5 9.21 5 7C5 4.79 6.79 3 9 3C11.21 3 13 4.79 13 7Z" />;
const BellIcon   = () => <Icon d="M18 8C18 6.41 17.37 4.88 16.24 3.76C15.12 2.63 13.59 2 12 2C10.41 2 8.88 2.63 7.76 3.76C6.63 4.88 6 6.41 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" d2="M13.73 21C13.55 21.3 13.3 21.55 12.998 21.73C12.69 21.9 12.35 21.99 12 21.99C11.65 21.99 11.31 21.9 11 21.73C10.7 21.55 10.45 21.3 10.27 21" />;
const MemoIcon   = () => <Icon d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z" />;
const QrIcon     = () => <Icon d="M3 3H9V9H3V3ZM15 3H21V9H15V3ZM3 15H9V21H3V15ZM5 5H7V7H5V5ZM17 5H19V7H17V5ZM5 17H7V19H5V17ZM15 15H17V17H15V15ZM15 19H17V21H15V19ZM19 15H21V17H19V15ZM19 19H21V21H19V19ZM17 17H19V19H17V17Z" />;
const SettingsIcon = () => <Icon d="M12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15Z" d2="M19.4 15C19.27 15.3 19.23 15.64 19.29 15.96C19.34 16.28 19.5 16.58 19.73 16.82L19.79 16.88C19.97 17.07 20.12 17.29 20.22 17.53C20.32 17.77 20.38 18.03 20.38 18.3C20.38 18.56 20.32 18.82 20.22 19.06C20.12 19.3 19.97 19.52 19.79 19.71C19.6 19.9 19.38 20.04 19.14 20.14C18.9 20.24 18.64 20.3 18.38 20.3C18.11 20.3 17.85 20.24 17.61 20.14C17.37 20.04 17.15 19.9 16.96 19.71L16.9 19.65C16.66 19.42 16.37 19.26 16.04 19.21C15.72 19.15 15.38 19.19 15.08 19.32C14.78 19.45 14.53 19.66 14.35 19.93C14.18 20.19 14.08 20.51 14.08 20.83V21C14.08 21.53 13.87 22.04 13.49 22.41C13.12 22.79 12.61 23 12.08 23C11.55 23 11.04 22.79 10.67 22.41C10.29 22.04 10.08 21.53 10.08 21V20.91C10.07 20.58 9.97 20.26 9.77 19.99C9.58 19.72 9.31 19.51 9 19.4C8.7 19.27 8.36 19.23 8.04 19.29C7.72 19.34 7.42 19.5 7.18 19.73L7.12 19.79C6.93 19.97 6.71 20.12 6.47 20.22C6.23 20.32 5.97 20.38 5.7 20.38C5.44 20.38 5.18 20.32 4.94 20.22C4.7 20.12 4.48 19.97 4.29 19.79C4.1 19.6 3.96 19.38 3.86 19.14C3.76 18.9 3.7 18.64 3.7 18.38C3.7 18.11 3.76 17.85 3.86 17.61C3.96 17.37 4.1 17.15 4.29 16.96L4.35 16.9C4.58 16.66 4.74 16.37 4.79 16.04C4.85 15.72 4.81 15.38 4.68 15.08C4.55 14.78 4.34 14.53 4.07 14.35C3.81 14.18 3.49 14.08 3.17 14.08H3C2.47 14.08 1.96 13.87 1.59 13.49C1.21 13.12 1 12.61 1 12.08C1 11.55 1.21 11.04 1.59 10.67C1.96 10.29 2.47 10.08 3 10.08H3.09C3.42 10.07 3.74 9.97 4.01 9.77C4.28 9.58 4.49 9.31 4.6 9C4.73 8.7 4.77 8.36 4.71 8.04C4.66 7.72 4.5 7.42 4.27 7.18L4.21 7.12C4.02 6.93 3.88 6.71 3.78 6.47C3.68 6.23 3.62 5.97 3.62 5.7C3.62 5.44 3.68 5.18 3.78 4.94C3.88 4.7 4.02 4.48 4.21 4.29C4.4 4.1 4.62 3.96 4.86 3.86C5.1 3.76 5.36 3.7 5.63 3.7C5.89 3.7 6.15 3.76 6.39 3.86C6.63 3.96 6.85 4.1 7.04 4.29L7.1 4.35C7.34 4.58 7.64 4.74 7.96 4.79C8.28 4.85 8.62 4.81 8.92 4.68H9C9.3 4.55 9.55 4.34 9.73 4.07C9.9 3.81 9.99 3.49 10 3.17V3C10 2.47 10.21 1.96 10.59 1.59C10.96 1.21 11.47 1 12 1C12.53 1 13.04 1.21 13.41 1.59C13.79 1.96 14 2.47 14 3V3.09C14 3.41 14.1 3.73 14.27 3.99C14.45 4.26 14.7 4.47 15 4.6C15.3 4.73 15.64 4.77 15.96 4.71C16.28 4.66 16.58 4.5 16.82 4.27L16.88 4.21C17.07 4.02 17.29 3.88 17.53 3.78C17.77 3.68 18.03 3.62 18.3 3.62C18.56 3.62 18.82 3.68 19.06 3.78C19.3 3.88 19.52 4.02 19.71 4.21C19.9 4.4 20.04 4.62 20.14 4.86C20.24 5.1 20.3 5.36 20.3 5.63C20.3 5.89 20.24 6.15 20.14 6.39C20.04 6.63 19.9 6.85 19.71 7.04L19.65 7.1C19.42 7.34 19.26 7.64 19.21 7.96C19.15 8.28 19.19 8.62 19.32 8.92V9C19.45 9.3 19.66 9.55 19.93 9.73C20.19 9.9 20.51 9.99 20.83 10H21C21.53 10 22.04 10.21 22.41 10.59C22.79 10.96 23 11.47 23 12C23 12.53 22.79 13.04 22.41 13.41C22.04 13.79 21.53 14 21 14H20.91C20.59 14 20.27 14.1 20.01 14.27C19.74 14.45 19.53 14.7 19.4 15Z" />;
const HRIcon     = () => <Icon d="M20 21V19C20 17.93 19.58 16.92 18.83 16.17C18.08 15.42 17.06 15 16 15H8C6.94 15 5.92 15.42 5.17 16.17C4.42 16.92 4 17.93 4 19V21M16 7C16 9.21 14.21 11 12 11C9.79 11 8 9.21 8 7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7Z" />;
const ToolIcon   = () => <Icon d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />;

const ShieldIcon = () => <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;

const ICON_MAP = {
  home: HomeIcon, calendar: CalendarIcon, document: DocumentIcon, users: PeopleIcon,
  bell: BellIcon, memo: MemoIcon, qr: QrIcon, settings: ToolIcon, hr: HRIcon,
  shield: ShieldIcon,
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export default function Sidebar({ config }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = config?.navigation ?? [];
  const accentColor = 'bg-slate-100 text-slate-900 border-slate-200';
  const inactiveColor = 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-transparent text-slate-600';

  const PATH_OVERRIDES = {
    employees: '/directory',
  };

  const handleNavClick = (item) => {
    const path = PATH_OVERRIDES[item.key] !== undefined ? PATH_OVERRIDES[item.key] : item.path;
    if (path) navigate(path);
  };

  const isActive = (item) => {
    const path = PATH_OVERRIDES[item.key] !== undefined ? PATH_OVERRIDES[item.key] : item.path;
    if (!path) return false;
    if (path === '/') return location.pathname === '/' || location.pathname === '/app';
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    try {
      await axios.get('/api/auth/logout');
      window.location.href = '/auth/login';
    } catch {
      window.location.href = '/auth/login';
    }
  };

  const mainNav = navItems.filter(i => !['it-admin-tools', 'hr-admin-tools'].includes(i.key));
  const adminNav = navItems.filter(i => ['it-admin-tools', 'hr-admin-tools'].includes(i.key));

  return (
    <nav className={`h-full flex flex-col bg-white border-r border-slate-200 flex-shrink-0 z-20 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Header / Logo aligned with TopNav height (h-16) */}
      <div className={`h-16 border-b border-slate-200 flex items-center ${collapsed ? 'justify-center mx-1' : 'justify-between px-5'} flex-shrink-0 transition-all duration-300`}>
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer flex-shrink-0" onClick={() => navigate('/')}>
          <img src={finLogo} alt="FinFinity" className="h-8 w-auto flex-shrink-0" />
          {!collapsed && <h1 className="text-xl font-black text-slate-900 tracking-tight whitespace-nowrap">FinFinity</h1>}
        </div>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-all flex-shrink-0 ${collapsed ? 'hidden' : 'block'}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Mobile-like expansion handle when collapsed */}
      {collapsed && (
        <div className="flex justify-center mt-2 mb-2">
          <button 
            onClick={() => setCollapsed(false)}
            className="text-slate-300 hover:text-slate-600 p-1 rounded-md"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Navigation Space */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 flex flex-col gap-2 scrollbar-hide">
        {!collapsed && <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>}
        {mainNav.map(item => {
          const IconComp = ICON_MAP[item.icon] ?? HomeIcon;
          const active   = isActive(item);
          return (
            <button
              key={item.key}
              onClick={() => handleNavClick(item)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-2.5 rounded-xl border text-sm font-bold transition-colors duration-150 ${active ? accentColor : inactiveColor}`}
            >
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6"><IconComp /></span>
              {!collapsed && <span className="truncate whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}

        {adminNav.length > 0 && <div className="my-4 border-t border-slate-100" />}

        {adminNav.length > 0 && (
          <>
            {!collapsed && <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Tools</p>}
            {adminNav.map(item => {
              const IconComp = ICON_MAP[item.icon] ?? HRIcon;
              const active   = isActive(item);
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-2.5 rounded-xl border text-sm font-bold transition-colors duration-150 ${active ? accentColor : inactiveColor}`}
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6"><IconComp /></span>
                  {!collapsed && <span className="truncate whitespace-nowrap">{item.label}</span>}
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Footer / Sign Out Button */}
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={handleSignOut}
          title={collapsed ? 'Sign Out' : undefined}
          className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-2.5 rounded-xl border border-transparent text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors duration-150`}
        >
          <span className="flex-shrink-0 flex items-center justify-center w-6 h-6">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </span>
          {!collapsed && <span className="truncate whitespace-nowrap">Sign Out</span>}
        </button>
      </div>

    </nav>
  );
}
