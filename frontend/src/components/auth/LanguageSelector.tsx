import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Languages } from 'lucide-react';

export const LanguageSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { activeLanguage, setLanguage } = useAuth();

  return (
    <div className="flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200 text-xs">
      <div className="pl-1.5 pr-1 text-[#737B91] flex items-center">
        <Languages className="w-3.5 h-3.5" />
      </div>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded font-medium transition cursor-pointer ${
          activeLanguage === 'en'
            ? 'bg-white text-[#171B2C] shadow-xs font-semibold'
            : 'text-[#737B91] hover:text-[#171B2C]'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`px-2 py-1 rounded font-medium transition cursor-pointer ${
          activeLanguage === 'hi'
            ? 'bg-white text-[#171B2C] shadow-xs font-semibold'
            : 'text-[#737B91] hover:text-[#171B2C]'
        }`}
      >
        हिंदी
      </button>
    </div>
  );
};
