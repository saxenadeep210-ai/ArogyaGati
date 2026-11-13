import React, { useState, useEffect, useRef } from 'react';
import { AuthButton } from './AuthButton';
import { RefreshCw, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface OTPVerificationProps {
  identifier: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  isLoading?: boolean;
  error?: string;
  demoCode?: string;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  identifier,
  onVerify,
  onResend,
  isLoading = false,
  error = '',
  demoCode = '123456',
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    // Only accept numeric
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal && value !== '') return;

    const newDigits = [...digits];

    if (cleanVal.length > 1) {
      // Pasted string
      const pasted = cleanVal.slice(0, 6).split('');
      pasted.forEach((char, idx) => {
        if (index + idx < 6) {
          newDigits[index + idx] = char;
        }
      });
      setDigits(newDigits);
      const nextIdx = Math.min(index + pasted.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    newDigits[index] = cleanVal;
    setDigits(newDigits);

    // Auto advance
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleAutoFillDemo = () => {
    const chars = demoCode.split('');
    setDigits(chars);
    inputRefs.current[5]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = digits.join('');
    if (fullOtp.length === 6) {
      onVerify(fullOtp);
    }
  };

  const handleResendClick = async () => {
    if (!canResend || resending) return;
    setResending(true);
    try {
      await onResend();
      setCountdown(60);
      setCanResend(false);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setResending(false);
    }
  };

  const isComplete = digits.every((d) => d.length === 1);

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-center">
      <div className="space-y-1">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-[#3435D8] mb-2">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[#171B2C]">Verify One-Time Password</h3>
        <p className="text-xs text-[#737B91]">
          We sent a 6-digit verification code to{' '}
          <span className="font-semibold text-[#171B2C]">{identifier}</span>
        </p>
      </div>

      {/* Demo Pill */}
      {demoCode && (
        <button
          type="button"
          onClick={handleAutoFillDemo}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Demo Code: {demoCode} (Click to Auto-fill)</span>
        </button>
      )}

      {/* 6 Digit Inputs */}
      <div className="flex justify-center items-center gap-2 sm:gap-3 py-2">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border bg-white outline-none transition-all duration-200 ${
              digit
                ? 'border-[#3435D8] ring-2 ring-[#3435D8]/10 text-[#171B2C]'
                : 'border-slate-200 hover:border-slate-300 text-[#171B2C]'
            } focus:border-[#3435D8] focus:ring-4 focus:ring-[#3435D8]/15`}
          />
        ))}
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC4545] font-medium flex items-center justify-center gap-1.5">
          <span>{error}</span>
        </div>
      )}

      <AuthButton type="submit" isLoading={isLoading} disabled={!isComplete}>
        Verify and Continue
      </AuthButton>

      {/* Resend Countdown */}
      <div className="pt-2 text-xs text-[#737B91] flex items-center justify-center gap-2">
        {canResend ? (
          <button
            type="button"
            onClick={handleResendClick}
            disabled={resending}
            className="font-semibold text-[#3435D8] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            Resend OTP
          </button>
        ) : (
          <span>
            Resend code in <span className="font-bold text-[#171B2C]">{countdown}s</span>
          </span>
        )}
      </div>
    </form>
  );
};
