import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { hospitalStore } from '../../services/hospitalStore';
import { useTranslation } from '../../utils/translations';
import {
  Ambulance,
  Phone,
  Radio,
  Zap,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Truck,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const AmbulanceLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, isHindi } = useTranslation();

  // Login form state
  const [mobile, setMobile] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Instant Emergency Token Generator states (Promise fulfillment)
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyCat, setEmergencyCat] = useState<'TRAUMA' | 'CARDIAC' | 'STROKE' | 'MATERNAL'>('TRAUMA');
  const [patientDesc, setPatientDesc] = useState('');
  const [eta, setEta] = useState(10);
  const [generatedEmergencyToken, setGeneratedEmergencyToken] = useState<any | null>(null);

  // 1-Click Fast Duty Login for EMT Crew
  const handleFastEMTLogin = async () => {
    setLoading(true);
    setGeneralError('');
    try {
      const res = await authService.loginAmbulance(
        'AMB-UP80-108',
        'PARAMED-4091',
        '9911223344',
        'OTP',
        '123456'
      );
      if (res.success && res.user && res.token) {
        login(res.user, res.token);
        navigate('/dashboard/ambulance');
      } else {
        setGeneralError(res.message || 'Fast duty login failed.');
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    if (!mobile || mobile.length < 10) {
      setGeneralError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.loginAmbulance(
        vehicleId || 'AMB-UP80-108',
        'PARAMED-4091',
        mobile,
        'OTP',
        '123456'
      );
      if (res.success && res.user && res.token) {
        login(res.user, res.token);
        navigate('/dashboard/ambulance');
      } else {
        setGeneralError(res.message || 'Verification failed.');
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Server error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEmergencyToken = (e: React.FormEvent) => {
    e.preventDefault();
    const newCase = hospitalStore.registerEmergencyCase({
      ambulanceId: 'AMB-108-EMG',
      ambulanceRegNo: 'UP-80-EMERGENCY',
      attendantId: 'ATT-108',
      attendantName: 'Emergency Paramedic Unit',
      patientName: patientDesc.trim() || 'Unknown Emergency Patient (108 Casualty)',
      patientAge: 35,
      gender: 'MALE',
      category: emergencyCat,
      severity: 'CRITICAL',
      description: `Immediate inbound casualty alert: ${emergencyCat}`,
      incidentLocation: 'In Transit to Casualty Block',
      etaMinutes: Number(eta) || 10,
      vitals: {
        bloodPressure: '110/70',
        pulseRate: 110,
        spO2: 95,
        consciousness: 'Emergency Triage'
      }
    });

    setGeneratedEmergencyToken(newCase);
  };

  return (
    <AuthLayout
      title={t.ambulance.title}
      subtitle={t.ambulance.subtitle}
      roleBadge={{
        text: 'Priority 108 Emergency Dispatch',
        icon: <Ambulance className="w-3.5 h-3.5" />,
        colorClass: 'bg-red-50 text-[#DC4545] border border-red-200/80',
      }}
    >
      {/* INSTANT EMERGENCY TOKEN GENERATION BANNER (No Login Required) */}
      <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <span className="text-xs font-black uppercase tracking-wider">
              {t.ambulance.quickEmergencyToken}
            </span>
          </div>
          <span className="text-[10px] bg-white/20 font-bold px-2 py-0.5 rounded">
            Immediate 108
          </span>
        </div>

        <p className="text-xs text-rose-100 leading-relaxed">
          {t.ambulance.quickEmergencyTokenDesc}
        </p>

        <button
          type="button"
          onClick={() => { setShowEmergencyModal(true); setGeneratedEmergencyToken(null); }}
          className="w-full py-2.5 bg-white hover:bg-rose-50 text-red-700 rounded-xl font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Zap className="w-4 h-4 text-red-600" />
          <span>{isHindi ? '1-टैप आपातकालीन टोकन बनाएं (बिना लॉगिन)' : '1-Tap Generate Emergency Token (No Login)'}</span>
        </button>
      </div>

      {/* Emergency Token Generation Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-red-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-red-600" />
                <h3 className="font-black text-slate-900 text-base">
                  {t.ambulance.quickEmergencyToken}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEmergencyModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xs px-2 py-1 cursor-pointer"
              >
                ✕ {t.common.close}
              </button>
            </div>

            {!generatedEmergencyToken ? (
              <form onSubmit={handleGenerateEmergencyToken} className="space-y-4 text-xs">
                {/* Emergency Nature Buttons */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">
                    {t.ambulance.selectCategory} *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEmergencyCat('TRAUMA')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 cursor-pointer ${
                        emergencyCat === 'TRAUMA' ? 'bg-red-50 text-red-700 border-red-500 ring-2 ring-red-400' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>{t.ambulance.catTrauma}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEmergencyCat('CARDIAC')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 cursor-pointer ${
                        emergencyCat === 'CARDIAC' ? 'bg-red-50 text-red-700 border-red-500 ring-2 ring-red-400' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <HeartPulse className="w-4 h-4 text-red-600" />
                      <span>{t.ambulance.catCardiac}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEmergencyCat('STROKE')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 cursor-pointer ${
                        emergencyCat === 'STROKE' ? 'bg-red-50 text-red-700 border-red-500 ring-2 ring-red-400' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Zap className="w-4 h-4 text-red-600" />
                      <span>{t.ambulance.catStroke}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEmergencyCat('MATERNAL')}
                      className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center gap-2 cursor-pointer ${
                        emergencyCat === 'MATERNAL' ? 'bg-red-50 text-red-700 border-red-500 ring-2 ring-red-400' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-red-600" />
                      <span>{t.ambulance.catMaternal}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t.ambulance.patientInfo}
                  </label>
                  <input
                    type="text"
                    value={patientDesc}
                    onChange={e => setPatientDesc(e.target.value)}
                    placeholder={t.ambulance.patientPlaceholder}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t.ambulance.etaMinutes}
                  </label>
                  <div className="flex gap-2">
                    {[5, 10, 15, 25].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setEta(m)}
                        className={`flex-1 py-1.5 rounded-xl font-bold border cursor-pointer ${
                          eta === m ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>{t.ambulance.oneTapDispatch}</span>
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-sm text-emerald-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      {t.ambulance.tokenGeneratedTitle}
                    </span>
                    <span className="font-mono text-base font-black bg-emerald-200 px-3 py-1 rounded-lg">
                      {generatedEmergencyToken.emergencyToken}
                    </span>
                  </div>

                  <p className="text-slate-700">
                    <strong>{t.ambulance.tokenAssignedDoc}:</strong> {generatedEmergencyToken.assignedDoctorName}
                  </p>
                  <p className="text-slate-700">
                    <strong>{t.ambulance.tokenReservedBed}:</strong> Trauma Bay 01 (Casualty Ground Floor)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmergencyModal(false);
                      handleFastEMTLogin();
                    }}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Launch Live Dispatch Radar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1-CLICK FAST EMT CREW SIGN-IN */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-red-600" />
            <span className="text-xs font-bold text-slate-900">{t.ambulance.driverVehicleBadge}</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            Ready on Duty
          </span>
        </div>

        <p className="text-[11px] text-slate-500">
          Unit: <strong>UP-80-EZ-4192 (ALS 108)</strong> • Paramedic: <strong>Rajveer Tyagi</strong>
        </p>

        <button
          type="button"
          onClick={handleFastEMTLogin}
          disabled={loading}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>{loading ? t.common.loading : t.ambulance.quickSignIn}</span>
        </button>
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
          <span className="bg-[#F5F6FC] px-2">Or Mobile Number</span>
        </div>
      </div>

      {generalError && (
        <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#DC4545] font-medium">
          {generalError}
        </div>
      )}

      {/* Simplified Mobile Sign-in Form */}
      <form onSubmit={handleStandardSubmit} className="space-y-3">
        <AuthInput
          label="Registered Mobile Number"
          type="tel"
          placeholder="e.g. 9911223344"
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
          icon={<Phone className="w-4 h-4" />}
          helperText="10-digit registered dispatch phone"
          required
        />

        <AuthInput
          label="Ambulance Vehicle ID (Optional)"
          type="text"
          placeholder="e.g. UP-80-EZ-4192"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value.toUpperCase())}
        />

        <div className="pt-2">
          <AuthButton
            type="submit"
            variant="emergency"
            isLoading={loading}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In with OTP (Auto-verified)
          </AuthButton>
        </div>
      </form>

      <div className="mt-5 pt-3 border-t border-slate-100 text-center text-xs text-[#737B91]">
        <span>Emergency dispatch helpline: </span>
        <a href="tel:108" className="font-bold text-[#DC4545] hover:underline">
          108 (24x7 Casualty Free)
        </a>
      </div>
    </AuthLayout>
  );
};
