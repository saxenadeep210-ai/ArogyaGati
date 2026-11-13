import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthInput } from '../../components/auth/AuthInput';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { DemoCredentialsHelper } from '../../components/auth/DemoCredentialsHelper';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { adminLoginSchema } from '../../utils/validation';
import {
  Building2,
  ShieldCheck,
  Lock,
  KeyRound,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Fingerprint,
} from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  const [adminIdError, setAdminIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoFill = (cred: any) => {
    setAdminId(cred.adminId);
    setPassword(cred.password);
    setMfaCode(cred.mfaCode);
    setAdminIdError('');
    setPasswordError('');
    setMfaError('');
    setGeneralError('');
    setSuccessBanner('Loaded admin credentials for Rajesh Verma (Superintendent)');
  };

  const handlePrimarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminIdError('');
    setPasswordError('');
    setGeneralError('');

    const validation = adminLoginSchema.safeParse({ adminId, password, rememberMe: rememberDevice });
    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        if (issue.path[0] === 'adminId') setAdminIdError(issue.message);
        if (issue.path[0] === 'password') setPasswordError(issue.message);
      });
      return;
    }

    setLoading(true);
    try {
      // Step 1 check
      const res = await authService.loginAdmin(adminId, password);
      if (res.requiresMfa) {
        setRequiresMfa(true);
        setSuccessBanner(res.message);
      } else if (res.success && res.user && res.token) {
        login(res.user, res.token);
        navigate('/dashboard/admin');
      } else {
        setGeneralError(res.message || 'Administrative verification failed.');
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Server error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError('');
    setGeneralError('');

    if (!mfaCode || mfaCode.trim().length !== 6) {
      setMfaError('Please enter a 6-digit MFA security token.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.loginAdmin(adminId, password, mfaCode);
      if (res.success && res.user && res.token) {
        login(res.user, res.token);
        navigate('/dashboard/admin');
      } else {
        setMfaError(res.message || 'MFA validation failed.');
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Server authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Hospital Administration Portal"
      subtitle="Intelligent control for smarter hospital operations. Bed telemetry, ICU management, oxygen supplies, and personnel governance."
      roleBadge={{
        text: 'Zero-Trust Secure Admin Access',
        icon: <ShieldCheck className="w-3.5 h-3.5" />,
        colorClass: 'bg-purple-50 text-purple-700 border border-purple-200/80',
      }}
    >
      {/* Security Level Indicator */}
      <div className="mb-4 p-2.5 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold tracking-wide">Security Clearance Level 4</span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
          TLS 1.3 / AES-256
        </span>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* General Error Notification */}
      {generalError && (
        <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC4545] font-medium">
          {generalError}
        </div>
      )}

      {/* Step 2: MFA Verification Screen */}
      {requiresMfa ? (
        <form onSubmit={handleMfaSubmit} className="space-y-4">
          <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl text-left space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
              <Fingerprint className="w-4 h-4 text-purple-600" />
              <span>Multi-Factor Security Clearance</span>
            </div>
            <p className="text-[11px] text-[#737B91] leading-relaxed">
              Enter the 6-digit TOTP from your registered Government Authenticator App or hardware key.
            </p>
          </div>

          <AuthInput
            label="6-Digit MFA Security Token"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="e.g. 827104"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            error={mfaError}
            icon={<KeyRound className="w-4 h-4" />}
            helperText="Demo token: 827104 or 123456"
            required
          />

          <div className="pt-2">
            <AuthButton
              type="submit"
              isLoading={loading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Verify Token & Access Console
            </AuthButton>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setRequiresMfa(false)}
              className="text-xs font-semibold text-[#737B91] hover:text-[#171B2C] cursor-pointer"
            >
              ← Back to Primary Credentials
            </button>
          </div>
        </form>
      ) : (
        /* Step 1: Admin ID & Password */
        <form onSubmit={handlePrimarySubmit} className="space-y-4">
          <AuthInput
            label="Administrator ID or Official Gov Email"
            type="text"
            placeholder="e.g. ADMIN-ND-01 or admin.rajesh@arogyagati.gov.in"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            error={adminIdError}
            icon={<Building2 className="w-4 h-4" />}
            helperText="Hospital authority identification key"
            required
          />

          <div>
            <PasswordInput
              label="Administrative Password"
              placeholder="Enter secure master password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              required
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 text-[#737B91] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="rounded border-slate-300 text-[#3435D8] focus:ring-[#3435D8]"
                />
                <span className="text-[11px] font-medium">Enforce IP & Device Binding</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-semibold text-[#3435D8] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <AuthButton
              type="submit"
              isLoading={loading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Verify Credentials
            </AuthButton>
          </div>
        </form>
      )}

      {/* 1-Click Demo Fill Assistant */}
      <DemoCredentialsHelper portal="admin" onFillDemo={handleDemoFill} />

      <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-[#737B91]">
        <span>All admin access attempts are logged under </span>
        <span className="font-semibold text-[#171B2C]">National Cyber Security CERT-In Audit Logs</span>
      </div>
    </AuthLayout>
  );
};
