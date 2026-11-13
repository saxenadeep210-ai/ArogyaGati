import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { authService } from '../../services/authService';
import { forgotPasswordSchema } from '../../utils/validation';
import { KeyRound, Mail, ArrowRight, CheckCircle2, Phone } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = forgotPasswordSchema.safeParse({ identifier });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Please enter valid details');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.requestPasswordReset(identifier);
      setSuccessMsg(res.message);
    } catch (err: any) {
      setError(err?.message || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Account Password"
      subtitle="Enter your registered mobile number, email, or institutional ID to receive recovery instructions."
      roleBadge={{
        text: 'Self-Service Credential Recovery',
        icon: <KeyRound className="w-3.5 h-3.5" />,
        colorClass: 'bg-slate-100 text-[#171B2C] border border-slate-200',
      }}
      backTo="/login"
      backText="Back to Login"
    >
      {successMsg ? (
        <div className="space-y-5 text-center py-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#171B2C]">Instructions Dispatched</h3>
            <p className="text-xs text-[#737B91] leading-relaxed max-w-sm mx-auto">
              {successMsg}
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3435D8] text-white text-xs font-semibold hover:bg-[#2424B8] transition"
          >
            <span>Return to Portal Selection</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Registered Mobile / Email / Staff ID"
            type="text"
            placeholder="e.g. 9812345678 or doc.malhotra@arogyagati.gov.in"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            error={error}
            icon={<Mail className="w-4 h-4" />}
            helperText="We'll send a secure reset OTP or verification link"
            required
          />

          <div className="pt-2">
            <AuthButton
              type="submit"
              isLoading={loading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Send Password Reset Instructions
            </AuthButton>
          </div>
        </form>
      )}

      <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-[#737B91]">
        <span>For government clinical staff emergency access lockout, call </span>
        <span className="font-semibold text-[#171B2C]">IT Help Desk: Ext 404</span>
      </div>
    </AuthLayout>
  );
};
