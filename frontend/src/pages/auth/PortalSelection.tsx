import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PortalCard } from '../../components/auth/PortalCard';
import { LanguageSelector } from '../../components/auth/LanguageSelector';
import { useAuth } from '../../context/AuthContext';
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
  const { activeLanguage, isDemoMode, isAuthenticated, user, getDashboardRouteForRole, logout } = useAuth();
  const [activeModalInfo, setActiveModalInfo] = useState<string | null>(null);

  // Translations dictionary for bilingual support
  const t = {
    en: {
      badge: 'Unified Digital Healthcare Architecture • Government of India',
      heroTitle: 'Welcome to ArogyaGati',
      heroSubtitle: 'One Platform. Four Portals. Connected Healthcare.',
      heroDescription:
        'Your unified digital gateway to smarter, faster and more accessible healthcare services. Designed for seamless collaboration between citizens, clinical practitioners, administrative directors, and first responders.',
      liveHospitalStatus: 'Live Hospital Operational Status (Simulated)',
      patientTitle: 'Patient Login',
      patientDesc:
        'Access OPD appointments, digital health records (ABHA), e-prescriptions and live token queue updates in real-time.',
      patientCta: 'Continue as Patient',
      doctorTitle: 'Doctor & Medical Staff',
      doctorDesc:
        'Manage clinical consultations, patient queues, EHR/EMR diagnostic records, and multi-disciplinary referral workflows.',
      doctorCta: "Access Doctor's Desk",
      adminTitle: 'Hospital Administrator',
      adminDesc:
        'Monitor institutional bed occupancy, ICU oxygen telemetry, pharmacy inventory, doctor rostering and operational analytics.',
      adminCta: 'Admin Login',
      ambulanceTitle: 'Emergency Response Team',
      ambulanceDesc:
        'Coordinate rapid emergency dispatch, live GPS telemetry, hospital pre-arrival alerts and ALS/BLS paramedic communications.',
      ambulanceCta: 'Emergency Login',
    },
    hi: {
      badge: 'एकीकृत डिजिटल स्वास्थ्य अवसंरचना • भारत सरकार',
      heroTitle: 'आरोग्यगति में आपका स्वागत है',
      heroSubtitle: 'एक मंच। चार प्रवेश द्वार। सुरक्षित स्वास्थ्य सेवा।',
      heroDescription:
        'स्मार्ट, त्वरित और सुलभ स्वास्थ्य सेवाओं के लिए आपका एकीकृत डिजिटल प्रवेश द्वार। नागरिकों, चिकित्सकों, प्रशासनिक निदेशकों और आपातकालीन दलों के बीच निर्बाध सहयोग हेतु निर्मित।',
      liveHospitalStatus: 'लाइव अस्पताल परिचालन स्थिति (डेमो डेटा)',
      patientTitle: 'मरीज़ प्रवेश (Patient Login)',
      patientDesc:
        'ओपीडी अपॉइंटमेंट, डिजिटल स्वास्थ्य रिकॉर्ड (ABHA), ई-पर्चे और लाइव टोकन कतार की वास्तविक समय स्थिति देखें।',
      patientCta: 'मरीज़ के रूप में आगे बढ़ें',
      doctorTitle: 'चिकित्सक एवं मेडिकल स्टाफ',
      doctorDesc:
        'परामर्श, मरीज़ कतार, नैदानिक रिकॉर्ड (EHR) और विशेषज्ञ रेफरल वर्कफ़्लो का प्रबंधन करें।',
      doctorCta: "डॉक्टर डेस्क पर जाएं",
      adminTitle: 'अस्पताल प्रशासक (Admin)',
      adminDesc:
        'बेड उपलब्धता, आईसीयू ऑक्सीजन, दवा इन्वेंट्री, डॉक्टर रोस्टर और अस्पताल विश्लेषण की निगरानी करें।',
      adminCta: 'प्रशासक लॉगिन',
      ambulanceTitle: 'आपातकालीन प्रतिक्रिया दल',
      ambulanceDesc:
        'त्वरित एम्बुलेंस डिस्पैच, लाइव जीपीएस ट्रैकिंग, अस्पताल पूर्व-आगमन अलर्ट और पैरामेडिक समन्वय।',
      ambulanceCta: 'आपातकालीन लॉगिन',
    },
  }[activeLanguage];

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

      {/* Top Header */}
      <header className="relative z-20 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Emblem */}
          <Link to="/login" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#3435D8] text-white flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:bg-[#2424B8] transition-colors">
              <HeartPulse className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[#171B2C]">
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

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#737B91]">
            <a href="#portals" className="text-[#171B2C] hover:text-[#3435D8] transition-colors">
              Portals
            </a>
            <a href="#hospital-status" className="hover:text-[#3435D8] transition-colors">
              Live Hospital Status
            </a>
            <a href="#about" className="hover:text-[#3435D8] transition-colors">
              About Platform
            </a>
            <a href="#security" className="hover:text-[#3435D8] transition-colors">
              Security & Compliance
            </a>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* If logged in, show active session shortcut */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-2">
                <Link
                  to={getDashboardRouteForRole(user.role)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-[#3435D8] text-xs font-bold hover:bg-indigo-100 transition"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Resume {user.portal}</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-xs text-[#737B91] hover:text-red-600 px-2 py-1 font-semibold cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            )}

            {/* Emergency Hotline 108 */}
            <a
              href="tel:108"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-[#DC4545] border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              <span>108 Helpline</span>
            </a>

            {/* Language Switcher */}
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-10 sm:pt-14 pb-8 sm:pb-12 px-4 sm:px-8 text-center max-w-5xl mx-auto space-y-6">
        {/* National Health Mission Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-xs text-xs font-medium text-[#737B91]">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[#171B2C] font-semibold">{t.badge}</span>
        </div>

        {/* Headings */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#171B2C] leading-[1.15]">
            {t.heroTitle}
          </h1>
          <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-[#3435D8] via-indigo-600 to-[#2424B8] bg-clip-text text-transparent">
            {t.heroSubtitle}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-base text-[#737B91] max-w-2xl mx-auto leading-relaxed">
          {t.heroDescription}
        </p>

        {/* Live Hospital Telemetry Banner (Hackathon Feature) */}
        <div id="hospital-status" className="pt-2">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 shadow-sm max-w-3xl mx-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#3435D8]" />
                <span className="text-xs font-bold text-[#171B2C]">{t.liveHospitalStatus}</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                AIIMS New Delhi Central Hub • Live
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-[10px] font-semibold text-[#737B91] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#3435D8]" />
                  <span>OPD Wait Time</span>
                </div>
                <div className="text-base font-extrabold text-[#171B2C] mt-0.5">~14 Mins</div>
                <div className="text-[9px] text-emerald-600 font-medium">Optimal flow (Token #42)</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-[10px] font-semibold text-[#737B91] flex items-center gap-1">
                  <BedDouble className="w-3 h-3 text-purple-600" />
                  <span>Bed Availability</span>
                </div>
                <div className="text-base font-extrabold text-[#171B2C] mt-0.5">142 Free</div>
                <div className="text-[9px] text-[#737B91] font-medium">18 ICU • 24 HDU Beds</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-[10px] font-semibold text-[#737B91] flex items-center gap-1">
                  <Ambulance className="w-3 h-3 text-[#DC4545]" />
                  <span>Ambulance 108</span>
                </div>
                <div className="text-base font-extrabold text-[#171B2C] mt-0.5">16 Active</div>
                <div className="text-[9px] text-[#DC4545] font-medium">4 On Urgent Dispatch</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-[10px] font-semibold text-[#737B91] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Trauma Ready</span>
                </div>
                <div className="text-base font-extrabold text-emerald-600 mt-0.5">Level-1</div>
                <div className="text-[9px] text-emerald-600 font-medium">Code Green: 100% Ready</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main 4 Portals Grid Section */}
      <section id="portals" className="relative z-10 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#171B2C]">
            Select Your Designated Health Portal
          </h2>
          <p className="text-xs sm:text-sm text-[#737B91] mt-1">
            Choose your authorized user category to enter your secure workspace.
          </p>
        </div>

        {/* 4 Dedicated Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Patient Portal */}
          <PortalCard
            id="portal-patient"
            to="/login/patient"
            icon={<UserRound className="w-6 h-6" />}
            title={t.patientTitle}
            badge="Citizen Health"
            description={t.patientDesc}
            ctaText={t.patientCta}
            themeColor="blue"
            highlights={['ABHA Login', 'Mobile OTP', 'OPD Tokens', 'Prescriptions']}
          />

          {/* 2. Doctor's Desk */}
          <PortalCard
            id="portal-doctor"
            to="/login/doctor"
            icon={<Stethoscope className="w-6 h-6" />}
            title={t.doctorTitle}
            badge="Clinical Desk"
            description={t.doctorDesc}
            ctaText={t.doctorCta}
            themeColor="indigo"
            highlights={['Live Queue', 'Digital Rx', 'EMR Access', 'Staff ID SSO']}
          />

          {/* 3. Hospital Admin */}
          <PortalCard
            id="portal-admin"
            to="/login/admin"
            icon={<Building2 className="w-6 h-6" />}
            title={t.adminTitle}
            badge="Command Center"
            description={t.adminDesc}
            ctaText={t.adminCta}
            themeColor="purple"
            highlights={['Zero-Trust MFA', 'ICU Beds', 'Oxygen Level', 'Resource Audit']}
          />

          {/* 4. Ambulance & Emergency */}
          <PortalCard
            id="portal-ambulance"
            to="/login/ambulance"
            icon={<Ambulance className="w-6 h-6" />}
            title={t.ambulanceTitle}
            badge="Priority 108"
            description={t.ambulanceDesc}
            ctaText={t.ambulanceCta}
            themeColor="red"
            highlights={['Vehicle ID', 'Paramedic 1-Tap', 'GPS Sync', 'ER Alerts']}
          />
        </div>
      </section>

      {/* Trust & Architecture Showcase Section */}
      <section id="security" className="relative z-10 px-4 sm:px-8 py-10 max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#3435D8] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#171B2C] text-sm">Ayushman Bharat (ABDM)</h4>
              <p className="text-xs text-[#737B91] leading-relaxed">
                Full milestone M1, M2, and M3 compliance for interoperable electronic health records
                with ABHA health address mapping.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#171B2C] text-sm">Spring Security & RBAC</h4>
              <p className="text-xs text-[#737B91] leading-relaxed">
                Centralized authentication architecture with JWT Bearer tokens, HttpOnly refresh cookies,
                and server-validated role authorization.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#171B2C] text-sm">Real-time WebSocket & Telemetry</h4>
              <p className="text-xs text-[#737B91] leading-relaxed">
                STOMP / SockJS broker readiness for instantaneous live token changes, bed occupancy,
                and emergency dispatch pings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="relative z-10 w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-6 px-4 sm:px-8 text-xs text-[#737B91] mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-7 h-7 rounded-lg bg-[#3435D8] text-white flex items-center justify-center font-bold text-xs">
              AG
            </div>
            <div>
              <p className="font-bold text-[#171B2C]">ArogyaGati Hospital Operating Network</p>
              <p className="text-[11px] text-[#737B91]">Ministry of Health & Family Welfare • Government of India</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
            <Link to="/login/patient" className="hover:text-[#3435D8]">Patient Portal</Link>
            <Link to="/login/doctor" className="hover:text-[#3435D8]">Doctor Desk</Link>
            <Link to="/login/admin" className="hover:text-[#3435D8]">Hospital Admin</Link>
            <Link to="/login/ambulance" className="hover:text-[#3435D8]">Ambulance 108</Link>
            <Link to="/register/patient" className="hover:text-[#3435D8]">New Registration</Link>
          </div>

          <div className="text-right text-[11px]">
            <p>ISO 27001 Certified • HIPAA Ready</p>
            <p className="text-[#3435D8] font-semibold">Toll-Free Health Desk: 1800-11-4477</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
