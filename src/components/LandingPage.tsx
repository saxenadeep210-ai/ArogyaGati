import React from 'react';
import { 
  HeartPulse, 
  Ticket, 
  Truck, 
  Stethoscope, 
  BedDouble, 
  Compass, 
  MessageSquare, 
  CalendarClock, 
  ShieldCheck, 
  PhoneCall, 
  ArrowRight,
  Clock,
  Sparkles,
  Users
} from 'lucide-react';
import { HOSPITAL_INFO } from '../services/mockData';
import { hospitalStore } from '../services/hospitalStore';

interface LandingPageProps {
  onNavigateToTab: (tab: string) => void;
  onOpenLogin: () => void;
  onOpenOpdRegistration: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onNavigateToTab, 
  onOpenLogin,
  onOpenOpdRegistration 
}) => {
  const beds = hospitalStore.getBeds();
  const availableBedsCount = beds.filter(b => b.status === 'AVAILABLE').length;
  const icuAvailable = beds.filter(b => b.bedCategory === 'ICU' && b.status === 'AVAILABLE').length;
  const activeTokensCount = hospitalStore.getTokens().filter(t => t.status === 'WAITING' || t.status === 'CALLED' || t.status === 'IN_CONSULTATION').length;
  const emergencyCount = hospitalStore.getEmergencyCases().filter(c => c.status === 'EN_ROUTE' || c.status === 'DISPATCHED').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Official Government Hospital Banner */}
      <section className="bg-gradient-to-b from-blue-900 via-blue-800 to-teal-800 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Subtle background geometry */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Government Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Ayushman Bharat Digital Mission (ABDM) • S. N. Medical College, Agra</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Arogya<span className="text-teal-300">Gati</span>: Unified Smart Government Hospital Platform
              </h1>
              
              <p className="text-base sm:text-lg text-blue-100 font-normal leading-relaxed max-w-2xl">
                Eliminating long OPD queues, coordinating emergency ambulances, providing transparent real-time bed tracking, weekly doctor duty rotations, and secure clinical guidance for every citizen.
              </p>

              {/* Quick Action CTAs */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={onOpenOpdRegistration}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-lg shadow-teal-500/20 transition flex items-center gap-2"
                >
                  <Ticket className="w-5 h-5 text-slate-950" />
                  <span>Generate OPD Token</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigateToTab('live-token')}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition flex items-center gap-2"
                >
                  <Clock className="w-5 h-5 text-teal-300" />
                  <span>Track Live Queue</span>
                </button>

                <button
                  onClick={() => onNavigateToTab('beds')}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition flex items-center gap-2"
                >
                  <BedDouble className="w-5 h-5 text-teal-300" />
                  <span>Check Available Beds</span>
                </button>
              </div>

              {/* Government Compliance Notes */}
              <div className="flex items-center gap-6 pt-2 text-xs text-blue-200">
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-teal-300" />
                  <span>ABHA ID Verified</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-teal-300" />
                  <span>Real-time Dynamic Waiting Time</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <PhoneCall className="w-4 h-4 text-teal-300" />
                  <span>108 Ambulance Priority Link</span>
                </div>
              </div>
            </div>

            {/* Right Live Hospital Status Board */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl text-white">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
                      Live Hospital Ops
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-blue-200">
                    {HOSPITAL_INFO.shortName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-5">
                  <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
                    <div className="flex items-center justify-between text-xs text-blue-200 mb-1">
                      <span>Available Beds</span>
                      <BedDouble className="w-4 h-4 text-teal-300" />
                    </div>
                    <div className="text-2xl font-black text-white">{availableBedsCount} <span className="text-xs text-teal-300 font-normal">/ {beds.length} Total</span></div>
                    <div className="text-[10px] text-teal-200 mt-0.5">ICU Beds Free: {icuAvailable}</div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
                    <div className="flex items-center justify-between text-xs text-blue-200 mb-1">
                      <span>Active OPD Queue</span>
                      <Ticket className="w-4 h-4 text-teal-300" />
                    </div>
                    <div className="text-2xl font-black text-white">{activeTokensCount} <span className="text-xs text-blue-200 font-normal">Patients</span></div>
                    <div className="text-[10px] text-emerald-300 mt-0.5">Avg Wait: ~14 mins</div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
                    <div className="flex items-center justify-between text-xs text-blue-200 mb-1">
                      <span>Emergency 108</span>
                      <Truck className="w-4 h-4 text-red-300" />
                    </div>
                    <div className="text-2xl font-black text-white">{emergencyCount} <span className="text-xs text-red-300 font-normal">Inbound</span></div>
                    <div className="text-[10px] text-red-200 mt-0.5">Trauma Bay Prepared</div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
                    <div className="flex items-center justify-between text-xs text-blue-200 mb-1">
                      <span>Specialist Sets</span>
                      <CalendarClock className="w-4 h-4 text-teal-300" />
                    </div>
                    <div className="text-2xl font-black text-white">Set A <span className="text-xs text-teal-300 font-normal">Active</span></div>
                    <div className="text-[10px] text-blue-200 mt-0.5">HOD & Senior Faculty</div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigateToTab('patient-dashboard')}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-white text-blue-900 hover:bg-blue-50 shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <span>Open Patient Service Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4 Dedicated Role Portals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 z-20 w-full mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Citizen / Patient */}
          <div 
            onClick={() => {
              hospitalStore.loginAsRole('PATIENT');
              onNavigateToTab('patient-dashboard');
            }}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition">
                1. Patient / Citizen
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                PWA
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Book OPD tokens, view dynamic queue status, bed availability, Doctor Guide Box chat, and campus wayfinding.
            </p>
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <span>Enter Citizen Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 2: Ambulance */}
          <div 
            onClick={() => {
              hospitalStore.loginAsRole('AMBULANCE');
              onNavigateToTab('ambulance-dashboard');
            }}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md hover:shadow-xl hover:border-red-300 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition">
              <Truck className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-900 text-base group-hover:text-red-600 transition">
                2. Ambulance 108
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                Priority
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Register critical road trauma and cardiac emergencies, alert receiving hospital in advance, and reserve emergency beds.
            </p>
            <div className="text-xs font-bold text-red-600 flex items-center gap-1">
              <span>Enter Ambulance Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 3: Doctor Desk */}
          <div 
            onClick={() => {
              hospitalStore.loginAsRole('DOCTOR', 'DOC-ORTHO-1001');
              onNavigateToTab('doctor-desk');
            }}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition">
                3. Doctor Desk
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Clinical
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Real-time OPD queue caller, hospital chime announcements, clinical diagnosis notes, and patient consultation.
            </p>
            <div className="text-xs font-bold text-blue-700 flex items-center gap-1">
              <span>Enter Doctor Desk</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 4: Staff Admin */}
          <div 
            onClick={() => {
              hospitalStore.loginAsRole('STAFF_ADMIN');
              onNavigateToTab('admin-dashboard');
            }}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-900 text-base group-hover:text-purple-700 transition">
                4. Staff & Admin
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                Operations
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Bed inventory management, hospital building maps, doctor weekly schedule sets A/B/C, and ABDM gateway monitor.
            </p>
            <div className="text-xs font-bold text-purple-700 flex items-center gap-1">
              <span>Enter Admin Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>

        </div>
      </section>

      {/* Core Innovation Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Engineered for High-Volume Public Healthcare
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Built strictly in accordance with the handwritten architectural blueprint specifications for S. N. Medical College, Agra.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Doctor Guide Box</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Case-specific group chat associating 1 Senior Doctor, 1 Associate Professor, and Junior Residents. Strict privacy protects doctors' personal phone numbers and emails while separating patient-visible from internal staff notes.
            </p>
            <button
              onClick={() => onNavigateToTab('guide-box')}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Explore Guide Box</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
              <CalendarClock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Set A/B/C Weekly Rotation</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Dynamic duty allocation where Set A serves Monday/Thursday, Set B serves Tuesday/Friday, and Set C serves Wednesday/Saturday. Automatic doctor scheduling prevents manual assignment bottlenecks.
            </p>
            <button
              onClick={() => onNavigateToTab('doctors')}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>View Doctor Hierarchy</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1.5">Hospital Indoor Wayfinder</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Node-edge graph navigation across hospital campus, Building A/B/C, elevators, and floorplans. Provides elderly patients with turn-by-turn walking instructions and estimated distance.
            </p>
            <button
              onClick={() => onNavigateToTab('wayfinder')}
              className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1"
            >
              <span>Test Campus Navigation</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-200 text-sm">ArogyaGati Hospital System</p>
              <p className="text-[11px] text-slate-500">{HOSPITAL_INFO.name}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs">
            <span>Helpline: {HOSPITAL_INFO.emergencyHelpline}</span>
            <span>•</span>
            <span>OPD Hours: {HOSPITAL_INFO.opdTimings}</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">FHIR R4 & ABDM Integrated</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
