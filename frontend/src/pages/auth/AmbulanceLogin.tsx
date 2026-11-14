import React, { useState, useRef } from 'react';
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
  UserCheck,
  Camera,
  Fingerprint,
  Trash2,
  Image as ImageIcon,
  Cpu,
  Check
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

  // Optional Photo & Biometric states for unconscious/incapacitated patients
  const [patientPhoto, setPatientPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [biometricStatus, setBiometricStatus] = useState<'IDLE' | 'CONNECTING' | 'SCANNING' | 'MATCHED' | 'FAILED'>('IDLE');
  const [biometricDetails, setBiometricDetails] = useState<any | null>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPatientPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPatientPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSamplePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(0, 0, 160, 160);
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(80, 70, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('EMG-PATIENT', 80, 74);
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(35, 120, 90, 26);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('CASUALTY-SNAP', 80, 137);
      setPatientPhoto(canvas.toDataURL('image/png'));
    }
  };

  const handleConnectAndScanBiometric = () => {
    setBiometricStatus('CONNECTING');
    setTimeout(() => {
      setBiometricStatus('SCANNING');
      setTimeout(() => {
        const mockBiometric = {
          matchedName: 'Deepak Saxena',
          matchedAge: 34,
          matchedGender: 'MALE' as const,
          matchedAadhaarOrAbha: '14-5544-7788-9922',
          matchedBloodGroup: 'O+ Positive',
          sourceDevice: 'Mantra MFS100 Optical Scanner (USB-OTG)',
          emergencyContact: '+91 98765-43210 (Sister: Aarti Saxena)'
        };
        setBiometricStatus('MATCHED');
        setBiometricDetails(mockBiometric);
        setPatientDesc(mockBiometric.matchedName);
      }, 1200);
    }, 800);
  };

  const handleResetBiometric = () => {
    setBiometricStatus('IDLE');
    setBiometricDetails(null);
  };

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
      photoDataUrl: patientPhoto || undefined,
      biometricStatus: biometricStatus === 'MATCHED' ? 'MATCHED' : 'NOT_SCANNED',
      biometricMatchDetails: biometricDetails || undefined,
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

                {/* Non-Verbal Patient Identification (Photo & Biometrics - Optional for Unconscious Patients) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-slate-700" />
                      <span>{t.ambulance.photoUploadTitle}</span>
                    </span>
                    <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {isHindi ? 'वैकल्पिक' : 'Optional'}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500">
                    {t.ambulance.unconsciousPatientHint}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Photo Upload / Camera Snap */}
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                      {patientPhoto ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={patientPhoto}
                            alt="Captured Snapshot"
                            className="w-12 h-12 object-cover rounded-lg border border-slate-300"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-emerald-700 block truncate">
                              {isHindi ? 'फोटो संलग्न है' : 'Photo Attached'}
                            </span>
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="text-[9px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer mt-0.5"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                              <span>{t.ambulance.removePhoto}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-[#3435D8] rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 border border-blue-200 cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>{t.ambulance.takePhoto}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleSamplePhoto}
                            className="w-full text-[9px] text-slate-500 hover:text-slate-700 font-semibold text-center cursor-pointer"
                          >
                            {isHindi ? '⚡ डेमो फोटो लोड करें' : '⚡ Load Demo Snapshot'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Biometric Device Query */}
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex flex-col justify-between">
                      {biometricStatus === 'IDLE' && (
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={handleConnectAndScanBiometric}
                            className="w-full py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 border border-purple-200 cursor-pointer"
                          >
                            <Fingerprint className="w-3.5 h-3.5 text-purple-600" />
                            <span>{t.ambulance.connectBiometric}</span>
                          </button>
                          <p className="text-[9px] text-slate-400 text-center">
                            Mantra / Morpho USB-OTG
                          </p>
                        </div>
                      )}

                      {biometricStatus === 'CONNECTING' && (
                        <div className="text-center py-1">
                          <span className="text-[10px] font-bold text-purple-700 flex items-center justify-center gap-1">
                            <Cpu className="w-3 h-3 animate-spin" />
                            <span>Connecting...</span>
                          </span>
                        </div>
                      )}

                      {biometricStatus === 'SCANNING' && (
                        <div className="text-center py-1 animate-pulse">
                          <span className="text-[10px] font-bold text-amber-800 flex items-center justify-center gap-1">
                            <Fingerprint className="w-3 h-3 animate-bounce" />
                            <span>Place Finger...</span>
                          </span>
                        </div>
                      )}

                      {biometricStatus === 'MATCHED' && biometricDetails && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>ABDM Verified</span>
                            </span>
                            <button
                              type="button"
                              onClick={handleResetBiometric}
                              className="text-[9px] text-slate-500 hover:text-slate-800 font-bold"
                            >
                              Reset
                            </button>
                          </div>
                          <p className="text-[9px] text-slate-700 font-bold truncate">{biometricDetails.matchedName}</p>
                          <p className="text-[8px] text-slate-500 font-mono">ABHA: {biometricDetails.matchedAadhaarOrAbha}</p>
                        </div>
                      )}
                    </div>
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

                  {(generatedEmergencyToken.photoDataUrl || generatedEmergencyToken.biometricStatus === 'MATCHED') && (
                    <div className="pt-2 border-t border-emerald-200 flex items-center gap-2">
                      {generatedEmergencyToken.photoDataUrl && (
                        <img
                          src={generatedEmergencyToken.photoDataUrl}
                          alt="Patient"
                          className="w-9 h-9 object-cover rounded-md border border-emerald-300"
                        />
                      )}
                      <div className="flex gap-1 flex-wrap">
                        {generatedEmergencyToken.photoDataUrl && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-950 flex items-center gap-1">
                            <Camera className="w-2.5 h-2.5" />
                            <span>Photo Attached</span>
                          </span>
                        )}
                        {generatedEmergencyToken.biometricStatus === 'MATCHED' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                            <Fingerprint className="w-2.5 h-2.5" />
                            <span>Biometric Verified</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
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
