import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthInput } from '../../components/auth/AuthInput';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { OTPVerification } from '../../components/auth/OTPVerification';
import { DemoCredentialsHelper } from '../../components/auth/DemoCredentialsHelper';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import {
  patientMobileSchema,
  patientAbhaSchema,
  emailLoginSchema,
} from '../../utils/validation';
import {
  Phone,
  CreditCard,
  Mail,
  ShieldCheck,
  UserCheck,
  HeartPulse,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

type TabKey = 'mobile' | 'abha' | 'email';

export const PatientLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>('mobile');

  // Mobile OTP state
  const [mobile, setMobile] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpError, setOtpError] = useState('');

  // ABHA state
  const [abhaId, setAbhaId] = useState('');
  const [abhaConsent, setAbhaConsent] = useState(true);
  const [abhaError, setAbhaError] = useState('');

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Common form state
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Quick fill demo handler
  const handleDemoFill = (cred: any) => {
    setMobile(cred.mobile);
    setAbhaId(cred.abhaId);
    setEmail(cred.email);
    setPassword(cred.password);
    setMobileError('');
    setAbhaError('');
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    setSuccessBanner('Demo credentials populated for Ramesh Sharma!');
  };

  // Option A: Send OTP
  const handleSendMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMobileError('');
    setGeneralError('');

    const validation = patientMobileSchema.safeParse({ mobile });
    if (!validation.success) {
      setMobileError(validation.error.issues[0]?.message || 'Invalid mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.sendOtp(mobile, 'patient');
      if (res.success) {
        setOtpStep(true);
        setSuccessBanner(res.message);
      } else {
        setGeneralError(res.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Server error while sending OTP');
    } finally {
      setLoading(false);
    }
  };

  // Option A: Verify OTP
  const handleVerifyOtp = async (otpCode: string) => {
    setOtpError('');
    setGeneralError('');
    setLoading(true);

    try {
      const res = await authService.loginWithPatientOtp(mobile, otpCode);
      if (res.success && res.user && res.token) {
        login(res.user, res.token);
        navigate('/dashboard/patient');
      } else {
        setOtpError(res.message || 'Invalid OTP code');
      }
    } catch (err: any) {
      setOtpError(err?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Option B: ABHA Login
  const handleAbhaLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAbhaError('');
    setGeneralError('');

    const validation = patientAbhaSchema.safeParse({ abhaId, consentGranted: abhaConsent });
    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      setAbhaError(firstIssue?.message || 'Please check ABHA details');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.loginWithAbha(abhaId, abhaConsent);
      if (res.success && res.user && res.token) {
        login(res.user, res.token);
        navigate('/dashboard/patient');
      } else {
        setGeneralError(res.message || 'ABHA verification failed');
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'ABHA gateway error');
    } finally {
      setLoading(false);
    }
  };

  // Option C: Email Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    const validation = emailLoginSchema.safeParse({ email, password });
    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        if (issue.path[0] === 'email') setEmailError(issue.message);
        if (issue.path[0] === 'password') setPasswordError(issue.message);
      });
      return;
    }

    setLoading(true);
    try {
      const res = await authService.loginPatientEmail(email, password);
      if (res.success && res.user && res.token) {
        login(res.user, res.token);
        navigate('/dashboard/patient');
      } else {
        setGeneralError(res.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back, Patient!"
      subtitle="Your healthcare journey, simplified. Access OPD tokens, digital prescriptions, and ABHA health records."
      roleBadge={{
        text: 'Citizen Patient Portal',
        icon: <HeartPulse className="w-3.5 h-3.5" />,
        colorClass: 'bg-blue-50 text-[#3435D8] border border-blue-200/80',
      }}
    >
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

      {/* If OTP Verification Step is active */}
      {otpStep ? (
        <div>
          <OTPVerification
            identifier={mobile}
            onVerify={handleVerifyOtp}
            onResend={async () => {
              await authService.sendOtp(mobile, 'patient');
            }}
            isLoading={loading}
            error={otpError}
            demoCode="123456"
          />
          <button
            type="button"
            onClick={() => setOtpStep(false)}
            className="mt-4 text-xs font-semibold text-[#737B91] hover:text-[#171B2C] cursor-pointer"
          >
            ← Change Mobile Number
          </button>
        </div>
      ) : (
        <>
          {/* Tab Selector */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('mobile');
                setGeneralError('');
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'mobile'
                  ? 'bg-white text-[#171B2C] shadow-xs font-bold'
                  : 'text-[#737B91] hover:text-[#171B2C]'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Mobile OTP</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('abha');
                setGeneralError('');
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'abha'
                  ? 'bg-white text-[#171B2C] shadow-xs font-bold'
                  : 'text-[#737B91] hover:text-[#171B2C]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>ABHA ID</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('email');
                setGeneralError('');
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-white text-[#171B2C] shadow-xs font-bold'
                  : 'text-[#737B91] hover:text-[#171B2C]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>
          </div>

          {/* Option A: Mobile OTP Login */}
          {activeTab === 'mobile' && (
            <form onSubmit={handleSendMobileOtp} className="space-y-4">
              <AuthInput
                label="Registered Mobile Number"
                type="tel"
                placeholder="e.g. 9812345678"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                error={mobileError}
                icon={<Phone className="w-4 h-4" />}
                helperText="10-digit number registered with hospital or ABHA"
                required
              />

              <div className="pt-2">
                <AuthButton
                  type="submit"
                  isLoading={loading}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Send Verification Code (OTP)
                </AuthButton>
              </div>
            </form>
          )}

          {/* Option B: ABHA Login */}
          {activeTab === 'abha' && (
            <form onSubmit={handleAbhaLogin} className="space-y-4">
              <AuthInput
                label="ABHA Number / ABHA Address"
                type="text"
                placeholder="14-5544-7788-9922 or username@abdm"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                error={abhaError}
                icon={<CreditCard className="w-4 h-4" />}
                helperText="Ayushman Bharat Digital Health Account"
                required
              />

              {/* Consent Box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="abha-consent"
                    checked={abhaConsent}
                    onChange={(e) => setAbhaConsent(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#3435D8] focus:ring-[#3435D8]"
                  />
                  <label htmlFor="abha-consent" className="text-[#171B2C] font-medium leading-relaxed">
                    I grant consent to ArogyaGati & ABDM to fetch my verified health records, OPD tokens, and lab summaries.
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <AuthButton
                  type="submit"
                  isLoading={loading}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Authenticate via ABDM
                </AuthButton>
              </div>
            </form>
          )}

          {/* Option C: Email Login */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <AuthInput
                label="Registered Email Address"
                type="email"
                placeholder="ramesh.sharma@healthmail.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <div>
                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={passwordError}
                  required
                />
                <div className="mt-1 text-right">
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
                  Sign In to Patient Portal
                </AuthButton>
              </div>
            </form>
          )}

          {/* 1-Click Demo Fill Assistant */}
          <DemoCredentialsHelper portal="patient" onFillDemo={handleDemoFill} />

          {/* Bottom Link for New Patient Registration */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-[#737B91]">
            <span>Don't have an ArogyaGati or ABHA account? </span>
            <Link
              to="/register/patient"
              className="font-bold text-[#3435D8] hover:underline inline-flex items-center gap-1"
            >
              <span>Create Patient Account</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </>
      )}
    </AuthLayout>
  );
};
