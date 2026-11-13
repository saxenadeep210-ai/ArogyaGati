import React from 'react';
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
  Languages 
} from 'lucide-react';
import { LanguageSelector } from '../auth/LanguageSelector';

interface DashboardHeaderProps {
  portalName: string;
  portalColor: 'blue' | 'indigo' | 'purple' | 'red';
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  portalName,
  portalColor,
}) => {
  const { user, logout, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const badgeStyles = {
    blue: 'bg-blue-50 text-[#3435D8] border-blue-200',
    indigo: 'bg-indigo-50 text-[#2424B8] border-indigo-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    red: 'bg-red-50 text-[#DC4545] border-red-200',
  }[portalColor];

  return (
    <header className="w-full bg-white border-b border-slate-200/90 px-4 sm:px-6 py-2.5 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand + Active Portal Badge */}
        <div className="flex items-center gap-3">
          <Link to="/login" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-[#3435D8] text-white flex items-center justify-center shadow-xs">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#171B2C]">
                Arogya<span className="text-[#3435D8]">Gati</span>
              </span>
              <p className="text-[10px] text-[#737B91] leading-none hidden sm:block">
                Unified Healthcare Ecosystem
              </p>
            </div>
          </Link>

          <span className="hidden sm:inline-block text-slate-300">|</span>

          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wide uppercase ${badgeStyles}`}
          >
            {portalName}
          </span>

          {isDemoMode && (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
              DEMO
            </span>
          )}
        </div>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* User info chip */}
          {user && (
            <div className="hidden sm:flex items-center gap-2 pl-3 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-[#3435D8]/10 text-[#3435D8] flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0)}
              </div>
              <div className="text-left text-[11px] leading-tight">
                <p className="font-bold text-[#171B2C] truncate max-w-[140px]">{user.name}</p>
                <p className="text-[#737B91] text-[10px]">
                  {user.abhaId || user.doctorId || user.staffId || user.vehicleId || user.role}
                </p>
              </div>
            </div>
          )}

          {/* Return to Portal Switcher */}
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#171B2C] font-semibold text-xs transition"
            title="Switch between the 4 healthcare portals"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#3435D8]" />
            <span className="hidden md:inline">Portal Switcher</span>
          </Link>

          {/* Emergency Hotline */}
          <a
            href="tel:108"
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-50 text-[#DC4545] border border-red-200 font-bold text-xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>108</span>
          </a>

          {/* Language */}
          <div className="hidden sm:block">
            <LanguageSelector compact />
          </div>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-[#DC4545] border border-red-200/80 font-semibold text-xs transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
