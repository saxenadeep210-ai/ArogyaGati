import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  PhoneCall, 
  ShieldCheck, 
  UserCheck, 
  LogOut, 
  RotateCcw,
  Stethoscope,
  Truck,
  HeartPulse,
  User,
  SlidersHorizontal,
  Menu,
  X,
  LogIn,
  ChevronDown
} from 'lucide-react';
import { hospitalStore } from '../services/hospitalStore';
import { HOSPITAL_INFO } from '../services/mockData';
import { AuthUser, UserRole } from '../types';

interface NavbarProps {
  onOpenLogin: () => void;
  onNavigateHome: () => void;
  onNavigateToTab: (tab: string) => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenLogin, 
  onNavigateHome, 
  onNavigateToTab,
  activeTab 
}) => {
  const [user, setUser] = useState<AuthUser | null>(hospitalStore.getUser());
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    return hospitalStore.subscribe(() => {
      setUser(hospitalStore.getUser());
    });
  }, []);

  const handleRoleSwitch = (role: UserRole, docId?: string) => {
    hospitalStore.loginAsRole(role, docId);
    setRoleDropdownOpen(false);
    setMobileMenuOpen(false);
    if (role === 'PATIENT') onNavigateToTab('patient-dashboard');
    else if (role === 'AMBULANCE') onNavigateToTab('ambulance-dashboard');
    else if (role === 'DOCTOR') onNavigateToTab('doctor-desk');
    else if (role === 'STAFF_ADMIN') onNavigateToTab('admin-dashboard');
  };

  const navItems = [
    { id: 'landing', label: 'Home' },
    { id: 'patient-dashboard', label: 'Patient Portal' },
    { id: 'live-token', label: 'Live Queue' },
    { id: 'beds', label: 'Bed Tracker' },
    { id: 'doctors', label: 'Doctor Directory' },
    { id: 'guide-box', label: 'Doctor Guide Box' },
    { id: 'wayfinder', label: 'Wayfinder' },
    { id: 'admin-dashboard', label: 'Staff Admin' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm backdrop-blur-md bg-white/95">
      {/* Top Tiranga Government Strip */}
      <div className="h-1.5 w-full grid grid-cols-3">
        <div className="bg-[#FF9933]"></div>
        <div className="bg-white border-y border-slate-100"></div>
        <div className="bg-[#138808]"></div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group" 
            onClick={onNavigateHome}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-700 to-teal-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Arogya<span className="text-blue-700">Gati</span>
                </span>
                <span className="hidden sm:inline-flex items-center text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  Govt of UP / ABDM
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                {HOSPITAL_INFO.shortName} • Smart Patient Coordination
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigateToTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Controls: SOS 108, Role Switcher, Sign-In */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* 108 SOS Quick Call */}
            <a
              href="tel:108"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 shadow-sm shadow-red-500/20 transition"
              title="Emergency 108 Ambulance Hotline"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>SOS 108</span>
            </a>

            {/* Quick Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition"
                title="Switch portal role instantly"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-700" />
                <span className="hidden sm:inline text-slate-500">Role:</span>
                <span className="font-bold text-slate-900">
                  {user ? (user.role === 'PATIENT' ? 'Patient' :
                           user.role === 'AMBULANCE' ? '108 EMT' :
                           user.role === 'DOCTOR' ? 'Doctor Desk' : 'Staff Admin') : 'Select'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Switch Active Portal
                    </span>
                    <span className="text-[10px] text-teal-600 font-bold">Fast Switch</span>
                  </div>

                  <button
                    onClick={() => handleRoleSwitch('PATIENT')}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50 flex items-center gap-3 transition text-xs"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Patient / Citizen</div>
                      <div className="text-[10px] text-slate-500">OPD booking, tokens & guide box</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('AMBULANCE')}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-red-50 flex items-center gap-3 transition text-xs"
                  >
                    <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Ambulance 108 EMT</div>
                      <div className="text-[10px] text-slate-500">Emergency trauma dispatch</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('DOCTOR', 'DOC-ORTHO-1001')}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50 flex items-center gap-3 transition text-xs"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Doctor Desk (HOD)</div>
                      <div className="text-[10px] text-slate-500">Call patients & write prescriptions</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('STAFF_ADMIN')}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-purple-50 flex items-center gap-3 transition text-xs"
                  >
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                      <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Hospital Staff Admin</div>
                      <div className="text-[10px] text-slate-500">Bed matrix & doctor schedule sets</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Dedicated Login / Portal Access Button */}
            <button
              onClick={() => onNavigateToTab('login')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-blue-700 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 py-3 space-y-1 animate-in fade-in">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigateToTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

      </div>
    </header>
  );
};
