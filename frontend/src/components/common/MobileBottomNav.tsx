import React from 'react';
import { Home, Ticket, LayoutGrid, Sparkles, User, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../utils/translations';

interface MobileBottomNavProps {
  onOpenCommandBar: () => void;
  onOpenMyToken?: () => void;
  onOpenServices?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenCommandBar,
  onOpenMyToken,
  onOpenServices,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, isHindi } = useTranslation();

  const isCurrent = (path: string) => location.pathname === path;

  return (
    <nav 
      aria-label="Mobile Bottom Navigation" 
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5"
    >
      <div className="grid grid-cols-5 items-center justify-around">
        
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition ${
            isCurrent('/login') || isCurrent('/')
              ? 'text-blue-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Portals Home"
          aria-current={isCurrent('/login') ? 'page' : undefined}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">{isHindi ? 'होम' : 'Home'}</span>
        </button>

        {/* 2. My Token */}
        <button
          type="button"
          onClick={() => {
            if (onOpenMyToken) {
              onOpenMyToken();
            } else {
              navigate('/dashboard/patient');
            }
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition ${
            isCurrent('/dashboard/patient')
              ? 'text-blue-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Active Token & OPD Queue"
        >
          <Ticket className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">{isHindi ? 'मेरा टोकन' : 'My Token'}</span>
        </button>

        {/* 3. Command Bar / Omni Search (Center Floating Action) */}
        <button
          type="button"
          onClick={onOpenCommandBar}
          className="flex flex-col items-center justify-center -mt-4 bg-gradient-to-tr from-[#3435D8] to-indigo-600 text-white rounded-2xl w-12 h-12 shadow-lg shadow-indigo-500/30 mx-auto transition active:scale-95 cursor-pointer"
          aria-label="Open Hospital Omni-Search and Voice Assistant"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* 4. Services */}
        <button
          type="button"
          onClick={() => {
            if (onOpenServices) {
              onOpenServices();
            } else {
              onOpenCommandBar();
            }
          }}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-slate-500 hover:text-slate-800 transition cursor-pointer"
          aria-label="Hospital Services"
        >
          <LayoutGrid className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">{isHindi ? 'सेवाएं' : 'Services'}</span>
        </button>

        {/* 5. Profile / Role Desk */}
        <button
          type="button"
          onClick={() => {
            if (user?.role === 'PATIENT') navigate('/dashboard/patient');
            else if (user?.role === 'DOCTOR') navigate('/dashboard/doctor');
            else if (user?.role === 'ADMIN') navigate('/dashboard/admin');
            else if (user?.role === 'AMBULANCE') navigate('/dashboard/ambulance');
            else navigate('/login');
          }}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-slate-500 hover:text-slate-800 transition cursor-pointer"
          aria-label="User Profile or Portal"
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">{isHindi ? 'प्रोफ़ाइल' : 'Profile'}</span>
        </button>
      </div>
    </nav>
  );
};
