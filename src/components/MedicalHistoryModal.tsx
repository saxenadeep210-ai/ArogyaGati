import React from 'react';
import { X, FileText, Calendar, Stethoscope, Download, CheckCircle2, User } from 'lucide-react';
import { hospitalStore } from '../services/hospitalStore';

interface MedicalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MedicalHistoryModal: React.FC<MedicalHistoryModalProps> = ({ isOpen, onClose }) => {
  const user = hospitalStore.getUser();
  const allTokens = hospitalStore.getTokens();

  if (!isOpen) return null;

  // Past visits for this patient
  const myVisits = allTokens.filter(t => t.patientName === user?.name || t.mobile === user?.mobile || t.id === 'TOK-002');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Patient Medical & Consultation History</h3>
              <p className="text-xs text-slate-500">FHIR R4 Diagnostic Records • S. N. Medical College</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[11px]">Patient Name:</span>
              <span className="font-bold text-slate-800 text-sm">{user?.name || 'Ramesh Sharma'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">ABHA ID:</span>
              <span className="font-mono font-bold text-teal-700">{user?.abhaId || '14-5544-7788-9922'}</span>
            </div>
          </div>

          <div className="space-y-3">
            {myVisits.map(visit => (
              <div key={visit.id} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-violet-300 transition space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-violet-700 text-xs">
                    {visit.tokenNumber}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {visit.scheduledDate} • {visit.registrationTime}
                  </span>
                </div>

                <div className="font-bold text-slate-800 text-sm">
                  {visit.departmentName} — {visit.doctorName}
                </div>

                <div className="text-slate-600">
                  <span className="font-medium">Chief Problem: </span>
                  {visit.causeOfVisit} ({visit.symptoms})
                </div>

                {visit.clinicalNotes && (
                  <div className="bg-violet-50/70 p-2.5 rounded-xl border border-violet-100 text-slate-700">
                    <span className="font-bold text-violet-900 block mb-0.5">Clinical Examination Notes:</span>
                    <p className="italic">{visit.clinicalNotes}</p>
                  </div>
                )}

                {visit.prescription && (
                  <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 text-emerald-950 font-mono text-[11px]">
                    <span className="font-bold font-sans text-emerald-900 block mb-0.5">Prescribed Medicines:</span>
                    <pre className="whitespace-pre-wrap">{visit.prescription}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
