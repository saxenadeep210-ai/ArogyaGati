import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  helperText,
  required,
  className = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `password-${label.toLowerCase().replace(/\s+/g, '-')}`;

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
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#737B91]">
          <Lock className="w-4 h-4" />
        </div>
        <input
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          className={`w-full block text-sm font-medium text-[#171B2C] placeholder-[#737B91]/70 bg-white rounded-xl border transition-all duration-200 pl-10 pr-10 py-2.5 ${
            error
              ? 'border-[#DC4545] focus:border-[#DC4545] focus:ring-4 focus:ring-[#DC4545]/10'
              : 'border-slate-200 hover:border-slate-300 focus:border-[#3435D8] focus:ring-4 focus:ring-[#3435D8]/10'
          } outline-none ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#737B91] hover:text-[#171B2C] transition-colors focus:outline-none"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
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
