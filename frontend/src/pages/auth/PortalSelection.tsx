import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PortalCard } from '../../components/auth/PortalCard';
import { LanguageSelector } from '../../components/auth/LanguageSelector';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../utils/translations';
import {
  HeartPulse,
  UserRound,
  Stethoscope,
  Building2,
  Ambulance,
  PhoneCall,
  ShieldCheck,
  Activity,
  BedDouble,
  Clock,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Info,
  Lock,
} from 'lucide-react';

export const PortalSelection: React.FC = () => {
  const { isAuthenticated, user, getDashboardRouteForRole, logout } = useAuth();
  const { t, isHindi } = useTranslation();
  const [activeModalInfo, setActiveModalInfo] = useState<string | null>(null);

  const ps = t.portalSelection;

  return (
    <div className="min-h-screen bg-[#F5F6FC] text-[#171B2C] relative flex flex-col justify-between selection:bg-[#3435D8] selection:text-white">
      {/* Soft Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.45] z-0"
        style={{
          backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px), linear-gradient(to right, #F1F5F9 1px, transparent 1px), linear-gradient(to bottom, #F1F5F9 1px, transparent 1px)`,
          backgroundSize: '24px 24px, 48px 48px, 48px 48px',
        }}
      />

      {/* Top Subtle Indigo Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-indigo-200/35 via-blue-100/20 to-transparent blur-3xl pointer-events-none -z-0" />

      {/* Sovereign National Micro-Strip (Tiranga) */}
      <div className="w-full h-[2.5px] grid grid-cols-3 fixed top-0 left-0 right-0 z-50">
        <div className="bg-[#FF9933]"></div>
        <div className="bg-white border-y border-slate-100"></div>
        <div className="bg-[#138808]"></div>
      </div>

      {/* Top Header */}
      <header className="relative z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-3 sm:px-8 py-3 sticky top-0 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Emblem */}
          <Link to="/login" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#3435D8] text-white flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:bg-[#2424B8] transition-colors">
              <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#171B2C]">
                  Arogya<span className="text-[#3435D8]">Gati</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-[#737B91] border border-slate-200">
                  GOV.IN
                </span>
              </div>
              <p className="text-[10px] text-[#737B91] hidden sm:block tracking-wide">
                Unified Healthcare Ecosystem • MoHFW
              </p>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#737B91]">
            <a href="#portals" className="text-[#171B2C] hover:text-[#3435D8] transition-colors">
              {ps.navPortals}
            </a>
            <a href="#about" className="hover:text-[#3435D8] transition-colors">
              {ps.navAbout}
            </a>
            <a href="#security" className="hover:text-[#3435D8] transition-colors">
              {ps.navSecurity}
            </a>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* If logged in, show active session shortcut */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  to={getDashboardRouteForRole(user.role)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-[#3435D8] text-xs font-bold hover:bg-indigo-100 transition whitespace-nowrap"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isHindi ? 'वापस' : 'Resume'} {user.portal}</span>
                  <span className="sm:hidden">{isHindi ? 'पोर्टल' : 'Portal'}</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-[11px] sm:text-xs text-[#737B91] hover:text-red-600 px-1 sm:px-2 py-1 font-semibold cursor-pointer whitespace-nowrap"
                >
                  {isHindi ? 'लॉगआउट' : 'Sign Out'}
                </button>
              </div>
            )}

            {/* Emergency Hotline 108 */}
            <a
              href="tel:108"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-50 text-[#DC4545] border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors shadow-xs whitespace-nowrap"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">108 {isHindi ? 'हेल्पलाइन' : 'Helpline'}</span>
              <span className="sm:hidden">108</span>
            </a>

            {/* Language Switcher */}
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-8 sm:pt-14 pb-6 sm:pb-10 px-4 sm:px-8 text-center max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* National Health Mission Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-xs text-xs font-medium text-[#737B91]">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[#171B2C] font-semibold text-[11px] sm:text-xs">{ps.badge}</span>
        </div>

        {/* Headings */}
        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#171B2C] leading-[1.2]">
            {ps.heroTitle}
          </h1>
          <p className="text-base sm:text-2xl font-bold bg-gradient-to-r from-[#3435D8] via-indigo-600 to-[#2424B8] bg-clip-text text-transparent">
            {ps.heroSubtitle}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm md:text-base text-[#737B91] max-w-2xl mx-auto leading-relaxed">
          {ps.heroDescription}
        </p>
      </section>

      {/* Main 4 Portals Grid Section */}
      <section id="portals" className="relative z-10 px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#171B2C]">
            {ps.sectionTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#737B91] mt-1">
            {ps.sectionSubtitle}
          </p>
        </div>

        {/* 4 Dedicated Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* 1. Patient Portal */}
          <PortalCard
            id="portal-patient"
            to="/login/patient"
            icon={<UserRound className="w-6 h-6" />}
            title={ps.patientTitle}
            badge={ps.citizenBadge}
            description={ps.patientDesc}
            ctaText={ps.patientCta}
            themeColor="blue"
            highlights={ps.patientHighlights}
          />

          {/* 2. Doctor's Desk */}
          <PortalCard
            id="portal-doctor"
            to="/login/doctor"
            icon={<Stethoscope className="w-6 h-6" />}
            title={ps.doctorTitle}
            badge={ps.clinicalBadge}
            description={ps.doctorDesc}
            ctaText={ps.doctorCta}
            themeColor="indigo"
            highlights={ps.doctorHighlights}
          />

          {/* 3. Hospital Admin */}
          <PortalCard
            id="portal-admin"
            to="/login/admin"
            icon={<Building2 className="w-6 h-6" />}
            title={ps.adminTitle}
            badge={ps.adminBadge}
            description={ps.adminDesc}
            ctaText={ps.adminCta}
            themeColor="purple"
            highlights={ps.adminHighlights}
          />

          {/* 4. Ambulance & Emergency */}
          <PortalCard
            id="portal-ambulance"
            to="/login/ambulance"
            icon={<Ambulance className="w-6 h-6" />}
            title={ps.ambulanceTitle}
            badge={ps.ambulanceBadge}
            description={ps.ambulanceDesc}
            ctaText={ps.ambulanceCta}
            themeColor="red"
            highlights={ps.ambulanceHighlights}
          />
        </div>
      </section>

      {/* Trust & Architecture Showcase Section */}
      <section id="security" className="relative z-10 px-4 sm:px-8 py-6 sm:py-10 max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 text-left">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#3435D8] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#171B2C] text-sm">
                {isHindi ? 'आयुष्मान भारत (ABDM)' : 'Ayushman Bharat (ABDM)'}
              </h4>
              <p className="text-xs text-[#737B91] leading-relaxed">
                {isHindi
                  ? 'ईएचआर और आभा (ABHA) स्वास्थ्य पते के साथ संपूर्ण M1, M2 और M3 डिजिटल स्वास्थ्य अनुपालन।'
                  : 'Full milestone M1, M2, and M3 compliance for interoperable electronic health records with ABHA health address mapping.'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#171B2C] text-sm">
                {isHindi ? 'स्प्रिंग सिक्योरिटी एवं RBAC' : 'Spring Security & RBAC'}
              </h4>
              <p className="text-xs text-[#737B91] leading-relaxed">
                {isHindi
                  ? 'केंद्रीकृत प्रमाणीकरण संरचना, JWT बेयरर टोकन, HttpOnly रिफ्रेश कुकीज़ और सर्वर-सत्यापित भूमिकाएं।'
                  : 'Centralized authentication architecture with JWT Bearer tokens, HttpOnly refresh cookies, and server-validated role authorization.'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#171B2C] text-sm">
                {isHindi ? 'रियल-टाइम टेलीमेट्री' : 'Real-time WebSocket & Telemetry'}
              </h4>
              <p className="text-xs text-[#737B91] leading-relaxed">
                {isHindi
                  ? 'लाइव टोकन कतार, बेड स्थिति और आपातकालीन 108 डिस्पैच समन्वय हेतु त्वरित STOMP/SockJS ब्रोकर।'
                  : 'STOMP / SockJS broker readiness for instantaneous live token changes, bed occupancy, and emergency dispatch pings.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="relative z-10 w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-6 px-4 sm:px-8 text-xs text-[#737B91] mt-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-7 h-7 rounded-lg bg-[#3435D8] text-white flex items-center justify-center font-bold text-xs">
              AG
            </div>
            <div>
              <p className="font-bold text-[#171B2C]">{ps.footerTagline}</p>
              <p className="text-[11px] text-[#737B91]">{ps.footerMinistry}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs">
            <Link to="/login/patient" className="hover:text-[#3435D8]">{ps.patientTitle}</Link>
            <Link to="/login/doctor" className="hover:text-[#3435D8]">{ps.doctorTitle}</Link>
            <Link to="/login/admin" className="hover:text-[#3435D8]">{ps.adminTitle}</Link>
            <Link to="/login/ambulance" className="hover:text-[#3435D8]">{ps.ambulanceTitle}</Link>
            <Link to="/register/patient" className="hover:text-[#3435D8]">{isHindi ? 'नया पंजीकरण' : 'New Registration'}</Link>
          </div>

          <div className="text-center md:text-right text-[11px]">
            <p>ISO 27001 Certified • HIPAA Ready</p>
            <p className="text-[#3435D8] font-semibold">{ps.tollFree}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
