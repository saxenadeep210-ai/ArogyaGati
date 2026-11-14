import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HeartPulse, 
  LogOut, 
  LayoutGrid, 
  User, 
  ShieldCheck, 
  Activity, 
  PhoneCall, 
  Languages,
  CheckCircle2,
  ChevronDown,
  Building2,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { LanguageSelector } from '../auth/LanguageSelector';
import { useTranslation } from '../../utils/translations';

interface DashboardHeaderProps {
  portalName: string;
  portalColor: 'blue' | 'indigo' | 'purple' | 'red';
  onBack?: () => void;
  showBackButton?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  portalName,
  portalColor,
  onBack,
  showBackButton = true,
}) => {
  const { user, logout, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const { t, isHindi } = useTranslation();
  const [showMobileProfile, setShowMobileProfile] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/login');
    }
  };

  const portalThemes = {
    blue: {
      badge: 'bg-blue-50 text-[#3435D8] border-blue-200/80',
      dot: 'bg-[#3435D8]',
      border: 'border-blue-100',
    },
    indigo: {
      badge: 'bg-indigo-50 text-[#2424B8] border-indigo-200/80',
      dot: 'bg-[#2424B8]',
      dotPulse: 'bg-indigo-400',
      border: 'border-indigo-100',
    },
    purple: {
      badge: 'bg-purple-50 text-purple-700 border-purple-200/80',
      dot: 'bg-purple-600',
      border: 'border-purple-100',
    },
    red: {
      badge: 'bg-red-50 text-[#DC4545] border-red-200/80',
      dot: 'bg-[#DC4545]',
      border: 'border-red-100',
    },
  }[portalColor];

  return (
    <header className="w-full sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Sovereign National Micro-Strip (Tiranga) */}
      <div className="w-full h-[2.5px] grid grid-cols-3">
        <div className="bg-[#FF9933]"></div>
        <div className="bg-white border-y border-slate-100"></div>
        <div className="bg-[#138808]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-2 sm:py-2.5">
        <div className="flex items-center justify-between gap-1.5 sm:gap-3">
          
          {/* Left: Mobile Back Button + Brand Identity + Active Portal Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Top-Left Back Button for Mobile Web & Navigation */}
            {showBackButton && (
              <button
                type="button"
                onClick={handleBack}
                className="p-1.5 sm:p-2 -ml-1 text-slate-700 hover:text-[#3435D8] hover:bg-slate-100 active:scale-95 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer border border-slate-200/60"
                title={isHindi ? "वापस जाएं" : "Go Back"}
                aria-label="Back"
              >
                <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.4]" />
              </button>
            )}

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
                <p className="text-[10px] text-[#737B91] hidden lg:block font-medium tracking-wide">
                  National Digital Health Infrastructure • MoHFW
                </p>
              </div>
            </Link>

            <span className="hidden md:inline-block text-slate-300">|</span>

            {/* Role / Portal Indicator Pill */}
            <div className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border tracking-wide uppercase shadow-xs ${portalThemes.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${portalThemes.dot} animate-pulse`}></span>
              <span>{portalName}</span>
            </div>
          </div>

          {/* Right: User Profile & Quick Actions */}
          <div className="flex items-center gap-1 sm:gap-2 text-xs">
            {/* Authenticated User Identity Card (Desktop) */}
            {user && (
              <div className="hidden lg:flex items-center gap-2 pl-2.5 pr-3 py-1 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 rounded-xl transition">
                <div className="w-6 h-6 rounded-lg bg-[#3435D8] text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left text-[11px] leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[#171B2C] truncate max-w-[130px]">{user.name}</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  </div>
                  <span className="text-[#737B91] text-[10px] font-mono">
                    {user.abhaId || user.doctorId || user.staffId || user.vehicleId || user.role}
                  </span>
                </div>
              </div>
            )}

            {/* Mobile User Avatar with tap popup */}
            {user && (
              <button 
                onClick={() => setShowMobileProfile(!showMobileProfile)}
                className="lg:hidden w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#3435D8] flex items-center justify-center font-bold text-xs"
                title={user.name}
              >
                {user.name.charAt(0)}
              </button>
            )}

            {/* Switch Portal Button */}
            <Link
              to="/login"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#171B2C] font-semibold text-xs transition shadow-xs"
              title={t.nav.portals}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#3435D8]" />
              <span className="hidden md:inline">{t.nav.portals}</span>
            </Link>

            {/* Emergency Hotline 108 */}
            <a
              href="tel:108"
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-red-50 text-[#DC4545] hover:bg-red-100 border border-red-200 font-bold text-xs shadow-xs transition"
              title="108 Emergency Ambulance Hotline"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse text-[#DC4545]" />
              <span className="hidden sm:inline">108</span>
            </a>

            {/* Language Selector (Bilingual EN / HI) */}
            <div className="flex items-center">
              <LanguageSelector compact />
            </div>

            {/* Logout / Exit */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-[#DC4545] border border-slate-200 hover:border-red-200 font-semibold text-xs transition cursor-pointer shadow-xs"
              title={t.nav.logout}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.nav.logout}</span>
            </button>
          </div>
        </div>

        {/* Mobile Profile Dropdown Sheet */}
        {showMobileProfile && user && (
          <div className="lg:hidden mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#3435D8] text-white flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900 leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {user.abhaId || user.doctorId || user.staffId || user.vehicleId || user.role}
                </p>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${portalThemes.badge}`}>
              {portalName}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
