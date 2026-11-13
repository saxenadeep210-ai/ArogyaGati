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
  Users,
  Building2,
  Activity,
  FileText,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { HOSPITAL_INFO, INITIAL_DEPARTMENTS } from '../services/mockData';
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

  // Determine current active duty set
  const todaySchedule = hospitalStore.getScheduleForDate('DEP-ORTHO', new Date().toISOString().split('T')[0]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 1. Official Government Header Strip */}
      <section className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white pt-10 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Government & ABDM Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Ayushman Bharat Digital Mission (ABDM)</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-slate-200">
              <Building2 className="w-3.5 h-3.5 text-teal-300" />
              <span>Facility ID: {HOSPITAL_INFO.abdmFacilityId} • {HOSPITAL_INFO.shortName}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15]">
                Arogya<span className="text-teal-400">Gati</span>: Unified Smart Public Hospital Platform
              </h1>
              
              <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl">
                Eliminating long OPD queues, coordinating emergency ambulances, providing transparent real-time bed tracking, weekly doctor duty rotations, and secure clinical guidance for every citizen.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={onOpenOpdRegistration}
                  className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-lg shadow-teal-500/20 transition flex items-center gap-2"
                >
                  <Ticket className="w-5 h-5 text-slate-950" />
                  <span>Generate OPD Token</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigateToTab('live-token')}
                  className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition flex items-center gap-2"
                >
                  <Clock className="w-5 h-5 text-teal-300" />
                  <span>Track Live Queue</span>
                </button>

                <button
                  onClick={() => onNavigateToTab('beds')}
                  className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition flex items-center gap-2"
                >
                  <BedDouble className="w-5 h-5 text-teal-300" />
                  <span>Check Available Beds</span>
                </button>
              </div>

              {/* Trust & Compliance Features */}
              <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-teal-300" />
                  <span>ABHA ID Verified</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Activity className="w-4 h-4 text-teal-300" />
                  <span>Real-time Dynamic Wait Time</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <PhoneCall className="w-4 h-4 text-teal-300" />
                  <span>108 Ambulance Priority Triage</span>
                </div>
              </div>
            </div>

            {/* Right Live Hospital Status Board */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl text-white">
                <div className="flex items-center justify-between pb-4 border-b border-white/15">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                      Live Hospital Operations
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-300">
                    {HOSPITAL_INFO.shortName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 py-5">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                      <span>Available Beds</span>
                      <BedDouble className="w-4 h-4 text-teal-300" />
                    </div>
                    <div className="text-2xl font-black text-white">{availableBedsCount} <span className="text-xs text-teal-300 font-normal">/ {beds.length} Total</span></div>
                    <div className="text-[11px] text-teal-200 mt-1">ICU Beds Free: {icuAvailable}</div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                      <span>Active OPD Queue</span>
                      <Ticket className="w-4 h-4 text-teal-300" />
                    </div>
                    <div className="text-2xl font-black text-white">{activeTokensCount} <span className="text-xs text-slate-300 font-normal">Waiting</span></div>
                    <div className="text-[11px] text-emerald-300 mt-1">Avg Consultation: ~8m</div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                      <span>Emergency 108</span>
                      <Truck className="w-4 h-4 text-red-300" />
                    </div>
                    <div className="text-2xl font-black text-white">{emergencyCount} <span className="text-xs text-red-300 font-normal">En-Route</span></div>
                    <div className="text-[11px] text-red-200 mt-1">Trauma Bay Prepared</div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                      <span>Doctor Duty Set</span>
                      <CalendarClock className="w-4 h-4 text-teal-300" />
                    </div>
                    <div className="text-2xl font-black text-white">{todaySchedule.setCode.replace('_', ' ')}</div>
                    <div className="text-[11px] text-teal-200 mt-1">{todaySchedule.dayName} Rotation</div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigateToTab('patient-dashboard')}
                    className="w-full py-3 rounded-2xl font-bold text-xs bg-white text-slate-900 hover:bg-slate-100 shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>Enter Citizen Patient Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. Four Dedicated Role Portals Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 z-20 w-full mb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Citizen / Patient */}
          <div 
            onClick={() => {
              hospitalStore.loginAsRole('PATIENT');
              onNavigateToTab('patient-dashboard');
            }}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-emerald-400 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition">
                1. Citizen / Patient
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                PWA
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Book OPD tokens, view dynamic queue status, bed availability, Doctor Guide Box chat, and campus wayfinding.
            </p>
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <span>Enter Citizen Portal</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 2: Ambulance 108 */}
          <div 
            onClick={() => {
              hospitalStore.loginAsRole('AMBULANCE');
              onNavigateToTab('ambulance-dashboard');
            }}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-red-400 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition">
              <Truck className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-bold text-slate-900 text-base group-hover:text-red-600 transition">
                2. Ambulance 108
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                Priority
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Register critical road trauma and cardiac emergencies, alert receiving hospital in advance, and reserve emergency beds.
            </p>
            <div className="text-xs font-bold text-red-600 flex items-center gap-1">
              <span>Enter Ambulance Portal</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 3: Doctor Desk */}
          <div 
            onClick={() => {
              hospitalStore.loginAsRole('DOCTOR', 'DOC-ORTHO-1001');
              onNavigateToTab('doctor-desk');
            }}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition">
                3. Doctor Desk
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Clinical
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Real-time OPD queue caller, hospital chime announcements, clinical diagnosis notes, and patient consultation.
            </p>
            <div className="text-xs font-bold text-blue-700 flex items-center gap-1">
              <span>Enter Doctor Desk</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 4: Staff & Admin */}
          <div 
            onClick={() => {
              hospitalStore.loginAsRole('STAFF_ADMIN');
              onNavigateToTab('admin-dashboard');
            }}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-purple-400 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-bold text-slate-900 text-base group-hover:text-purple-700 transition">
                4. Staff & Admin
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                Operations
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Bed inventory management, hospital building maps, doctor weekly schedule sets A/B/C, and ABDM gateway monitor.
            </p>
            <div className="text-xs font-bold text-purple-700 flex items-center gap-1">
              <span>Enter Admin Portal</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

        </div>
      </section>

      {/* 3. Today's OPD Specialty Clinics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
              <CalendarClock className="w-4 h-4" />
              <span>Outpatient Department (OPD) Schedule</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Today's Clinical Departments & Specialist Units
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              OPD Timings: {HOSPITAL_INFO.opdTimings} • Token registration active
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToTab('doctors')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition flex items-center gap-1"
            >
              <span>View Full Doctor Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {INITIAL_DEPARTMENTS.slice(0, 6).map(dept => {
            const queueTokens = hospitalStore.getTokensByDepartment(dept.id);
            const waitingCount = queueTokens.filter(t => t.status === 'WAITING' || t.status === 'REGISTERED').length;

            return (
              <div 
                key={dept.id} 
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {dept.code}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1.5">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        {dept.hindiName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {waitingCount} in Queue
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {dept.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl mb-4 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-semibold text-slate-800">{dept.hodName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{dept.building}, Floor {dept.floor}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={onOpenOpdRegistration}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition text-center"
                  >
                    Book Token
                  </button>
                  <button
                    onClick={() => onNavigateToTab('live-token')}
                    className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition"
                  >
                    View Queue
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Emergency 108 Trauma Care Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
        <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-red-700/15 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold mb-1.5">
                <span>24x7 Inbound Emergency Triage</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">
                108 Emergency Ambulance Trauma Dispatch
              </h3>
              <p className="text-xs sm:text-sm text-red-100 mt-1 max-w-xl">
                Critical trauma and cardiac patients receive immediate advance bed reservation and priority status over routine OPD queues.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => {
                hospitalStore.loginAsRole('AMBULANCE');
                onNavigateToTab('ambulance-dashboard');
              }}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-red-50 text-red-700 font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4 text-red-600" />
              <span>Open 108 Dispatch Portal</span>
            </button>
            <a
              href="tel:108"
              className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Helpline: 108</span>
            </a>
          </div>
        </div>
      </section>

      {/* 5. Core Platform Innovations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            Engineered for Modern Governance
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Built for S. N. Medical College & Hospital, Agra
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Fully implemented as specified in the handwritten technical blueprint for high-volume government hospital coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Doctor Guide Box</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Case-specific group chat associating 1 Senior Doctor, 1 Associate Professor, and Junior Residents. Strict privacy protects doctors' personal phone numbers and emails while separating patient-visible from internal staff notes.
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('guide-box')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 pt-3 border-t border-slate-100"
            >
              <span>Explore Guide Box Channel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                <CalendarClock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Weekly Set A/B/C Rotation</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Dynamic duty allocation where Set A serves Monday/Thursday, Set B serves Tuesday/Friday, and Set C serves Wednesday/Saturday. Automatic doctor scheduling prevents manual assignment bottlenecks.
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('doctors')}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5 pt-3 border-t border-slate-100"
            >
              <span>View Doctor Hierarchy & Sets</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Indoor Campus Wayfinder</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Node-edge graph navigation across hospital campus, Building A/B/C, elevators, and floorplans. Provides elderly patients with turn-by-turn walking instructions and estimated distance.
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('wayfinder')}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1.5 pt-3 border-t border-slate-100"
            >
              <span>Test Campus Navigation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* 6. Hospital Information & Notice Board */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 w-full">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-teal-300 mb-2">
                <Building2 className="w-3.5 h-3.5" />
                <span>Hospital Notice Board & Facilities</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">
                {HOSPITAL_INFO.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {HOSPITAL_INFO.location} • Principal & CMS: {HOSPITAL_INFO.director}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                NABH Accredited
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                ABDM Facility: {HOSPITAL_INFO.abdmFacilityId}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                FHIR R4 Compliant
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-xs">
            <div>
              <h4 className="font-bold text-slate-200 mb-2 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>OPD & Casualty Timings</span>
              </h4>
              <p className="text-slate-400 leading-relaxed">
                OPD Registration: 08:00 AM – 02:00 PM (Monday – Saturday)<br />
                Emergency & Trauma Resuscitation: 24 Hours Open (365 Days)
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-200 mb-2 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Free Government Facilities</span>
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Jan Aushadhi Generic Pharmacy on Ground Floor<br />
                Free Diagnostic Blood & Urine Tests, Digital X-Ray, CT Scan
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-200 mb-2 text-sm flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-teal-400" />
                <span>Helplines & Support</span>
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Emergency Trauma: 108 / 0562-2260353<br />
                Chief Medical Superintendent Office: Ext. 101
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Comprehensive Footer */}
      <footer className="mt-auto bg-slate-950 text-slate-400 py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white flex items-center justify-center font-bold">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-200 text-sm">ArogyaGati Smart Hospital Platform</p>
              <p className="text-[11px] text-slate-500">{HOSPITAL_INFO.shortName}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-xs">
            <span>Toll-Free: 108</span>
            <span>•</span>
            <span>Ayushman Bharat ABDM Connected</span>
            <span>•</span>
            <span className="text-teal-400">Government of Uttar Pradesh</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
