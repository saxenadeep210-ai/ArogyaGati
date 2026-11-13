import React, { useState } from 'react';
import { 
  X, 
  Ticket, 
  Calendar, 
  User, 
  Phone, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Stethoscope,
  Printer
} from 'lucide-react';
import { hospitalStore } from '../services/hospitalStore';
import { QueueToken } from '../types';

interface OpdRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenGenerated: (token: QueueToken) => void;
}

export const OpdRegistrationModal: React.FC<OpdRegistrationModalProps> = ({
  isOpen,
  onClose,
  onTokenGenerated
}) => {
  const departments = hospitalStore.getDepartments();
  const currentUser = hospitalStore.getUser();

  const [patientName, setPatientName] = useState(currentUser?.name || 'Ramesh Sharma');
  const [patientAge, setPatientAge] = useState<number>(58);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [mobile, setMobile] = useState(currentUser?.mobile || '9812345678');
  const [abhaId, setAbhaId] = useState(currentUser?.abhaId || '14-5544-7788-9922');
  const [departmentId, setDepartmentId] = useState('DEP-ORTHO');
  
  // Date selection (default today)
  const todayStr = new Date().toISOString().split('T')[0];
  const [preferredDate, setPreferredDate] = useState(todayStr);
  const [visitType, setVisitType] = useState<'NEW' | 'FOLLOW_UP'>('NEW');
  const [isEmergency, setIsEmergency] = useState(false);
  const [causeOfVisit, setCauseOfVisit] = useState('Severe lower back stiffness & left knee pain');
  const [symptoms, setSymptoms] = useState('Difficulty bending down, radiating numbness to left foot for 2 weeks');

  // Confirmation view state
  const [generatedToken, setGeneratedToken] = useState<QueueToken | null>(null);

  if (!isOpen) return null;

  // Active doctor set preview for the selected department and date
  const schedulePreview = hospitalStore.getScheduleForDate(departmentId, preferredDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const token = hospitalStore.generateOpdToken({
      patientName: patientName.trim(),
      patientAge: Number(patientAge),
      gender,
      mobile: mobile.trim(),
      abhaId: abhaId.trim() || undefined,
      departmentId,
      causeOfVisit: causeOfVisit.trim(),
      symptoms: symptoms.trim(),
      visitType,
      preferredDate
    });

    setGeneratedToken(token);
    onTokenGenerated(token);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 my-8 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-teal-700 to-blue-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Ticket className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Generate Official OPD Token</h3>
              <p className="text-xs text-blue-100 font-medium">S. N. Medical College & Hospital, Agra</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!generatedToken ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Section 1: Patient Demographics */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>1. Patient Demographics</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age (Years) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={patientAge}
                    onChange={e => setPatientAge(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender *
                  </label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as 'MALE' | 'FEMALE' | 'OTHER')}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="MALE">Male (पुरुष)</option>
                    <option value="FEMALE">Female (महिला)</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="10 digit mobile"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ABHA ID <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={abhaId}
                    onChange={e => setAbhaId(e.target.value)}
                    placeholder="14-digit ABHA Number"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Medical Category & Scheduling */}
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                <span>2. Department & OPD Schedule</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Medical Category / Department *
                  </label>
                  <select
                    value={departmentId}
                    onChange={e => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-semibold text-slate-800"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.hindiName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Appointment Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={preferredDate}
                    onChange={e => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Dynamic Doctor Set Preview (Section 9 Requirement) */}
              <div className="mt-3 p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200">
                <div className="flex items-center justify-between text-xs font-bold text-blue-900 mb-1">
                  <span>Weekly Duty Schedule: <strong>{schedulePreview.dayName} ({schedulePreview.setCode})</strong></span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-200 text-blue-800 uppercase font-mono">
                    Rotational Set
                  </span>
                </div>
                <p className="text-xs text-blue-800 mb-2">
                  Assigned Team: {schedulePreview.doctors.map(d => `${d.name} (${d.designation})`).join(', ')}
                </p>
                <div className="text-[11px] text-blue-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>OPD Building B • Floor 2 • Cabins 07 to 11</span>
                </div>
              </div>
            </div>

            {/* Section 3: Visit Details & Clinical Complaints */}
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-600" />
                <span>3. Reason for Consultation</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Visit Type
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="visitType"
                        checked={visitType === 'NEW'}
                        onChange={() => setVisitType('NEW')}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span>New Consultation (नया मरीज)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="visitType"
                        checked={visitType === 'FOLLOW_UP'}
                        onChange={() => setVisitType('FOLLOW_UP')}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span>Follow-up (पुनः जांच)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Triage Urgency
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEmergency}
                      onChange={e => setIsEmergency(e.target.checked)}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="text-red-700 font-bold">Mark as Urgent Priority / Accident case</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cause of Visit / Chief Problem *
                  </label>
                  <input
                    type="text"
                    required
                    value={causeOfVisit}
                    onChange={e => setCauseOfVisit(e.target.value)}
                    placeholder="e.g. Severe knee joint pain and swelling"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Symptoms or Brief Description
                  </label>
                  <textarea
                    rows={2}
                    value={symptoms}
                    onChange={e => setSymptoms(e.target.value)}
                    placeholder="Duration of symptoms, previous medicines taken..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20 transition flex items-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>Confirm & Generate Token</span>
              </button>
            </div>

          </form>
        ) : (
          /* Confirmation Slip View (Section 6 Requirement) */
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-black text-slate-900">OPD Token Generated Successfully</h4>
              <p className="text-xs text-slate-500">
                Please show this token slip or QR code at {generatedToken.roomCabin}.
              </p>
            </div>

            {/* Official Token Slip Card */}
            <div id="opd-slip" className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 relative">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4 mb-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    S. N. Medical College & Hospital, Agra
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight text-teal-800">
                    {generatedToken.tokenNumber}
                  </h3>
                  <p className="text-xs text-slate-600 font-semibold">{generatedToken.departmentName}</p>
                </div>

                <div className="text-right">
                  <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg p-1.5 flex flex-col items-center justify-center shadow-inner">
                    <div className="w-full h-full bg-slate-900 rounded flex items-center justify-center text-[9px] text-white font-mono font-bold">
                      QR CODE
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">Scan for Live Status</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div>
                  <span className="text-slate-500 font-medium">Patient Name:</span>
                  <p className="font-bold text-slate-800">{generatedToken.patientName} ({generatedToken.patientAge}y, {generatedToken.gender})</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Registered Mobile:</span>
                  <p className="font-bold text-slate-800 font-mono">+91 {generatedToken.mobile}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Attending Doctor:</span>
                  <p className="font-bold text-slate-800">{generatedToken.doctorName}</p>
                  <p className="text-[11px] text-slate-500">{generatedToken.doctorDesignation}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Room / Cabin Location:</span>
                  <p className="font-bold text-teal-700">{generatedToken.roomCabin}</p>
                  <p className="text-[11px] text-slate-500">{generatedToken.building}, Floor {generatedToken.floor}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Queue Position:</span>
                  <p className="font-bold text-slate-800">#{generatedToken.queuePosition} in line</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Estimated Waiting Time:</span>
                  <p className="font-bold text-amber-700">~{generatedToken.estimatedWaitMinutes} minutes</p>
                </div>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Doctor Guide Box Case Group initialized automatically. You can message your doctor team anytime.</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-900 text-white transition flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print OPD Slip</span>
              </button>

              <button
                onClick={() => {
                  setGeneratedToken(null);
                  onClose();
                }}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Track Live Token</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
