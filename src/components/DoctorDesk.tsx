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
  CheckSquare
} from 'lucide-react';
import { hospitalStore, playHospitalChime } from '../services/hospitalStore';
import { QueueToken, Doctor } from '../types';

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

  // Identify current doctor
  const doctors = hospitalStore.getDoctors();
  const currentDoc: Doctor = doctors.find(d => d.doctorId === currentUser?.doctorId) || doctors[1]; // default Prof Arvind Mehta

  useEffect(() => {
    const update = () => {
      const all = hospitalStore.getTokens();
      setTokens(all);
      const inProg = all.find(t => (t.doctorId === currentDoc.doctorId || t.departmentId === currentDoc.departmentId) && t.status === 'IN_CONSULTATION');
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
  const deptTokens = tokens.filter(t => t.departmentId === currentDoc.departmentId);
  const currentCalled = deptTokens.find(t => t.status === 'CALLED');
  const currentInConsult = deptTokens.find(t => t.status === 'IN_CONSULTATION');
  const waitingTokens = deptTokens.filter(t => t.status === 'WAITING' || t.status === 'REGISTERED');
  const completedTokens = deptTokens.filter(t => t.status === 'COMPLETED');
  const emergencyTokens = deptTokens.filter(t => t.priority === 'EMERGENCY' && t.status !== 'COMPLETED');

  // Call Next Patient
  const handleCallNext = () => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Doctor Header & Duty Overview */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-teal-300 font-bold text-xl shadow-inner">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-teal-300 bg-white/10 px-2 py-0.5 rounded">
                  {currentDoc.doctorId}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Duty Set: {currentDoc.doctorSet} (Mon/Thu)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-1">
                {currentDoc.name}
              </h1>
              <p className="text-xs text-blue-200 font-medium">
                {currentDoc.designation} • {currentDoc.departmentName} • {currentDoc.qualification}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center gap-6 text-xs">
            <div>
              <span className="text-blue-200 block text-[11px]">Assigned Room:</span>
              <span className="font-bold text-white text-base">{currentDoc.roomCabin}</span>
            </div>
            <div className="border-l border-white/15 pl-6">
              <span className="text-blue-200 block text-[11px]">Building:</span>
              <span className="font-bold text-white text-base">{currentDoc.building}</span>
            </div>
          </div>
        </div>

        {/* 5 Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/15 text-xs">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-blue-200 text-[11px]">Currently Calling</span>
            <p className="text-xl font-mono font-black text-amber-300 mt-0.5">
              {currentCalled?.tokenNumber || '-'}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-blue-200 text-[11px]">In Consultation</span>
            <p className="text-xl font-mono font-black text-teal-300 mt-0.5">
              {currentInConsult?.tokenNumber || '-'}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-blue-200 text-[11px]">Waiting Patients</span>
            <p className="text-xl font-black text-white mt-0.5">
              {waitingTokens.length}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <span className="text-red-300 text-[11px] font-bold">Emergency Triage</span>
            <p className="text-xl font-black text-red-400 mt-0.5">
              {emergencyTokens.length}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 col-span-2 sm:col-span-1">
            <span className="text-emerald-300 text-[11px]">Completed Today</span>
            <p className="text-xl font-black text-emerald-400 mt-0.5">
              {completedTokens.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Calling & Doctor Desk Action Strip */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Active Consultation Queue Controls
          </h2>
          <p className="text-xs text-slate-500">
            Calling the next patient triggers the hospital chime, updates Redis Sorted Sets, and alerts the patient PWA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleCallNext}
            className="flex-1 md:flex-none px-6 py-3 rounded-2xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2"
          >
            <Volume2 className="w-4 h-4 text-slate-950" />
            <span>Call Next Patient Chime</span>
          </button>

          {currentCalled && (
            <button
              onClick={() => handleStartConsultation(currentCalled)}
              className="flex-1 md:flex-none px-6 py-3 rounded-2xl font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20 transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>Start Consultation ({currentCalled.tokenNumber})</span>
            </button>
          )}

          {currentInConsult && (
            <button
              onClick={() => {
                setActiveConsultation(currentInConsult);
                setConsultModalOpen(true);
              }}
              className="flex-1 md:flex-none px-6 py-3 rounded-2xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Write Notes / Complete</span>
            </button>
          )}
        </div>
      </div>

      {/* Patient Queue Table (Section 10 Requirement) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-900">
              Department OPD Patient Queue ({currentDoc.departmentName})
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {deptTokens.length} Total Registered
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Age / Sex</th>
                <th className="py-3 px-4">Visit Type</th>
                <th className="py-3 px-4">Case Description / Complaints</th>
                <th className="py-3 px-4">Registration</th>
                <th className="py-3 px-4">Wait Time</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deptTokens.map(token => (
                <tr 
                  key={token.id} 
                  className={`transition ${
                    token.status === 'CALLED' ? 'bg-amber-50/70 font-semibold' :
                    token.status === 'IN_CONSULTATION' ? 'bg-blue-50/70' :
                    token.priority === 'EMERGENCY' ? 'bg-red-50/50' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {token.tokenNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block">{token.patientName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">+91 {token.mobile}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {token.patientAge}y / {token.gender}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {token.visitType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-medium text-slate-800 truncate" title={token.causeOfVisit}>
                      {token.causeOfVisit}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate" title={token.symptoms}>
                      {token.symptoms}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {token.registrationTime}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-700">
                    {token.status === 'COMPLETED' ? '-' : `~${token.estimatedWaitMinutes}m`}
                  </td>
                  <td className="py-3.5 px-4">
                    {token.priority === 'EMERGENCY' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-300 animate-pulse">
                        EMERGENCY
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                        NORMAL
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      token.status === 'CALLED' ? 'bg-red-500 text-white animate-pulse' :
                      token.status === 'IN_CONSULTATION' ? 'bg-blue-600 text-white' :
                      token.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      token.status === 'NO_SHOW' ? 'bg-slate-200 text-slate-600' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {token.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {token.status === 'WAITING' && (
                        <button
                          onClick={() => hospitalStore.updateTokenStatus(token.id, 'CALLED')}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 transition"
                          title="Call token"
                        >
                          Call
                        </button>
                      )}

                      {token.status === 'CALLED' && (
                        <button
                          onClick={() => handleStartConsultation(token)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-600 text-white hover:bg-teal-700 transition"
                        >
                          Consult
                        </button>
                      )}

                      {token.status === 'IN_CONSULTATION' && (
                        <button
                          onClick={() => {
                            setActiveConsultation(token);
                            setConsultModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition"
                        >
                          Finish
                        </button>
                      )}

                      <button
                        onClick={() => onOpenCaseChat(token.caseGroupId)}
                        className="p-1 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-slate-100 transition"
                        title="Open Doctor Guide Box case conversation"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      {token.status !== 'COMPLETED' && token.status !== 'NO_SHOW' && (
                        <button
                          onClick={() => handleSkipToken(token.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                          title="Skip Token / No Show"
                        >
                          <SkipForward className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-0.5">Chief Complaints Reported:</span>
                <p className="text-slate-800">{activeConsultation.causeOfVisit} - {activeConsultation.symptoms}</p>
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
                  className="px-4 py-2 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-50 border border-blue-200 transition flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send to Doctor Guide Box</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConsultModalOpen(false)}
                    className="px-4 py-2 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCompleteConsultation(activeConsultation.id)}
                    className="px-5 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition flex items-center gap-1.5"
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
