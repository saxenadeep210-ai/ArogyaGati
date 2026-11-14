import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageSelector } from './LanguageSelector';
import { 
  ShieldCheck, 
  PhoneCall, 
  ArrowLeft, 
  HeartPulse, 
  Lock, 
  Building2, 
  CheckCircle2,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../utils/translations';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  roleBadge?: {
    text: string;
    icon: React.ReactNode;
    colorClass: string;
  };
  backTo?: string;
  backText?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  roleBadge,
  backTo = '/login',
  backText,
}) => {
  const navigate = useNavigate();
  const { isDemoMode } = useAuth();
  const { t, isHindi } = useTranslation();

  const defaultBackText = isHindi ? 'पोर्टल चयन पर वापस जाएं' : 'Back to Portal Selection';

  return (
    <div className="min-h-screen bg-[#F5F6FC] text-[#171B2C] relative flex flex-col justify-between selection:bg-[#3435D8] selection:text-white">
      {/* Sovereign National Micro-Strip (Tiranga) */}
      <div className="w-full h-[2.5px] grid grid-cols-3 fixed top-0 left-0 right-0 z-50">
        <div className="bg-[#FF9933]"></div>
        <div className="bg-white border-y border-slate-100"></div>
        <div className="bg-[#138808]"></div>
      </div>

      {/* Subtle grid pattern background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.45] z-0"
        style={{
          backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px), linear-gradient(to right, #F1F5F9 1px, transparent 1px), linear-gradient(to bottom, #F1F5F9 1px, transparent 1px)`,
          backgroundSize: '24px 24px, 48px 48px, 48px 48px',
        }}
      />

      {/* Subtle radial glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-indigo-200/25 via-blue-100/15 to-transparent blur-3xl pointer-events-none -z-0" />

      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-2.5 sm:px-8 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Brand Logo & Back navigation */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (backTo) {
                  navigate(backTo);
                } else if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/login');
                }
              }}
              className="p-1.5 sm:p-2 -ml-1 text-slate-700 hover:text-[#3435D8] hover:bg-slate-100 active:scale-95 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer border border-slate-200/60"
              title={isHindi ? "वापस जाएं" : "Go Back"}
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.4]" />
            </button>

            <Link to="/login" className="flex items-center gap-2 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#3435D8] text-white flex items-center justify-center shadow-xs group-hover:bg-[#2424B8] transition-colors shrink-0">
                <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#171B2C]">
                    Arogya<span className="text-[#3435D8]">Gati</span>
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-[#737B91] border border-slate-200">
                    GOV.IN
                  </span>
                </div>
                <p className="text-[10px] text-[#737B91] hidden sm:block tracking-wide">
                  Unified Healthcare Ecosystem • MoHFW
                </p>
              </div>
            </Link>
          </div>

          {/* Right Header actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-xs">
            {/* Portals Switcher */}
            <Link
              to="/login"
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#171B2C] font-semibold text-xs transition shadow-xs"
              title={t.nav.portals}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#3435D8]" />
              <span className="hidden sm:inline">{t.nav.portals}</span>
            </Link>

            {/* Emergency Hotline shortcut */}
            <a
              href="tel:108"
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-red-50 text-[#DC4545] hover:bg-red-100 border border-red-200 text-xs font-bold transition shadow-xs"
              title="108 Emergency Ambulance"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">108 {isHindi ? 'हेल्पलाइन' : 'Helpline'}</span>
              <span className="sm:hidden">108</span>
            </a>

            {/* Language Selector */}
            <LanguageSelector compact />

            {/* Demo Mode Badge */}
            {isDemoMode && (
              <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                DEMO
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-[480px] mx-auto">
          {/* Back Navigation Link */}
          {backTo && (
            <div className="mb-4">
              <Link
                to={backTo}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#3435D8] transition-colors bg-white/70 hover:bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{backText || defaultBackText}</span>
              </Link>
            </div>
          )}

          {/* Central White Auth Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xl shadow-indigo-950/5 p-6 sm:p-9 relative overflow-hidden backdrop-blur-xl">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-[#3435D8] to-indigo-600" />

            {/* Card Header */}
            <div className="text-center space-y-2 mb-6">
              {roleBadge && (
                <div className="flex justify-center">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${roleBadge.colorClass}`}
                  >
                    {roleBadge.icon}
                    <span>{roleBadge.text}</span>
                  </div>
                </div>
              )}

              <h1 className="text-2xl sm:text-2xl font-bold tracking-tight text-[#171B2C]">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-[#737B91] max-w-sm mx-auto leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Injected Form / Content */}
            {children}
          </div>

          {/* Bottom Security Assurance */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[#737B91]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ABDM Compliant M1/M2/M3</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#3435D8]" />
              <span>256-bit End-to-End Encryption</span>
            </div>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="relative z-10 w-full border-t border-slate-200/80 bg-white/60 backdrop-blur-xs py-4 px-4 text-center text-xs text-[#737B91]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 ArogyaGati • National Digital Health Mission • Government of India</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[#171B2C] transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-[#171B2C] transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-[#171B2C] transition-colors">Security Audit</a>
            <span>•</span>
            <a href="#" className="hover:text-[#171B2C] transition-colors">Help Desk 1800-11-4477</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
