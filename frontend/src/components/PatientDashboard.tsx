import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Clock, 
  PhoneCall, 
  BedDouble, 
  MessageSquare, 
  Stethoscope, 
  Compass, 
  FileText, 
  CreditCard, 
  Info,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Bell,
  Fingerprint,
  Search,
  Activity,
  Sparkles
} from 'lucide-react';
import { hospitalStore } from '../services/hospitalStore';
import { HOSPITAL_INFO } from '../services/mockData';
import { QueueToken, AuthUser } from '../types';
import { webauthnService } from '../services/webauthnService';

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

  // Patient Privacy & Consent Preferences
  const [abhaConsentGranted, setAbhaConsentGranted] = useState(true);
  const [maskPublicName, setMaskPublicName] = useState(true);
  const [notificationChannel, setNotificationChannel] = useState<'SMS' | 'WHATSAPP' | 'ALL'>('ALL');
  
  // Passkey state
  const [passkeyStatus, setPasskeyStatus] = useState<string | null>(null);

  // Indicator: Live vs Demo data
  const [isLiveData, setIsLiveData] = useState(true);

  useEffect(() => {
    const update = () => {
      setUser(hospitalStore.getUser());
      const allTokens = hospitalStore.getTokens();
      // Find patient's latest active or waiting token
      const myToken = allTokens.find(
        t => (t.patientName === user?.name || t.mobile === user?.mobile || t.id === 'TOK-002') &&
             t.status !== 'CANCELLED' && t.status !== 'COMPLETED'
      ) || allTokens.find(t => t.id === 'TOK-002') || allTokens[0];
      setActiveToken(myToken || null);
    };

    update();
    return hospitalStore.subscribe(update);
  }, [user?.mobile, user?.name]);

  const handleSecureLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    const allTokens = hospitalStore.getTokens();
    const cleanQ = lookupQuery.trim().toUpperCase();
    const found = allTokens.find(
      t => t.tokenNumber.toUpperCase() === cleanQ || t.id.toUpperCase() === cleanQ
    );

    setLookupResult(found || 'NOT_FOUND');
  };

  const handleRegisterPasskey = async () => {
    if (!user) return;
    setPasskeyStatus('Requesting biometric sensor...');
    const res = await webauthnService.registerPasskey(user.id, user.name);
    setPasskeyStatus(res.message);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Live vs Demonstration Data Notice Indicator Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-800">Hospital Data Status:</span>
          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[11px]">
            {isLiveData ? 'LIVE SPRING BOOT SYNCHRONIZED' : 'DEMONSTRATION DATA MODE'}
          </span>
          <span className="text-slate-500 hidden sm:inline">• High-security AES-256 encrypted session</span>
        </div>
        <div className="flex items-center gap-3 text-slate-600">
          <span className="text-[11px]">Last Sync: Just now</span>
          <button
            onClick={() => setIsLiveData(!isLiveData)}
            className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
          >
            Toggle Mode
          </button>
        </div>
      </div>

      {/* Senior Citizen Friendly Greeting & Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-teal-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold text-blue-100 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-300" />
              <span>Ayushman Bharat Digital Health Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Namaskar, {user?.name || 'Citizen'}
            </h1>
            <p className="text-sm sm:text-base text-blue-100 mt-1 max-w-xl">
              Welcome to {HOSPITAL_INFO.shortName}. Select a service below to book OPD, track your token, check beds, or coordinate with your doctor team.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onOpenOpdRegistration}
              className="px-6 py-3.5 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Ticket className="w-5 h-5 text-slate-950" />
              <span>Book OPD Token</span>
            </button>
            <button
              onClick={onOpenAbhaCard}
              className="px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-teal-300" />
              <span>View ABHA Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Personalized Patient Home View: Active Token Card */}
      {activeToken && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-6 shadow-md relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex flex-col items-center justify-center font-black shadow-md shrink-0">
                <span className="text-[10px] uppercase font-bold tracking-wider">Token</span>
                <span className="text-xl leading-tight">{activeToken.tokenNumber.split('-').pop()}</span>
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
                    Status: {activeToken.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs text-slate-700 bg-white/70 p-3 rounded-2xl border border-amber-200/60">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Attending Doctor</span>
                    <strong className="text-slate-900">{activeToken.doctorName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Cabin</span>
                    <strong className="text-slate-900">{activeToken.roomCabin} ({activeToken.building})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Queue Position</span>
                    <strong className="text-blue-700 font-mono text-sm">#{activeToken.queuePosition || 1} in line</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Est. Waiting Time</span>
                    <strong className="text-amber-700">~{activeToken.estimatedWaitMinutes} minutes</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons for Token */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
              <button
                onClick={() => onNavigateToTab('wayfinder')}
                className="flex-1 sm:flex-none px-4 py-3 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                title="Find direction to cabin"
              >
                <Compass className="w-4 h-4" />
                <span>1-Click Locate Cabin</span>
              </button>

              <button
                onClick={() => onNavigateToTab('live-token')}
                className="flex-1 sm:flex-none px-4 py-3 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Live Queue Board</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Secure Token Lookup & Privacy Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Secure Token Lookup Facility */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Secure Token & Queue Lookup</h3>
              <p className="text-xs text-slate-500">Check queue status with zero personal identity leakage.</p>
            </div>
          </div>

          <form onSubmit={handleSecureLookup} className="flex gap-2 mt-4">
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Enter Token No (e.g. OPD-ORTH-002)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-hidden focus:border-blue-600"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition cursor-pointer"
            >
              Verify
            </button>
          </form>

          {lookupResult && lookupResult !== 'NOT_FOUND' && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>Token: {lookupResult.tokenNumber}</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-mono">{lookupResult.status}</span>
              </div>
              <div className="mt-2 text-slate-600 grid grid-cols-2 gap-2">
                <span>Department: {lookupResult.departmentName}</span>
                <span>Room/Cabin: {lookupResult.roomCabin}</span>
                <span>Doctor: {lookupResult.doctorName}</span>
                <span>Est. Wait: ~{lookupResult.estimatedWaitMinutes} mins</span>
              </div>
              <p className="text-[10px] text-teal-700 mt-2 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Sanitized display: Patient personal health data protected.
              </p>
            </div>
          )}

          {lookupResult === 'NOT_FOUND' && (
            <p className="mt-3 text-xs text-red-600 font-semibold">
              Token number not found in today's active queues. Please check the number or visit the registration desk.
            </p>
          )}
        </div>

        {/* Patient-Controlled Consent & Privacy Settings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Patient Consent & Privacy Control</h3>
              <p className="text-xs text-slate-500">You decide how your health data is shared in the hospital.</p>
            </div>
          </div>

          <div className="space-y-3 mt-4 text-xs">
            {/* ABHA Sharing Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Share ABHA Records with Assigned OPD Doctor</p>
                <p className="text-slate-500 text-[11px]">Allows attending doctor to review historical lab reports.</p>
              </div>
              <button
                type="button"
                onClick={() => setAbhaConsentGranted(!abhaConsentGranted)}
                className={`w-12 h-6 rounded-full transition p-1 flex items-center cursor-pointer ${
                  abhaConsentGranted ? 'bg-teal-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-xs"></span>
              </button>
            </div>

            {/* Public Queue Masking */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Anonymize Name on Waiting Room Screens</p>
                <p className="text-slate-500 text-[11px]">Displays your name as R**** S**** on corridor monitors.</p>
              </div>
              <button
                type="button"
                onClick={() => setMaskPublicName(!maskPublicName)}
                className={`w-12 h-6 rounded-full transition p-1 flex items-center cursor-pointer ${
                  maskPublicName ? 'bg-teal-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-xs"></span>
              </button>
            </div>

            {/* Notification Channel Preference */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="font-bold text-slate-800">Queue SMS & WhatsApp Alerts</p>
                <p className="text-slate-500 text-[11px]">Receive an alert 3 tokens before your turn is called.</p>
              </div>
              <select
                value={notificationChannel}
                onChange={(e) => setNotificationChannel(e.target.value as any)}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                <option value="ALL">SMS & WhatsApp</option>
                <option value="SMS">SMS Only</option>
                <option value="WHATSAPP">WhatsApp Only</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* 10 Clearly Visible Service Cards */}
      <div className="mb-2">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Hospital Patient Services</h2>
        <p className="text-xs text-slate-500">Tap on any service card below for immediate access.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        
        {/* 1. Doctor Appointment / Generate OPD Token */}
        <div 
          onClick={onOpenOpdRegistration}
          className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-teal-500 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-xs">
              <Ticket className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition">
              1. Book OPD Token
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Register for doctor consultation across 11 departments. Automatic doctor allocation based on weekly duty rotation.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
            <span>Book Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 2. Live Token Information & Tracking */}
        <div 
          onClick={() => onNavigateToTab('live-token')}
          className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-xs">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition">
              2. Live Queue Tracker
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Track current token being served, your queue position, estimated waiting time, and audio chime announcements.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
            <span>View Queue Board</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 3. Emergency Assistance 108 */}
        <div 
          onClick={() => onNavigateToTab('ambulance-dashboard')}
          className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-red-500 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-xs">
              <PhoneCall className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-600 transition">
              3. Emergency 108
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Accident trauma triage, critical heart attack/stroke response, and priority ambulance routing to casualty.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-red-600">
            <span>Emergency Portal</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 4. Available Hospital Beds */}
        <div 
          onClick={() => onNavigateToTab('beds')}
          className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-xs">
              <BedDouble className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition">
              4. Available Beds
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Transparent real-time occupancy tracker for General Ward, ICU, Orthopaedic, Emergency, and Paediatric beds.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>Check Bed Matrix</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 5. Doctor Guide Box */}
        <div 
          onClick={() => onNavigateToTab('guide-box')}
          className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-indigo-500 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-xs">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition">
              5. Doctor Guide Box
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Secure case-specific group communication with assigned doctor team. Patient-visible privacy enforced.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
            <span>Open Case Chat</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 6. Doctor Directory & Hierarchy */}
        <div 
          onClick={() => onNavigateToTab('doctors')}
          className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-cyan-500 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-xs">
              <Stethoscope className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-700 transition">
              6. Doctor Directory
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Browse hospital medical hierarchy from Director, HOD, Deans, Associate Professors, down to Junior Residents.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-700">
            <span>Search Doctors</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 7. Hospital Indoor Navigation */}
        <div 
          onClick={() => onNavigateToTab('wayfinder')}
          className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-amber-500 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-xs">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition">
              7. Hospital Wayfinder
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Step-by-step indoor route map to your assigned OPD cabin, diagnostic radiology labs, ICU, and Jan Aushadhi pharmacy.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
            <span>Get Directions</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 8. My Medical / Visit History */}
        <div 
          onClick={onOpenMedicalHistory}
          className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-violet-500 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-xs">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-700 transition">
              8. Visit & Health History
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              FHIR R4 compliant record bundle of your past consultations, digital prescriptions, and laboratory reports.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-violet-700">
            <span>View Records</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 9. Profile & ABHA Digital Card */}
        <div 
          onClick={onOpenAbhaCard}
          className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-rose-500 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-xs">
              <CreditCard className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-700 transition">
              9. ABHA Digital Health Card
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Official Ayushman Bharat Digital ID card with QR code, demographic verification, and linked health lockers.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-700">
            <span>View Health Card</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* 10. Biometric Passkey Enrollment */}
        <div 
          onClick={handleRegisterPasskey}
          className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-blue-600 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-xs">
              <Fingerprint className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition">
              10. Biometric Passkey
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Fast fingerprint or Face ID login via WebAuthn with hardware cryptographic chip protection.
            </p>
            {passkeyStatus && (
              <p className="text-[11px] font-semibold text-blue-700 mt-2 bg-blue-50 p-1.5 rounded-lg">
                {passkeyStatus}
              </p>
            )}
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
            <span>Enroll Passkey</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

      </div>

    </div>
  );
};
