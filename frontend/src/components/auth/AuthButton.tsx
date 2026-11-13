import React from 'react';
import { Loader2 } from 'lucide-react';

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'emergency' | 'ghost';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  isLoading = false,
  variant = 'primary',
  children,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary:
      'bg-[#3435D8] hover:bg-[#2424B8] text-white shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 focus:ring-[#3435D8]/20 active:scale-[0.99]',
    secondary:
      'bg-white hover:bg-slate-50 text-[#171B2C] border border-slate-200 hover:border-slate-300 shadow-xs focus:ring-slate-200 active:scale-[0.99]',
    emergency:
      'bg-[#DC4545] hover:bg-[#b93838] text-white shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 focus:ring-[#DC4545]/20 active:scale-[0.99]',
    ghost:
      'bg-transparent hover:bg-slate-100/70 text-[#737B91] hover:text-[#171B2C] focus:ring-slate-100',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Authenticating...</span>
        </>
      ) : (
        <>
          {children}
          {icon && <span className="transition-transform group-hover:translate-x-0.5">{icon}</span>}
        </>
      )}
    </button>
  );
};
