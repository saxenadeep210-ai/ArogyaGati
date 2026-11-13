import React from 'react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  icon,
  error,
  helperText,
  required,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="w-full text-left space-y-1.5">
      <div className="flex justify-between items-center">
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#171B2C]">
          {label} {required && <span className="text-[#DC4545]">*</span>}
        </label>
        {helperText && !error && (
          <span className="text-[11px] text-[#737B91]">{helperText}</span>
        )}
      </div>

      <div className="relative rounded-xl shadow-xs transition">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737B91]">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full block text-sm font-medium text-[#171B2C] placeholder-[#737B91]/70 bg-white rounded-xl border transition-all duration-200 ${
            icon ? 'pl-10 pr-3.5' : 'px-3.5'
          } py-2.5 ${
            error
              ? 'border-[#DC4545] focus:border-[#DC4545] focus:ring-4 focus:ring-[#DC4545]/10'
              : 'border-slate-200 hover:border-slate-300 focus:border-[#3435D8] focus:ring-4 focus:ring-[#3435D8]/10'
          } outline-none ${className}`}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs text-[#DC4545] flex items-center gap-1 font-medium mt-1">
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
