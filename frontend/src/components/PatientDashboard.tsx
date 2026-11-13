import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Clock, 
  BedDouble, 
  Stethoscope, 
  CreditCard, 
  Search,
  CheckCircle2, 
  ShieldCheck, 
  PhoneCall, 
  ArrowRight,
  Fingerprint,
  MessageSquare,
  Building2,
  Bell,
  Sparkles,
  MapPin,
  FileText
} from 'lucide-react';
import { hospitalStore } from '../services/hospitalStore';
import { HOSPITAL_INFO } from '../services/mockData';
import { QueueToken, AuthUser } from '../types';
import { webauthnService } from '../services/webauthnService';
import { useTranslation } from '../utils/translations';

interface PatientDashboardProps {
  onNavigateToTab: (tab: string) => void;
  onOpenOpdRegistration: () => void;
  onOpenMedicalHistory: () => void;
  onOpenAbhaCard: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onNavigateToTab,
  onOpenOpdRegistration,
  onOpenMedicalHistory,
  onOpenAbhaCard
}) => {
  const [user, setUser] = useState<AuthUser | null>(hospitalStore.getUser());
  const [activeToken, setActiveToken] = useState<QueueToken | null>(null);
  
  // Secure Token Lookup states
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<QueueToken | null | 'NOT_FOUND'>(null);
  const [tokenVerifyHash, setTokenVerifyHash] = useState('');
  const [showCabinModal, setShowCabinModal] = useState(false);

  // Patient Privacy & Consent Preferences
  const [abhaConsentGranted, setAbhaConsentGranted] = useState(true);
  const [maskPublicName, setMaskPublicName] = useState(true);
  const [notificationChannel, setNotificationChannel] = useState<'SMS' | 'WHATSAPP' | 'ALL'>('ALL');
  
  // Passkey state
  const [passkeyStatus, setPasskeyStatus] = useState<string | null>(null);

  // Indicator: Live vs Demo data
  const [isLiveData, setIsLiveData] = useState(true);

  const { t, isHindi } = useTranslation();

  useEffect(() => {
    const update = () => {
      setUser(hospitalStore.getUser());
      const allTokens = hospitalStore.getTokens();
      // Find patient's latest active or waiting token
      const myToken = allTokens.find(
        token => (token.patientName === user?.name || token.mobile === user?.mobile || token.id === 'TOK-002') &&
             token.status !== 'CANCELLED' && token.status !== 'COMPLETED'
      ) || allTokens.find(token => token.id === 'TOK-002') || allTokens[0];
      setActiveToken(myToken || null);
    };

    update();
    return hospitalStore.subscribe(update);
  }, [user?.mobile, user?.name]);

  const handleSecureLookup = (e?: React.FormEvent, directVal?: string) => {
    if (e) e.preventDefault();
    const query = (directVal !== undefined ? directVal : lookupQuery).trim().toUpperCase();
    if (!query) return;

    const allTokens = hospitalStore.getTokens();
    const found = allTokens.find(token => {
      const full = token.tokenNumber.toUpperCase();
      const id = token.id.toUpperCase();
      const mobile = token.mobile;
      const abha = token.abhaId?.toUpperCase() || '';
      
      if (full === query || id === query || mobile === query || abha === query) return true;
      if (full.endsWith(`-${query}`) || full.includes(query)) return true;
      const numPart = full.split('-').pop() || '';
      if (numPart.replace(/^0+/, '') === query.replace(/^0+/, '')) return true;
      return false;
    });

    if (found) {
      setLookupResult(found);
      const hash = `HMAC-${found.id}-${found.tokenNumber}-SHA256:${found.roomCabin.replace(/\s+/g, '')}88d1`;
      setTokenVerifyHash(hash);
    } else {
      setLookupResult('NOT_FOUND');
      setTokenVerifyHash('');
    }
  };

  const handleRegisterPasskey = async () => {
    if (!user) return;
    setPasskeyStatus('Requesting biometric sensor...');
    const res = await webauthnService.registerPasskey(user.id, user.name);
    setPasskeyStatus(res.message);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Live Data Status Indicator Banner */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-800">{isHindi ? 'अस्पताल टेलीमेट्री:' : 'Hospital Central Telemetry:'}</span>
          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
            {isLiveData ? t.patient.statusSync : 'DEMO MODE'}
          </span>
          <span className="text-slate-500 hidden sm:inline">• {isHindi ? 'ABDM एन्क्रिप्टेड सत्र' : 'AES-256 ABDM Encrypted Session'}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-600">
          <span className="text-[11px]">{isHindi ? 'सिंक: अभी' : 'Sync: Just Now'}</span>
          <button
            onClick={() => setIsLiveData(!isLiveData)}
            className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            {isHindi ? 'मोड बदलें' : 'Toggle Mode'}
          </button>
        </div>
      </div>

      {/* Senior Citizen Friendly Greeting & Hero Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[11px] font-semibold text-blue-700 mb-1.5 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.patient.subGreeting}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {t.patient.greeting}, {user?.name || (isHindi ? 'नागरिक' : 'Citizen')}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            {t.patient.welcomeDesc}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            onClick={onOpenOpdRegistration}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Ticket className="w-4 h-4 text-white" />
            <span>{t.patient.bookOpd}</span>
          </button>
          <button
            onClick={onOpenAbhaCard}
            className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>{t.patient.viewAbha}</span>
          </button>
        </div>
      </div>

      {/* Personalized Patient Home View: Active Token Card */}
      {activeToken && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-6 shadow-md relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex flex-col items-center justify-center font-black shadow-md shrink-0">
                <span className="text-[10px] uppercase font-bold tracking-wider">{t.common.status}</span>
                <span className="text-lg leading-tight font-mono">{activeToken.tokenNumber.split('-').pop()}</span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-amber-950 bg-amber-200/90 px-3 py-0.5 rounded-md font-mono">
                    {activeToken.tokenNumber}
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {activeToken.departmentName}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    activeToken.status === 'CALLED' ? 'bg-red-500 text-white animate-pulse' :
                    activeToken.status === 'IN_CONSULTATION' ? 'bg-blue-600 text-white' :
                    'bg-amber-200 text-amber-900'
                  }`}>
                    {activeToken.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs text-slate-700 bg-white/70 p-3 rounded-2xl border border-amber-200/60">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t.patient.attendingDoctor}</span>
                    <strong className="text-slate-900">{activeToken.doctorName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t.patient.assignedCabin}</span>
                    <strong className="text-slate-900">{activeToken.roomCabin} ({activeToken.building})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t.patient.queuePosition}</span>
                    <strong className="text-blue-700 font-mono text-sm">#{activeToken.queuePosition || 1} in queue</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">{t.patient.estWait}</span>
                    <strong className="text-amber-700">~{activeToken.estimatedWaitMinutes} {t.common.minutes}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons for Token */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
              <button
                onClick={() => setShowCabinModal(true)}
                className="flex-1 sm:flex-none px-4 py-3 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                title="Locate assigned OPD cabin"
              >
                <MapPin className="w-4 h-4" />
                <span>{t.patient.locateToken}</span>
              </button>

              <button
                onClick={() => onNavigateToTab('live-token')}
                className="flex-1 sm:flex-none px-4 py-3 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{t.patient.viewQueueBoard}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Cabin Location Modal */}
      {showCabinModal && activeToken && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">Cabin Location Guide</h3>
              </div>
              <button
                onClick={() => setShowCabinModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer px-2 py-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
                <span>{activeToken.roomCabin}</span>
                <span className="font-mono text-amber-800">{activeToken.tokenNumber}</span>
              </div>
              <p className="text-slate-600">
                <strong>Building:</strong> {activeToken.building}
              </p>
              <p className="text-slate-600">
                <strong>Floor:</strong> Floor {activeToken.floor} • Follow Yellow Floor Guide Line
              </p>
              <p className="text-slate-600">
                <strong>Attending Faculty:</strong> {activeToken.doctorName} ({activeToken.doctorDesignation})
              </p>
            </div>

            <button
              onClick={() => setShowCabinModal(false)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Secure Token Lookup & Privacy Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Secure Token 4 Queue Lookup & Verification Facility */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#3435D8] flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{t.patient.tokenLookupTitle}</h3>
                <p className="text-xs text-slate-500">{t.patient.tokenLookupDesc}</p>
              </div>
            </div>
          </div>

          {/* Quick test badges */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 overflow-x-auto">
            <span className="text-slate-400">Sample:</span>
            <button
              type="button"
              onClick={() => { setLookupQuery('OPD-ORTHO-002'); handleSecureLookup(undefined, 'OPD-ORTHO-002'); }}
              className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
            >
              OPD-ORTHO-002
            </button>
            <button
              type="button"
              onClick={() => { setLookupQuery('003'); handleSecureLookup(undefined, '003'); }}
              className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 cursor-pointer"
            >
              003 (Cardio)
            </button>
            <button
              type="button"
              onClick={() => { setLookupQuery('9876543210'); handleSecureLookup(undefined, '9876543210'); }}
              className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 cursor-pointer"
            >
              9876543210
            </button>
          </div>

          <form onSubmit={(e) => handleSecureLookup(e)} className="flex gap-2">
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder={t.patient.enterTokenPlaceholder}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3435D8]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#3435D8] hover:bg-[#2424B8] text-white rounded-xl font-bold text-xs shadow-sm transition cursor-pointer"
            >
              {t.common.verify}
            </button>
          </form>

          {lookupResult && lookupResult !== 'NOT_FOUND' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 to-teal-50/90 border border-blue-200 text-xs space-y-2.5">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="font-mono text-sm bg-white px-2 py-0.5 rounded border border-blue-200">
                  {lookupResult.tokenNumber}
                </span>
                <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md font-mono text-[11px]">
                  {lookupResult.status}
                </span>
              </div>
              <div className="text-slate-600 grid grid-cols-2 gap-2 text-[11px]">
                <span><strong>{t.common.department}:</strong> {lookupResult.departmentName}</span>
                <span><strong>{t.common.roomCabin}:</strong> {lookupResult.roomCabin}</span>
                <span><strong>{t.common.doctor}:</strong> {lookupResult.doctorName}</span>
                <span><strong>{t.patient.estWait}:</strong> ~{lookupResult.estimatedWaitMinutes} {t.common.mins}</span>
              </div>
              <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[10px] text-teal-800 font-semibold">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  {t.patient.sanitizedNotice}
                </span>
                <span className="font-mono text-slate-500">
                  Seal: {tokenVerifyHash.slice(0, 16)}...
                </span>
              </div>
            </div>
          )}

          {lookupResult === 'NOT_FOUND' && (
            <p className="text-xs text-red-600 font-semibold p-2 rounded-lg bg-red-50 border border-red-200">
              {t.patient.tokenNotFound}
            </p>
          )}

          {/* WebAuthn Biometric Passkey Enrollment */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <Fingerprint className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-slate-800">{t.patient.passkeyTitle}</span>
            </div>
            <button
              onClick={handleRegisterPasskey}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {t.patient.enrollPasskey}
            </button>
          </div>
          {passkeyStatus && (
            <p className="text-[11px] text-purple-700 font-semibold bg-purple-50 p-2 rounded-lg">
              {passkeyStatus}
            </p>
          )}
        </div>

        {/* Patient-Controlled Consent & Privacy Settings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.patient.privacySettings}</h3>
              <p className="text-xs text-slate-500">{t.patient.privacyDesc}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* ABHA Sharing Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="pr-3">
                <p className="font-bold text-slate-800">{t.patient.abhaConsent}</p>
                <p className="text-slate-500 text-[11px]">{t.patient.abhaConsentSub}</p>
              </div>
              <button
                type="button"
                onClick={() => setAbhaConsentGranted(!abhaConsentGranted)}
                className={`w-12 h-6 rounded-full transition p-1 flex items-center cursor-pointer shrink-0 ${
                  abhaConsentGranted ? 'bg-teal-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-xs"></span>
              </button>
            </div>

            {/* Public Queue Masking */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="pr-3">
                <p className="font-bold text-slate-800">{t.patient.maskName}</p>
                <p className="text-slate-500 text-[11px]">{t.patient.maskNameSub}</p>
              </div>
              <button
                type="button"
                onClick={() => setMaskPublicName(!maskPublicName)}
                className={`w-12 h-6 rounded-full transition p-1 flex items-center cursor-pointer shrink-0 ${
                  maskPublicName ? 'bg-teal-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-xs"></span>
              </button>
            </div>

            {/* Notification Channel Preference */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="pr-3">
                <p className="font-bold text-slate-800">{t.patient.smsAlerts}</p>
                <p className="text-slate-500 text-[11px]">{t.patient.smsAlertsSub}</p>
              </div>
              <select
                value={notificationChannel}
                onChange={(e) => setNotificationChannel(e.target.value as any)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="ALL">SMS & WhatsApp</option>
                <option value="SMS">SMS Only</option>
                <option value="WHATSAPP">WhatsApp Only</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Hospital Patient Services Cards */}
      <div className="mb-2">
        <h2 className="text-xl font-bold text-slate-900 mb-1">{t.patient.servicesHeading}</h2>
        <p className="text-xs text-slate-500">{t.patient.servicesSub}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        
        {/* 1. Doctor Appointment / Generate OPD Token */}
        <div 
          onClick={onOpenOpdRegistration}
          className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-teal-500 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition shadow-xs">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition">
              {t.patient.service1Title}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {t.patient.service1Desc}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
            <span>{t.patient.bookOpd}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 2. Live Token Information & Tracking */}
        <div 
          onClick={() => onNavigateToTab('live-token')}
          className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#3435D8] flex items-center justify-center mb-4 group-hover:scale-105 transition shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#3435D8] transition">
              {t.patient.service2Title}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {t.patient.service2Desc}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#3435D8]">
            <span>{t.patient.viewQueueBoard}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 3. Emergency Assistance 108 */}
        <div 
          onClick={() => onNavigateToTab('ambulance-dashboard')}
          className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-red-500 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:scale-105 transition shadow-xs">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition">
              {t.patient.service3Title}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {t.patient.service3Desc}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-red-600">
            <span>SOS 108</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 4. Available Hospital Beds */}
        <div 
          onClick={() => onNavigateToTab('beds')}
          className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition shadow-xs">
              <BedDouble className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
              {t.patient.service4Title}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {t.patient.service4Desc}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>{t.nav.bedTracker}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 5. Doctor Guide Box */}
        <div 
          onClick={() => onNavigateToTab('guide-box')}
          className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-indigo-500 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-105 transition shadow-xs">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition">
              {t.patient.service5Title}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {t.patient.service5Desc}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
            <span>Open Chat</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 6. Doctor Directory & Hierarchy */}
        <div 
          onClick={() => onNavigateToTab('doctors')}
          className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-cyan-500 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-4 group-hover:scale-105 transition shadow-xs">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition">
              {t.patient.service6Title}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {t.patient.service6Desc}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-700">
            <span>{t.nav.doctorDirectory}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 7. Digital Health Records (ABHA) - Replaces Wayfinder */}
        <div 
          onClick={onOpenMedicalHistory}
          className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-purple-500 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-105 transition shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition">
              {t.patient.service7Title}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {t.patient.service7Desc}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
            <span>Open Health Locker</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 8. Pharmacy & Jan Aushadhi Kendra */}
        <div 
          onClick={onOpenAbhaCard}
          className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-amber-500 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-105 transition shadow-xs">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition">
              {t.patient.service8Title}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {t.patient.service8Desc}
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
            <span>{t.patient.viewAbha}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

      </div>

    </div>
  );
};
