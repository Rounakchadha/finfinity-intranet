import { useState } from 'react';
import finLogo from '../assets/fin-logo.png';
import microsoftLogo from '../assets/microsoft-logo.png';

const BRAND = '#115948';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = (switchAccount = false) => {
    setIsLoading(true);
    setError(null);
    window.location.assign(switchAccount ? '/auth/login?switch=1' : '/auth/login');
  };

  return (
    <div className="min-h-screen flex font-sans">

      {/* ── Left panel — brand green ─────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white"
        style={{ backgroundColor: BRAND }}
      >
        {/* Top: logo + name */}
        <div className="flex items-center gap-3">
          <img src={finLogo} alt="FinFinity" className="h-9 w-auto brightness-0 invert" />
          <span className="text-2xl font-black tracking-tight">FinFinity</span>
        </div>

        {/* Middle: tagline */}
        <div className="space-y-6">
          <h1 className="text-4xl font-black leading-tight tracking-tight">
            Your workplace,<br />all in one place.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-sm">
            HR tools, IT support, company announcements, and more —
            built for the FinFinity team.
          </p>

          {/* Feature list */}
          <ul className="space-y-3 mt-8">
            {[
              'Employee directory & org chart',
              'IT asset requests & support',
              'Memo approvals & announcements',
              'HR recruitment & onboarding',
            ].map(f => (
              <li key={f} className="flex items-center gap-3 text-white/80 text-sm font-medium">
                <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: copyright */}
        <p className="text-white/40 text-xs font-medium">
          &copy; {new Date().getFullYear()} FinFinity. All rights reserved.
        </p>
      </div>

      {/* ── Right panel — login form ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 px-6 sm:px-12 lg:px-16">

        {/* Mobile logo (only shown when left panel is hidden) */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <img src={finLogo} alt="FinFinity" className="h-9 w-auto" />
          <span className="text-2xl font-black tracking-tight text-slate-900">FinFinity</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sign in</h2>
            <p className="mt-2 text-slate-500 text-sm font-medium">
              Use your corporate Microsoft account to continue.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Microsoft button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ '--tw-ring-color': BRAND }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" style={{ color: BRAND }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <img src={microsoftLogo} alt="" className="h-5 w-5" />
                <span>Continue with Microsoft</span>
              </>
            )}
          </button>

          {/* Switch account */}
          <div className="mt-3 text-center">
            <button
              onClick={() => handleLogin(true)}
              disabled={isLoading}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors disabled:opacity-50"
            >
              Use a different account
            </button>
          </div>

          {/* Divider */}
          <div className="mt-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Secure SSO</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Trust indicators */}
          <div className="mt-6 flex items-center justify-center gap-5 text-slate-400">
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Encrypted
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Azure AD
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              SSO Only
            </div>
          </div>
        </div>

        {/* Mobile copyright */}
        <p className="lg:hidden mt-16 text-xs font-medium text-slate-400">
          &copy; {new Date().getFullYear()} FinFinity. All rights reserved.
        </p>
      </div>
    </div>
  );
}
