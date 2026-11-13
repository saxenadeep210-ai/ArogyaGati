import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthInput } from '../../components/auth/AuthInput';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { DemoCredentialsHelper } from '../../components/auth/DemoCredentialsHelper';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { doctorLoginSchema } from '../../utils/validation';
import {
  Stethoscope,
  Building,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock,
  Globe,
} from 'lucide-react';

export const DoctorLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [doctorId, setDoctorId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);

  const [doctorIdError, setDoctorIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoFill = (cred: any) => {
    setDoctorId(cred.doctorId);
    setPassword(cred.password);
    setDoctorIdError('');
    setPasswordError('');
    setGeneralError('');
    setSuccessBanner('Loaded credentials for Dr. Vikram Malhotra (Orthopedics HOD)');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDoctorIdError('');
    setPasswordError('');
    setGeneralError('');

    const validation = doctorLoginSchema.safeParse({ doctorId, password, rememberMe: rememberDevice });
    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        if (issue.path[0] === 'doctorId') setDoctorIdError(issue.message);
        if (issue.path[0] === 'password') setPasswordError(issue.message);
      });
      return;
    }

    setLoading(true);
    try {
      const res = await authService.loginDoctor(doctorId, password);
      if (res.success && res.user && res.token) {
        login(res.user, res.token);
        navigate('/dashboard/doctor');
      } else {
        setGeneralError(res.message || 'Authentication failed. Check credentials.');
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Server error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInstitutionalSso = () => {
    // Simulate National Health Informatics SSO
    setDoctorId('DOC-ORTHO-1001');
    setPassword('Doctor@2026');
    setSuccessBanner('NIC / National Health SSO token authenticated.');
  };

  return (
    <AuthLayout
      title="Welcome to Doctor's Desk"
      subtitle="Your clinical workspace, all in one place. Review today's queue, issue digital Rx, and access comprehensive EHR records."
      roleBadge={{
        text: 'Clinical Practitioner & Medical Staff',
        icon: <Stethoscope className="w-3.5 h-3.5" />,
        colorClass: 'bg-indigo-50 text-[#2424B8] border border-indigo-200/80',
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Doctor / Staff ID or Official Email"
          type="text"
          placeholder="e.g. DOC-ORTHO-1001 or dr.name@arogyagati.gov.in"
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          error={doctorIdError}
          icon={<Stethoscope className="w-4 h-4" />}
          helperText="Unique institutional clinician ID"
          required
        />

        <div>
          <PasswordInput
            label="Staff Password"
            placeholder="Enter clinical account password"
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
              <span className="text-[11px] font-medium">Remember this workstation</span>
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
            Secure Staff Login
          </AuthButton>
        </div>

        {/* Institutional SSO Shortcut */}
        <div className="relative py-2 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-2.5 text-[11px] uppercase tracking-wider text-[#737B91]">
            Or Hospital Federation
          </span>
        </div>

        <button
          type="button"
          onClick={handleInstitutionalSso}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-[#171B2C] transition cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-[#3435D8]" />
          <span>Login with NIC / MoHFW Institutional SSO</span>
        </button>
      </form>

      {/* 1-Click Demo Fill Assistant */}
      <DemoCredentialsHelper portal="doctor" onFillDemo={handleDemoFill} />

      <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-[#737B91]">
        <span>Need staff credential clearance? Contact </span>
        <span className="font-semibold text-[#171B2C]">Medical Superintendent Office Ext: 204</span>
      </div>
    </AuthLayout>
  );
};
