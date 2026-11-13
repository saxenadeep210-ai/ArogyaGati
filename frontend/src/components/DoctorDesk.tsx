import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Volume2, 
  Play, 
  CheckCircle2, 
  SkipForward, 
  MessageSquare, 
  FileText, 
  AlertTriangle, 
  Clock, 
  User, 
  Activity,
  Calendar,
  Building2,
  Filter,
  CheckSquare,
  Sparkles,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { hospitalStore, playHospitalChime } from '../services/hospitalStore';
import { QueueToken, Doctor } from '../types';
import { useTranslation } from '../utils/translations';

interface DoctorDeskProps {
  onOpenCaseChat: (groupId: string) => void;
}

export const DoctorDesk: React.FC<DoctorDeskProps> = ({ onOpenCaseChat }) => {
  const currentUser = hospitalStore.getUser();
  const [tokens, setTokens] = useState<QueueToken[]>(hospitalStore.getTokens());
  const [activeConsultation, setActiveConsultation] = useState<QueueToken | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const { t, isHindi } = useTranslation();

  // Identify current doctor
  const doctors = hospitalStore.getDoctors();
  const currentDoc: Doctor = doctors.find(d => d.doctorId === currentUser?.doctorId) || doctors[1]; // default Prof Arvind Mehta

  useEffect(() => {
    const update = () => {
      const all = hospitalStore.getTokens();
      setTokens(all);
      const inProg = all.find(tok => (tok.doctorId === currentDoc.doctorId || tok.departmentId === currentDoc.departmentId) && tok.status === 'IN_CONSULTATION');
      if (inProg) {
        setActiveConsultation(inProg);
        setClinicalNotes(inProg.clinicalNotes || '');
        setPrescription(inProg.prescription || '');
      }
    };
    update();
    return hospitalStore.subscribe(update);
  }, [currentDoc.doctorId, currentDoc.departmentId]);

  // Department / Doctor specific tokens
  const deptTokens = tokens.filter(tok => tok.departmentId === currentDoc.departmentId);
  const currentCalled = deptTokens.find(tok => tok.status === 'CALLED');
  const currentInConsult = deptTokens.find(tok => tok.status === 'IN_CONSULTATION');
  const waitingTokens = deptTokens.filter(tok => tok.status === 'WAITING' || tok.status === 'REGISTERED');
  const completedTokens = deptTokens.filter(tok => tok.status === 'COMPLETED');
  const emergencyTokens = deptTokens.filter(tok => tok.priority === 'EMERGENCY' && tok.status !== 'COMPLETED');

  // Call Next Patient
  const handleCallNext = () => {
    playHospitalChime();
    // Priority: Emergency first, then first waiting token
    const nextToken = waitingTokens.sort((a, b) => {
      if (a.priority === 'EMERGENCY' && b.priority !== 'EMERGENCY') return -1;
      if (b.priority === 'EMERGENCY' && a.priority !== 'EMERGENCY') return 1;
      return a.queuePosition - b.queuePosition;
    })[0];

    if (nextToken) {
      hospitalStore.updateTokenStatus(nextToken.id, 'CALLED');
    } else {
      alert('No more waiting patients in this OPD queue!');
    }
  };

  // Start Consultation
  const handleStartConsultation = (token: QueueToken) => {
    hospitalStore.updateTokenStatus(token.id, 'IN_CONSULTATION');
    setActiveConsultation(token);
    setClinicalNotes(token.clinicalNotes || 'Patient examined. Vital signs stable.');
    setPrescription(token.prescription || '1. Tab. Paracetamol 650mg TDS x 3 days\n2. Tab. Pantoprazole 40mg OD Before Food\n3. Physiotherapy referral');
    setConsultModalOpen(true);
  };

  // Complete Consultation
  const handleCompleteConsultation = (tokenId: string) => {
    hospitalStore.updateTokenStatus(tokenId, 'COMPLETED', clinicalNotes, prescription);
    setConsultModalOpen(false);
    setActiveConsultation(null);
  };

  // Skip / No Show
  const handleSkipToken = (tokenId: string) => {
    hospitalStore.updateTokenStatus(tokenId, 'NO_SHOW');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-5">
      
      {/* Sleek, Clean, Minimalist Doctor Header (White Card) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#2424B8] font-bold text-lg shadow-xs shrink-0">
              <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-[#2424B8] bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200/80">
                  {currentDoc.doctorId}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {t.desk.dutySet}: {currentDoc.doctorSet} (Mon/Thu)
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {currentDoc.name}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {currentDoc.designation} • {currentDoc.departmentName}
              </p>
            </div>
          </div>

          {/* Location Badge */}
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs self-start md:self-auto">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.desk.assignedCabin}:</span>
              <span className="font-bold text-slate-900">{currentDoc.roomCabin}</span>
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.desk.building}:</span>
              <span className="font-bold text-slate-900">{currentDoc.building}</span>
            </div>
          </div>
        </div>

        {/* 5 Clean Minimalist KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-amber-50/70 rounded-2xl p-3 border border-amber-200/70">
            <span className="text-amber-800 text-[10px] font-bold uppercase tracking-wider block">{t.desk.currentlyCalling}</span>
            <p className="text-lg sm:text-xl font-mono font-black text-amber-900 mt-0.5 truncate">
              {currentCalled?.tokenNumber || '-'}
            </p>
          </div>
          <div className="bg-teal-50/70 rounded-2xl p-3 border border-teal-200/70">
            <span className="text-teal-800 text-[10px] font-bold uppercase tracking-wider block">{t.desk.inConsultation}</span>
            <p className="text-lg sm:text-xl font-mono font-black text-teal-900 mt-0.5 truncate">
              {currentInConsult?.tokenNumber || '-'}
            </p>
          </div>
          <div className="bg-blue-50/70 rounded-2xl p-3 border border-blue-200/70">
            <span className="text-blue-800 text-[10px] font-bold uppercase tracking-wider block">{t.desk.waitingPatients}</span>
            <p className="text-lg sm:text-xl font-black text-blue-900 mt-0.5">
              {waitingTokens.length}
            </p>
          </div>
          <div className="bg-rose-50/70 rounded-2xl p-3 border border-rose-200/70">
            <span className="text-rose-800 text-[10px] font-bold uppercase tracking-wider block">{t.desk.emergencyTriage}</span>
            <p className="text-lg sm:text-xl font-black text-rose-900 mt-0.5">
              {emergencyTokens.length}
            </p>
          </div>
          <div className="bg-emerald-50/70 rounded-2xl p-3 border border-emerald-200/70 col-span-2 sm:col-span-1">
            <span className="text-emerald-800 text-[10px] font-bold uppercase tracking-wider block">{t.desk.completedToday}</span>
            <p className="text-lg sm:text-xl font-black text-emerald-900 mt-0.5">
              {completedTokens.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Calling & Doctor Desk Action Strip */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {t.desk.queueControlsTitle}
          </h2>
          <p className="text-xs text-slate-500">
            {t.desk.queueControlsSub}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCallNext}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>{t.desk.callNextChime}</span>
          </button>

          {currentCalled && (
            <button
              onClick={() => handleStartConsultation(currentCalled)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>{t.desk.startConsultation} ({currentCalled.tokenNumber})</span>
            </button>
          )}

          {activeConsultation && (
            <button
              onClick={() => setConsultModalOpen(true)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs bg-[#2424B8] hover:bg-[#1a1a8c] text-white shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Resume Prescription ({activeConsultation.tokenNumber})</span>
            </button>
          )}
        </div>
      </div>

      {/* Department Patient Queue (Clean Table on Desktop / Clean Cards on Mobile) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              {t.desk.deptQueueHeading} ({currentDoc.departmentName})
            </h3>
            <p className="text-xs text-slate-500">
              {t.desk.totalRegistered.replace('{count}', deptTokens.length.toString())}
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {waitingTokens.length} {t.common.patient}s waiting
          </span>
        </div>

        {/* Mobile View: Cards */}
        <div className="block md:hidden space-y-3">
          {deptTokens.map(token => (
            <div key={token.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#2424B8] bg-blue-50 px-2 py-0.5 rounded">
                  {token.tokenNumber}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  token.status === 'CALLED' ? 'bg-red-500 text-white animate-pulse' :
                  token.status === 'IN_CONSULTATION' ? 'bg-blue-600 text-white' :
                  token.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {token.status}
                </span>
              </div>

              <div>
                <p className="font-bold text-slate-900">{token.patientName}</p>
                <p className="text-[11px] text-slate-500">{token.gender}, {token.patientAge}y • {token.causeOfVisit || 'Routine Checkup'}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500">Wait: ~{token.estimatedWaitMinutes}m</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      hospitalStore.updateTokenStatus(token.id, 'CALLED');
                      playHospitalChime();
                    }}
                    className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-[10px]"
                  >
                    Call Chime
                  </button>
                  <button
                    onClick={() => handleStartConsultation(token)}
                    className="px-3 py-1 bg-teal-600 text-white font-bold rounded-lg text-[10px]"
                  >
                    Consult
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Clean Modern Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-y border-slate-200">
              <tr>
                <th className="py-3 px-3.5">{t.desk.thToken}</th>
                <th className="py-3 px-3.5">{t.desk.thPatient}</th>
                <th className="py-3 px-3.5">{t.desk.thAgeGender}</th>
                <th className="py-3 px-3.5">{t.desk.thComplaint}</th>
                <th className="py-3 px-3.5">{t.desk.thWaitTime}</th>
                <th className="py-3 px-3.5">{t.desk.thPriority}</th>
                <th className="py-3 px-3.5">{t.desk.thStatus}</th>
                <th className="py-3 px-3.5 text-right">{t.desk.thActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deptTokens.map(token => (
                <tr key={token.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                    {token.tokenNumber}
                  </td>
                  <td className="py-3 px-3.5 font-semibold text-slate-800">
                    {token.patientName}
                  </td>
                  <td className="py-3 px-3.5 text-slate-500">
                    {token.patientAge}y / {token.gender}
                  </td>
                  <td className="py-3 px-3.5 text-slate-600 max-w-xs truncate">
                    {token.causeOfVisit || 'General Clinical Review'}
                  </td>
                  <td className="py-3 px-3.5 font-bold text-slate-700">
                    {token.status === 'COMPLETED' ? '-' : `~${token.estimatedWaitMinutes}m`}
                  </td>
                  <td className="py-3 px-3.5">
                    {token.priority === 'EMERGENCY' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 animate-pulse">
                        EMERGENCY
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                        NORMAL
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      token.status === 'CALLED' ? 'bg-red-500 text-white animate-pulse' :
                      token.status === 'IN_CONSULTATION' ? 'bg-blue-600 text-white' :
                      token.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {token.status}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          hospitalStore.updateTokenStatus(token.id, 'CALLED');
                          playHospitalChime();
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 transition cursor-pointer"
                        title="Announce chime to cabin"
                      >
                        Chime
                      </button>
                      <button
                        onClick={() => handleStartConsultation(token)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#2424B8] hover:bg-[#1a1a8c] text-white transition cursor-pointer"
                      >
                        Consult
                      </button>
                      {token.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleSkipToken(token.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                          title="Skip Token / No Show"
                        >
                          <SkipForward className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Consultation Modal (Doctor writing clinical notes & prescription) */}
      {consultModalOpen && activeConsultation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div>
                <span className="text-xs font-bold text-blue-700 font-mono">
                  {activeConsultation.tokenNumber}
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Clinical Examination & Prescription
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: {activeConsultation.patientName} ({activeConsultation.patientAge}y, {activeConsultation.gender})
                </p>
              </div>
              <button
                onClick={() => setConsultModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-0.5">Chief Complaints Reported:</span>
                <p className="text-slate-800">{activeConsultation.causeOfVisit || 'General Clinical Review'}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Clinical Findings & Diagnosis (FHIR Condition)
                </label>
                <textarea
                  rows={3}
                  value={clinicalNotes}
                  onChange={e => setClinicalNotes(e.target.value)}
                  placeholder="e.g. Tenderness over L4-L5 lumbar facet joints. SLR positive at 45 deg on left. Knee joint stable."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Prescription & Medication Plan (FHIR MedicationRequest)
                </label>
                <textarea
                  rows={4}
                  value={prescription}
                  onChange={e => setPrescription(e.target.value)}
                  placeholder="1. Tab Aceclofenac 100mg + Paracetamol 325mg BD after food x 5 days..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => onOpenCaseChat(activeConsultation.caseGroupId)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-50 border border-blue-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send to Doctor Guide Box</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultModalOpen(false)}
                    className="px-4 py-2 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCompleteConsultation(activeConsultation.id)}
                    className="px-5 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Consultation</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
