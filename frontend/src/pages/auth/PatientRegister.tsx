import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthInput } from '../../components/auth/AuthInput';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { patientRegisterSchema } from '../../utils/validation';
import {
  UserPlus,
  Phone,
  Mail,
  Calendar,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const PatientRegister: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [consentGranted, setConsentGranted] = useState(true);

  // Field errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    const validation = patientRegisterSchema.safeParse({
      fullName,
      mobile,
      email,
      dateOfBirth,
      gender,
      password,
      confirmPassword,
      consentGranted,
    });

    if (!validation.success) {
      const errMap: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        if (!errMap[fieldName]) {
          errMap[fieldName] = issue.message;
        }
      });
      setErrors(errMap);
      return;
    }

    setLoading(true);
    try {
      const res = await authService.registerPatient({
        fullName,
        mobile,
        email,
        dateOfBirth,
        gender,
        password,
      });

      if (res.success && res.user && res.token) {
        login(res.user, res.token);
        navigate('/dashboard/patient');
      } else {
        setGeneralError(res.message || 'Registration failed');
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Server error during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Patient Health Account"
      subtitle="Join India's unified healthcare network. Instant ABHA ID generation, fast OPD appointments, and digital health locker."
      roleBadge={{
        text: 'ABDM Citizen Registration',
        icon: <UserPlus className="w-3.5 h-3.5" />,
        colorClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
      }}
      backTo="/login/patient"
      backText="Back to Patient Login"
    >
      {generalError && (
        <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC4545] font-medium">
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
        <AuthInput
          label="Full Legal Name (as per Aadhaar)"
          type="text"
          placeholder="e.g. Ramesh Sharma"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AuthInput
            label="Mobile Number"
            type="tel"
            placeholder="10-digit mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
            error={errors.mobile}
            icon={<Phone className="w-4 h-4" />}
            required
          />

          <AuthInput
            label="Email Address (Optional)"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            icon={<Mail className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AuthInput
            label="Date of Birth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            error={errors.dateOfBirth}
            icon={<Calendar className="w-4 h-4" />}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-[#171B2C] mb-1.5">
              Gender <span className="text-[#DC4545]">*</span>
            </label>
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold h-[42px] items-center">
              {(['MALE', 'FEMALE', 'OTHER'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 py-1.5 rounded-lg transition capitalize cursor-pointer ${
                    gender === g
                      ? 'bg-white text-[#171B2C] shadow-xs font-bold'
                      : 'text-[#737B91] hover:text-[#171B2C]'
                  }`}
                >
                  {g.toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PasswordInput
            label="Password"
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />

          <PasswordInput
            label="Confirm Password"
            placeholder="Re-type password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            required
          />
        </div>

        {/* Consent Checkbox */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={consentGranted}
              onChange={(e) => setConsentGranted(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-[#3435D8] focus:ring-[#3435D8]"
            />
            <span className="text-[#171B2C] font-medium leading-relaxed">
              I consent to the processing of my healthcare records under the National Digital Health
              Mission (NDHM / ABDM) and hospital operational policy.
            </span>
          </label>
          {errors.consentGranted && (
            <p className="text-xs text-[#DC4545] font-semibold">{errors.consentGranted}</p>
          )}
        </div>

        <div className="pt-2">
          <AuthButton
            type="submit"
            isLoading={loading}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Create Account & Generate ABHA ID
          </AuthButton>
        </div>
      </form>

      <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-[#737B91]">
        <span>Already have an account? </span>
        <Link to="/login/patient" className="font-bold text-[#3435D8] hover:underline">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
};
