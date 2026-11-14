import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, 
  PhoneCall, 
  AlertTriangle, 
  HeartPulse, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Activity,
  BedDouble,
  UserPlus,
  Zap,
  MapPin,
  Volume2,
  Navigation,
  Camera,
  Fingerprint,
  Trash2,
  RotateCcw,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  Check
} from 'lucide-react';
import { hospitalStore, playHospitalChime } from '../services/hospitalStore';
import { EmergencyCase } from '../types';
import { useTranslation } from '../utils/translations';

export const AmbulanceDashboard: React.FC = () => {
  const currentUser = hospitalStore.getUser();
  const [emergencyCases, setEmergencyCases] = useState<EmergencyCase[]>(hospitalStore.getEmergencyCases());
  const [beds, setBeds] = useState(hospitalStore.getBeds());
  const { t, isHindi } = useTranslation();

  // Simple, touch-friendly form state
  const [category, setCategory] = useState<EmergencyCase['category']>('TRAUMA');
  const [severity, setSeverity] = useState<EmergencyCase['severity']>('CRITICAL');
  const [patientName, setPatientName] = useState('Accident Victim (Motorbike Crash)');
  const [patientAge, setPatientAge] = useState(28);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [incidentLocation, setIncidentLocation] = useState('NH-19 Highway Flyover');
  const [etaMinutes, setEtaMinutes] = useState(8);

  const [registeredCase, setRegisteredCase] = useState<EmergencyCase | null>(null);

  // Photo Uploading States (Optional)
  const [patientPhoto, setPatientPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Biometric Option States (Optional - for unconscious/incapacitated patient)
  const [biometricStatus, setBiometricStatus] = useState<'IDLE' | 'CONNECTING' | 'SCANNING' | 'MATCHED' | 'FAILED'>('IDLE');
  const [biometricDetails, setBiometricDetails] = useState<{
    matchedAadhaarOrAbha?: string;
    sourceDevice?: string;
    matchedName?: string;
    matchedAge?: number;
    matchedGender?: 'MALE' | 'FEMALE' | 'OTHER';
    matchedBloodGroup?: string;
    emergencyContact?: string;
  } | null>(null);

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
    // Generate clean canvas emergency clinical snapshot
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
        setPatientName(mockBiometric.matchedName);
        setPatientAge(mockBiometric.matchedAge);
        setGender(mockBiometric.matchedGender);
      }, 1200);
    }, 800);
  };

  const handleResetBiometric = () => {
    setBiometricStatus('IDLE');
    setBiometricDetails(null);
  };

  useEffect(() => {
    return hospitalStore.subscribe(() => {
      setEmergencyCases(hospitalStore.getEmergencyCases());
      setBeds(hospitalStore.getBeds());
    });
  }, []);

  const handleRegisterEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    playHospitalChime(
      isHindi
        ? `प्राथमिकता 108 आपातकालीन अलर्ट। ${category} मरीज़ आगमन की सूचना।`
        : `Priority 108 emergency alert. Inbound ${category} patient dispatched to casualty bay.`,
      isHindi ? 'hi' : 'en'
    );

    const newCase = hospitalStore.registerEmergencyCase({
      ambulanceId: currentUser?.ambulanceId || 'AMB-UP80-108',
      ambulanceRegNo: 'UP-80-EZ-4192',
      attendantId: 'ATT-4091',
      attendantName: currentUser?.name || 'Rajveer Tyagi (EMT Paramedic)',
      patientName: patientName.trim() || 'Unknown Emergency Patient',
      patientAge: Number(patientAge) || 30,
      gender,
      category,
      severity,
      description: `Inbound 108 Emergency: ${category} (${severity}) - Priority triage requested.`,
      incidentLocation,
      etaMinutes: Number(etaMinutes) || 10,
      photoDataUrl: patientPhoto || undefined,
      biometricStatus: biometricStatus === 'MATCHED' ? 'MATCHED' : 'NOT_SCANNED',
      biometricMatchDetails: biometricDetails || undefined,
      vitals: {
        bloodPressure: '105/70',
        pulseRate: 110,
        spO2: 96,
        consciousness: 'Emergency In-transit'
      }
    });

    setRegisteredCase(newCase);
  };

  const handleUpdateStatus = (caseId: string, status: EmergencyCase['status']) => {
    hospitalStore.updateEmergencyStatus(caseId, status);
  };

  const traumaBedsAvailable = beds.filter(b => b.bedCategory === 'EMERGENCY' && b.status === 'AVAILABLE').length;
  const icuBedsAvailable = beds.filter(b => b.bedCategory === 'ICU' && b.status === 'AVAILABLE').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* High-Visibility Minimal Header Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-[#DC4545] border border-red-200 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                108 EMERGENCY DISPATCH
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{isHindi ? 'जीपीएस रडार सक्रिय' : 'GPS Radar Active'}</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {t.ambulance.title}
            </h1>
            <p className="text-xs text-slate-500">
              S. N. Medical College Emergency Casualty • High-Priority Triage Coordination
            </p>
          </div>
        </div>

        {/* Live Hospital Readiness Counter */}
        <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200 flex items-center gap-4 sm:gap-6 text-xs w-full md:w-auto justify-between sm:justify-around">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">{t.ambulance.tokenReservedBed || 'Casualty Beds'}:</span>
            <span className="font-bold text-emerald-700 text-lg sm:text-xl">{traumaBedsAvailable} {isHindi ? 'खाली' : 'Free'}</span>
          </div>
          <div className="border-l border-slate-200 pl-4 sm:pl-6">
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">{t.bed.icuBeds}:</span>
            <span className="font-bold text-slate-800 text-lg sm:text-xl">{icuBedsAvailable} {isHindi ? 'खाली' : 'Free'}</span>
          </div>
          <div className="border-l border-slate-200 pl-4 sm:pl-6">
            <a
              href="tel:108"
              className="px-3 py-1.5 bg-[#DC4545] hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>108</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Touch-Friendly Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Rapid 1-Tap Emergency Token Dispatch Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-bold text-slate-900">
                {t.ambulance.oneTapDispatch}
              </h2>
            </div>
            <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full uppercase">
              Fast Triage Active
            </span>
          </div>

          {/* Generated Emergency Token Result Card */}
          {registeredCase && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 text-emerald-950 text-xs space-y-3 shadow-md animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-black text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  {t.ambulance.tokenGeneratedTitle}
                </span>
                <span className="font-mono text-base font-black bg-emerald-200 px-3 py-1 rounded-xl text-emerald-950 border border-emerald-300">
                  {registeredCase.emergencyToken}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{t.ambulance.tokenAssignedDoc}</span>
                  <strong className="text-slate-900">{registeredCase.assignedDoctorName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{t.ambulance.tokenReservedBed}</span>
                  <strong className="text-red-700">Trauma Bay 01 (Casualty)</strong>
                </div>
              </div>

              {/* If Photo or Biometric attached, show in result */}
              {(registeredCase.photoDataUrl || registeredCase.biometricStatus === 'MATCHED') && (
                <div className="pt-2 border-t border-emerald-200/60 flex items-center gap-3">
                  {registeredCase.photoDataUrl && (
                    <img
                      src={registeredCase.photoDataUrl}
                      alt="Casualty Snapshot"
                      className="w-11 h-11 object-cover rounded-lg border border-emerald-300 shadow-xs shrink-0"
                    />
                  )}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {registeredCase.photoDataUrl && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950 flex items-center gap-1">
                        <Camera className="w-3 h-3 text-emerald-800" />
                        <span>{isHindi ? 'फोटो संलग्न' : 'Photo Attached'}</span>
                      </span>
                    )}
                    {registeredCase.biometricStatus === 'MATCHED' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                        <Fingerprint className="w-3 h-3 text-purple-700" />
                        <span>{isHindi ? 'बायोमेट्रिक प्रमाणित' : 'Biometric ABDM Verified'}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                <span className="text-emerald-800 font-semibold">Casualty team notified & waiting at ambulance bay.</span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=SN+Medical+College+Agra`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>GPS Route</span>
                </a>
              </div>
            </div>
          )}

          <form onSubmit={handleRegisterEmergency} className="space-y-4 text-xs">
            
            {/* Step 1: Big Emergency Nature Selection Cards */}
            <div>
              <label className="block font-bold text-slate-700 mb-2 uppercase text-[10px] tracking-wider">
                1. {t.ambulance.selectCategory} *
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { key: 'TRAUMA', label: t.ambulance.catTrauma, icon: AlertTriangle, color: 'text-red-600' },
                  { key: 'CARDIAC', label: t.ambulance.catCardiac, icon: HeartPulse, color: 'text-rose-600' },
                  { key: 'STROKE', label: t.ambulance.catStroke, icon: Zap, color: 'text-amber-600' },
                  { key: 'MATERNAL', label: t.ambulance.catMaternal, icon: Truck, color: 'text-purple-600' },
                  { key: 'RESPIRATORY', label: t.ambulance.catRespiratory, icon: Activity, color: 'text-blue-600' },
                  { key: 'BURNS', label: t.ambulance.catBurn, icon: ShieldAlert, color: 'text-orange-600' },
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = category === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setCategory(item.key as any)}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-red-50 text-red-950 border-red-500 ring-2 ring-red-400 font-black shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-semibold'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${item.color}`} />
                      <span className="text-[11px] leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: 1-Tap Severity Buttons */}
            <div>
              <label className="block font-bold text-slate-700 mb-2 uppercase text-[10px] tracking-wider">
                2. {t.ambulance.selectSeverity} *
              </label>

              <div className="grid grid-cols-3 gap-2 text-center font-bold">
                <button
                  type="button"
                  onClick={() => setSeverity('CRITICAL')}
                  className={`py-3 px-2 rounded-2xl border transition cursor-pointer ${
                    severity === 'CRITICAL'
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                  }`}
                >
                  <span className="block text-xs font-black">🔴 CRITICAL</span>
                  <span className="text-[9px] opacity-90 block mt-0.5">Immediate OT / ICU</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSeverity('URGENT')}
                  className={`py-3 px-2 rounded-2xl border transition cursor-pointer ${
                    severity === 'URGENT'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <span className="block text-xs font-black">🟡 URGENT</span>
                  <span className="text-[9px] opacity-90 block mt-0.5">Priority Trauma Bay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSeverity('STABLE')}
                  className={`py-3 px-2 rounded-2xl border transition cursor-pointer ${
                    severity === 'STABLE'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span className="block text-xs font-black">🟢 STABLE</span>
                  <span className="text-[9px] opacity-90 block mt-0.5">Casualty Triage</span>
                </button>
              </div>
            </div>

            {/* Step 3: Patient Info & Location */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  3. {t.ambulance.patientInfo}
                </label>
                <div className="flex gap-2 mb-1.5 flex-wrap">
                  {['Unknown Victim', 'Bike Crash Rider', 'Elderly Patient', 'Mother in Labour'].map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setPatientName(chip)}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder={t.ambulance.patientPlaceholder}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pickup Location / Landmark
                  </label>
                  <input
                    type="text"
                    value={incidentLocation}
                    onChange={e => setIncidentLocation(e.target.value)}
                    placeholder="e.g. NH-19 Runakta Flyover"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t.ambulance.etaMinutes}
                  </label>
                  <div className="flex gap-1.5">
                    {[5, 8, 12, 20].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setEtaMinutes(m)}
                        className={`flex-1 py-2 rounded-xl font-bold border cursor-pointer ${
                          etaMinutes === m ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Non-Verbal Patient Identification (Photo & Biometrics - Optional for Unconscious Patients) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-slate-700" />
                  <span className="font-bold text-slate-900 text-xs">
                    4. {t.ambulance.photoUploadTitle}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full w-fit">
                  {isHindi ? 'वैकल्पिक: अचेत / अज्ञात मरीज़ हेतु' : 'Optional: For Unconscious / Unidentified Patient'}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-snug">
                {t.ambulance.unconsciousPatientHint}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                
                {/* 4A: Mobile Camera / Image Upload */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-between gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isHindi ? 'मरीज़ की फोटो' : 'Patient Photo Snapshot'}</span>
                    </span>
                    {patientPhoto && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>{isHindi ? 'संलग्न' : 'Attached'}</span>
                      </span>
                    )}
                  </div>

                  {/* Hidden Native File & Camera Input (Mobile environment capture) */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />

                  {patientPhoto ? (
                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <img
                        src={patientPhoto}
                        alt="Patient Snapshot"
                        className="w-14 h-14 object-cover rounded-lg border border-slate-300 shadow-xs"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-900 truncate">
                          {isHindi ? 'फोटो संलग्न है' : 'Photo Captured'}
                        </p>
                        <p className="text-[9px] text-slate-500 font-mono">
                          Ready for trauma team
                        </p>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="mt-1 text-[10px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{t.ambulance.removePhoto}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-[#3435D8] rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-blue-200 transition cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{t.ambulance.takePhoto}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSamplePhoto}
                        className="w-full py-1 text-[10px] text-slate-500 hover:text-slate-800 font-semibold text-center cursor-pointer"
                      >
                        {isHindi ? '⚡ डेमो फोटो लोड करें' : '⚡ Load Demo Trauma Snapshot'}
                      </button>
                    </div>
                  )}
                </div>

                {/* 4B: Biometric Device Scanner Query */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-between gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                      <Fingerprint className="w-3.5 h-3.5 text-purple-600" />
                      <span>{isHindi ? 'बायोमेट्रिक डिवाइस' : 'Biometric Scanner'}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      USB / Bluetooth
                    </span>
                  </div>

                  {biometricStatus === 'IDLE' && (
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={handleConnectAndScanBiometric}
                        className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-purple-200 transition cursor-pointer"
                      >
                        <Fingerprint className="w-4 h-4 text-purple-600" />
                        <span>{t.ambulance.connectBiometric}</span>
                      </button>
                      <p className="text-[9px] text-slate-400 text-center">
                        Mantra MFS100 • Startek • Morpho • WebAuthn
                      </p>
                    </div>
                  )}

                  {biometricStatus === 'CONNECTING' && (
                    <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-center space-y-1">
                      <div className="flex items-center justify-center gap-1.5 text-purple-800 font-bold text-xs">
                        <Cpu className="w-4 h-4 animate-spin text-purple-600" />
                        <span>{isHindi ? 'डिवाइस कनेक्ट हो रहा है...' : 'Connecting to Scanner Hardware...'}</span>
                      </div>
                      <p className="text-[9px] text-purple-600">Checking USB-OTG / Bluetooth connection</p>
                    </div>
                  )}

                  {biometricStatus === 'SCANNING' && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-300 text-center space-y-1 animate-pulse">
                      <div className="flex items-center justify-center gap-1.5 text-amber-900 font-black text-xs">
                        <Fingerprint className="w-4 h-4 text-amber-600 animate-bounce" />
                        <span>{isHindi ? 'उंगली स्कैनर पर रखें...' : 'Place Finger on Sensor...'}</span>
                      </div>
                      <p className="text-[9px] text-amber-700">Mantra MFS100 Ready • Reading biometric hash</p>
                    </div>
                  )}

                  {biometricStatus === 'MATCHED' && biometricDetails && (
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-300 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ABDM Match Found</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleResetBiometric}
                          className="text-[9px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-700 leading-tight">
                        <p className="font-bold text-slate-900">{biometricDetails.matchedName}</p>
                        <p className="text-[9px] text-slate-500 font-mono">ABHA: {biometricDetails.matchedAadhaarOrAbha}</p>
                        <p className="text-[9px] text-emerald-700 font-semibold">Blood Group: {biometricDetails.matchedBloodGroup}</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* GIANT ACTION BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-red-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-5 h-5 animate-pulse text-amber-300" />
                <span>{t.ambulance.oneTapDispatch}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Dispatched Ambulances & Casualty Tracking (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {t.ambulance.activeDispatches}
                </h3>
              </div>
              <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                {emergencyCases.length} Inbound
              </span>
            </div>

            <div className="space-y-3">
              {emergencyCases.map(item => (
                <div 
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-red-300 transition space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-red-800 bg-red-100 px-2 py-0.5 rounded border border-red-200">
                      {item.emergencyToken}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      item.severity === 'CRITICAL' ? 'bg-red-600 text-white animate-pulse' :
                      item.severity === 'URGENT' ? 'bg-amber-500 text-white' :
                      'bg-emerald-600 text-white'
                    }`}>
                      {item.severity}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    {item.photoDataUrl && (
                      <img
                        src={item.photoDataUrl}
                        alt="Patient Thumbnail"
                        className="w-10 h-10 object-cover rounded-lg border border-slate-300 shadow-2xs shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{item.patientName}</h4>
                        {item.biometricStatus === 'MATCHED' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200">
                            ABDM Biometric
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="truncate">{item.incidentLocation}</span>
                        <span className="font-bold text-slate-700 shrink-0">• ETA: ~{item.etaMinutes}m</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">
                      Doctor: <strong>{item.assignedDoctorName}</strong>
                    </span>
                    <span className="text-purple-700 font-bold">
                      {item.reservedBedId || 'Trauma Bay 01'}
                    </span>
                  </div>

                  {/* 1-Tap Status Quick Actions */}
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(item.id, 'ARRIVED')}
                      className={`flex-1 py-1.5 rounded-xl font-bold text-[10px] border transition cursor-pointer ${
                        item.status === 'ARRIVED' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-blue-50 text-blue-700 border-slate-200'
                      }`}
                    >
                      {t.ambulance.markArrived}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(item.id, 'ADMITTED')}
                      className={`flex-1 py-1.5 rounded-xl font-bold text-[10px] border transition cursor-pointer ${
                        item.status === 'ADMITTED' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-emerald-50 text-emerald-700 border-slate-200'
                      }`}
                    >
                      {t.ambulance.markAdmitted}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
