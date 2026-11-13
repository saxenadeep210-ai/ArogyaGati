import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface PortalCardProps {
  id: string;
  to: string;
  icon: React.ReactNode;
  title: string;
  badge: string;
  description: string;
  ctaText: string;
  themeColor: 'blue' | 'indigo' | 'purple' | 'red';
  highlights?: string[];
}

export const PortalCard: React.FC<PortalCardProps> = ({
  to,
  icon,
  title,
  badge,
  description,
  ctaText,
  themeColor,
  highlights = [],
}) => {
  const colorThemes = {
    blue: {
      badgeBg: 'bg-blue-50 text-[#3435D8] border-blue-200/80',
      iconBg: 'bg-blue-50 text-[#3435D8] group-hover:bg-[#3435D8] group-hover:text-white',
      borderHover: 'hover:border-[#3435D8]/50 hover:shadow-indigo-500/10',
      ctaBtn: 'bg-[#3435D8] hover:bg-[#2424B8] text-white',
      accentGlow: 'from-blue-500/10 via-transparent to-transparent',
    },
    indigo: {
      badgeBg: 'bg-indigo-50 text-[#2424B8] border-indigo-200/80',
      iconBg: 'bg-indigo-50 text-[#2424B8] group-hover:bg-[#2424B8] group-hover:text-white',
      borderHover: 'hover:border-[#2424B8]/50 hover:shadow-indigo-500/10',
      ctaBtn: 'bg-[#2424B8] hover:bg-[#1a1a8c] text-white',
      accentGlow: 'from-indigo-500/10 via-transparent to-transparent',
    },
    purple: {
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200/80',
      iconBg: 'bg-purple-50 text-purple-700 group-hover:bg-purple-700 group-hover:text-white',
      borderHover: 'hover:border-purple-600/50 hover:shadow-purple-500/10',
      ctaBtn: 'bg-purple-700 hover:bg-purple-800 text-white',
      accentGlow: 'from-purple-500/10 via-transparent to-transparent',
    },
    red: {
      badgeBg: 'bg-red-50 text-[#DC4545] border-red-200/80',
      iconBg: 'bg-red-50 text-[#DC4545] group-hover:bg-[#DC4545] group-hover:text-white',
      borderHover: 'hover:border-[#DC4545]/50 hover:shadow-red-500/10',
      ctaBtn: 'bg-[#DC4545] hover:bg-[#b93838] text-white',
      accentGlow: 'from-red-500/10 via-transparent to-transparent',
    },
  };

  const currentTheme = colorThemes[themeColor];

  return (
    <Link
      to={to}
      className={`group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-md shadow-slate-200/50 ${currentTheme.borderHover} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden`}
    >
      {/* Subtle top subtle corner glow */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${currentTheme.accentGlow} rounded-bl-full pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-40`}
      />

      <div className="space-y-4">
        {/* Top Icon & Badge Row */}
        <div className="flex items-start justify-between">
          <div
            className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xs ${currentTheme.iconBg}`}
          >
            {icon}
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border tracking-wide uppercase ${currentTheme.badgeBg}`}
          >
            {badge}
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5 pt-1">
          <h3 className="text-xl font-bold tracking-tight text-[#171B2C] group-hover:text-[#3435D8] transition-colors">
            {title}
          </h3>
          <p className="text-xs sm:text-[13px] leading-relaxed text-[#737B91]">
            {description}
          </p>
        </div>

        {/* Highlights Pills */}
        {highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {highlights.map((item, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-[#737B91]"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="pt-6">
        <div
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-all duration-200 ${currentTheme.ctaBtn} group-hover:shadow-md`}
        >
          <span>{ctaText}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};
