import React from 'react';
import { Link } from 'react-router-dom';
import { LanguageSelector } from './LanguageSelector';
import { 
  ShieldCheck, 
  PhoneCall, 
  ArrowLeft, 
  HeartPulse, 
  Lock, 
  Building2, 
  CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
  backText = 'Back to Portal Selection',
}) => {
  const { isDemoMode } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F6FC] text-[#171B2C] relative flex flex-col justify-between selection:bg-[#3435D8] selection:text-white">
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
      <header className="relative z-10 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/login" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#3435D8] text-white flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:bg-[#2424B8] transition-colors">
              <HeartPulse className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-[#171B2C]">
                  Arogya<span className="text-[#3435D8]">Gati</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-[#737B91] border border-slate-200">
                  GOV.IN
                </span>
              </div>
              <p className="text-[10px] text-[#737B91] hidden sm:block tracking-wide">
                Unified Healthcare Ecosystem • MoHFW
              </p>
            </div>
          </Link>

          {/* Right Header actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Emergency Hotline shortcut */}
            <a
              href="tel:108"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-[#DC4545] border border-red-200/80 text-xs font-bold hover:bg-red-100/80 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Emergency 108</span>
            </a>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Demo Mode Badge */}
            {isDemoMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                DEMO MODE
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[480px] mx-auto">
          {/* Back Navigation Link */}
          {backTo && (
            <div className="mb-4">
              <Link
                to={backTo}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737B91] hover:text-[#3435D8] transition-colors group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                <span>{backText}</span>
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
