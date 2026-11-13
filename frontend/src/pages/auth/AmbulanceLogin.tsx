import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthInput } from '../../components/auth/AuthInput';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { DemoCredentialsHelper } from '../../components/auth/DemoCredentialsHelper';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { ambulanceLoginSchema } from '../../utils/validation';
import {
  Ambulance,
  Phone,
  ShieldAlert,
  ArrowRight,
  Radio,
  Zap,
  Sparkles,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

export const AmbulanceLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [mobile, setMobile] = useState('');
  const [authMethod, setAuthMethod] = useState<'OTP' | 'PASSWORD'>('OTP');
  const [secret, setSecret] = useState('123456');

  const [vehicleError, setVehicleError] = useState('');
  const [driverError, setDriverError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [secretError, setSecretError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoFill = (cred: any) => {
    setVehicleId(cred.vehicleId);
    setDriverId(cred.driverId);
    setMobile(cred.mobile);
    setSecret(cred.password);
    setAuthMethod('PASSWORD');
    setVehicleError('');
    setDriverError('');
    setMobileError('');
    setSecretError('');
    setGeneralError('');
    setSuccessBanner('Loaded emergency ALS Ambulance 108 unit credentials');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVehicleError('');
    setDriverError('');
    setMobileError('');
    setSecretError('');
    setGeneralError('');

    const validation = ambulanceLoginSchema.safeParse({
      vehicleId,
      driverId,
      mobile,
      authMethod,
      password: secret,
    });

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        if (issue.path[0] === 'vehicleId') setVehicleError(issue.message);
        if (issue.path[0] === 'driverId') setDriverError(issue.message);
        if (issue.path[0] === 'mobile') setMobileError(issue.message);
      });
      return;
    }

    setLoading(true);
    try {
      const res = await authService.loginAmbulance(
        vehicleId,
        driverId,
        mobile,
        authMethod,
        secret
      );
      if (res.success && res.user && res.token) {
        login(res.user, res.token);
        navigate('/dashboard/ambulance');
      } else {
        setGeneralError(res.message || 'Emergency verification failed.');
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Server error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Emergency Response Portal"
      subtitle="Every second matters. Stay connected. Respond faster. GPS dispatch, pre-arrival ER alerts, and trauma desk handshake."
      roleBadge={{
        text: 'Priority 108 Emergency Dispatch',
        icon: <Ambulance className="w-3.5 h-3.5" />,
        colorClass: 'bg-red-50 text-[#DC4545] border border-red-200/80',
      }}
    >
      {/* Rapid Response Notice */}
      <div className="mb-4 p-2.5 rounded-xl bg-red-50/80 border border-red-200 text-xs text-red-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#DC4545] animate-pulse shrink-0" />
          <span className="font-semibold">Central Emergency Dispatch Active</span>
        </div>
        <span className="text-[10px] font-bold text-[#DC4545] bg-white px-2 py-0.5 rounded border border-red-200">
          Fast-Track Auth
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vehicle ID & Driver ID row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AuthInput
            label="Ambulance / Vehicle ID"
            type="text"
            placeholder="e.g. AMB-UP80-108"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value.toUpperCase())}
            error={vehicleError}
            helperText="Vehicle reg / Fleet ID"
            required
          />

          <AuthInput
            label="Driver / Paramedic ID"
            type="text"
            placeholder="e.g. PARAMED-4091"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value.toUpperCase())}
            error={driverError}
            helperText="Staff identification"
            required
          />
        </div>

        <AuthInput
          label="Registered Mobile Number"
          type="tel"
          placeholder="e.g. 9911223344"
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
          error={mobileError}
          icon={<Phone className="w-4 h-4" />}
          helperText="10-digit registered dispatch phone"
          required
        />

        {/* Verification Method Toggle */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('OTP');
              setSecret('123456');
            }}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              authMethod === 'OTP'
                ? 'bg-white text-[#171B2C] shadow-xs font-bold'
                : 'text-[#737B91] hover:text-[#171B2C]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Emergency OTP (123456)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('PASSWORD');
              setSecret('');
            }}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              authMethod === 'PASSWORD'
                ? 'bg-white text-[#171B2C] shadow-xs font-bold'
                : 'text-[#737B91] hover:text-[#171B2C]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Station Password</span>
          </button>
        </div>

        {authMethod === 'OTP' ? (
          <AuthInput
            label="Emergency Verification Code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit OTP (demo: 123456)"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            error={secretError}
            helperText="Default demo code: 123456"
            required
          />
        ) : (
          <div>
            <PasswordInput
              label="Station Dispatch Password"
              placeholder="Enter password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              error={secretError}
              required
            />
            <div className="mt-1 text-right">
              <Link
                to="/forgot-password"
                className="text-[11px] font-semibold text-[#DC4545] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
        )}

        <div className="pt-2">
          <AuthButton
            type="submit"
            variant="emergency"
            isLoading={loading}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Authenticate & Launch Dispatch Telemetry
          </AuthButton>
        </div>
      </form>

      {/* 1-Click Demo Fill Assistant */}
      <DemoCredentialsHelper portal="ambulance" onFillDemo={handleDemoFill} />

      <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-[#737B91]">
        <span>For priority fleet rerouting assistance, call </span>
        <span className="font-bold text-[#DC4545]">National Emergency Dispatch 108</span>
      </div>
    </AuthLayout>
  );
};
