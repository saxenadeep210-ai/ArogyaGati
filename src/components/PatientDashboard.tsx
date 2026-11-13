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
  AlertTriangle
} from 'lucide-react';
import { hospitalStore } from '../services/hospitalStore';
import { HOSPITAL_INFO } from '../services/mockData';
import { QueueToken, AuthUser } from '../types';

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Welcome & Senior Citizen Friendly Greeting */}
      <div className="bg-gradient-to-r from-blue-700 via-teal-700 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
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
              Welcome to {HOSPITAL_INFO.shortName}. Select a service below to book OPD, track your token, check beds, or speak with your doctor team.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onOpenOpdRegistration}
              className="px-6 py-3.5 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/30 transition flex items-center justify-center gap-2"
            >
              <Ticket className="w-5 h-5 text-slate-950" />
              <span>Book OPD Token</span>
            </button>
            <button
              onClick={onOpenAbhaCard}
              className="px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-teal-300" />
              <span>View ABHA Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Token Notification Banner (if patient has a token in queue) */}
      {activeToken && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex flex-col items-center justify-center font-black shadow-md">
                <span className="text-[10px] uppercase font-bold tracking-wider">Token</span>
                <span className="text-lg leading-tight">{activeToken.tokenNumber.split('-').pop()}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-md font-mono">
                    {activeToken.tokenNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {activeToken.departmentName}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    activeToken.status === 'CALLED' ? 'bg-red-500 text-white animate-pulse' :
                    activeToken.status === 'IN_CONSULTATION' ? 'bg-blue-600 text-white' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    Status: {activeToken.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  <span><strong>Attending Doctor:</strong> {activeToken.doctorName}</span>
                  <span><strong>Room / Cabin:</strong> {activeToken.roomCabin} ({activeToken.building})</span>
                  <span><strong>Est. Wait:</strong> ~{activeToken.estimatedWaitMinutes} mins</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => onNavigateToTab('live-token')}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <Clock className="w-4 h-4" />
                <span>Track Live Queue</span>
              </button>
              <button
                onClick={() => onNavigateToTab('guide-box')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Doctor Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10 Clearly Visible Service Cards (Section 5 Requirement) */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Hospital Patient Services</h2>
        <p className="text-xs text-slate-500">Tap on any service card below for immediate access.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        
        {/* 1. Doctor Appointment / Generate OPD Token */}
        <div 
          onClick={onOpenOpdRegistration}
          className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-teal-500 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-sm">
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
          className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-sm">
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
          className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-red-500 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-sm">
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
          className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-sm">
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
          className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-indigo-500 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-sm">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition">
              5. Doctor Guide Box
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Secure case-specific group communication with assigned senior and junior doctors. Complete privacy protection.
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
          className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-cyan-500 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-sm">
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
          className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-amber-500 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-sm">
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
          className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-violet-500 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-sm">
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
          className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-rose-500 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-sm">
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

        {/* 10. Hospital Info & Helplines */}
        <div 
          onClick={() => alert(`S. N. Medical College, Agra\nAddress: ${HOSPITAL_INFO.location}\nHelpline: ${HOSPITAL_INFO.emergencyHelpline}\nOPD Timings: ${HOSPITAL_INFO.opdTimings}\nDirector: ${HOSPITAL_INFO.director}`)}
          className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-slate-400 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-sm">
              <Info className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-700 transition">
              10. Hospital Info & Helplines
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              OPD timings, casualty contact numbers, blood bank availability, patient welfare cell, and feedback hotline.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Hospital Guide</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </div>

      </div>

    </div>
  );
};
