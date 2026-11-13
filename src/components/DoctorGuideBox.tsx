import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  PhoneOff, 
  User, 
  Stethoscope, 
  AlertCircle, 
  Info,
  PhoneCall,
  CheckCircle2,
  Users
} from 'lucide-react';
import { hospitalStore } from '../services/hospitalStore';
import { DoctorGuideMessage, CaseGroup, AuthUser } from '../types';

interface DoctorGuideBoxProps {
  initialGroupId?: string;
}

export const DoctorGuideBox: React.FC<DoctorGuideBoxProps> = ({ initialGroupId }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(hospitalStore.getUser());
  const [caseGroups, setCaseGroups] = useState<CaseGroup[]>(hospitalStore.getCaseGroups());
  const [activeGroupId, setActiveGroupId] = useState<string>(initialGroupId || caseGroups[0]?.id || 'CASE-GRP-002');
  
  // Perspective Switcher for evaluation: "View as Patient" vs "View as Doctor Team"
  const [viewPerspective, setViewPerspective] = useState<'PATIENT' | 'DOCTOR'>(
    currentUser?.role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT'
  );

  const [messages, setMessages] = useState<DoctorGuideMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [messageVisibility, setMessageVisibility] = useState<'PATIENT_VISIBLE' | 'STAFF_INTERNAL'>('PATIENT_VISIBLE');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      setCurrentUser(hospitalStore.getUser());
      const groups = hospitalStore.getCaseGroups();
      setCaseGroups(groups);
      if (!groups.some(g => g.id === activeGroupId) && groups.length > 0) {
        setActiveGroupId(groups[0].id);
      }
    };
    update();
    return hospitalStore.subscribe(update);
  }, [activeGroupId]);

  useEffect(() => {
    // When view perspective or active group changes, reload messages with privacy filter applied
    const isPatient = viewPerspective === 'PATIENT';
    const msgs = hospitalStore.getMessagesForGroup(activeGroupId, isPatient);
    setMessages(msgs);
  }, [activeGroupId, viewPerspective, caseGroups]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeGroup = caseGroups.find(g => g.id === activeGroupId) || caseGroups[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    hospitalStore.sendMessage({
      groupId: activeGroupId,
      text: inputMessage.trim(),
      visibility: viewPerspective === 'PATIENT' ? 'PATIENT_VISIBLE' : messageVisibility,
      senderRole: viewPerspective === 'DOCTOR' ? 'DOCTOR' : 'PATIENT'
    });

    setInputMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner explaining Doctor Guide Box & Privacy Safeguards */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
              ArogyaGati Doctor Guide Box
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Case-Specific Medical Group Care
          </h1>
          <p className="text-xs text-blue-200 mt-1 max-w-2xl">
            Direct coordination between the patient and their assigned hospital medical team (1 Senior Professor, 1 Associate Professor, 2-3 Junior Residents).
          </p>
        </div>

        {/* Perspective Evaluation Switcher */}
        <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex items-center gap-2 self-stretch md:self-auto">
          <span className="text-xs font-semibold text-blue-200 pl-2">Simulator Perspective:</span>
          <div className="flex bg-slate-900/60 p-1 rounded-xl">
            <button
              onClick={() => setViewPerspective('PATIENT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewPerspective === 'PATIENT' ? 'bg-teal-400 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>View as Patient</span>
            </button>
            <button
              onClick={() => setViewPerspective('DOCTOR')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewPerspective === 'DOCTOR' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>View as Doctor Team</span>
            </button>
          </div>
        </div>
      </div>

      {/* Strict Privacy Notice Box (Section 11 Specification Requirement) */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold block text-sm">Protected Healthcare Privacy Model</span>
            <p className="text-[11px] text-emerald-800">
              Personal telephone numbers and personal emails of doctors are <strong>NEVER</strong> exposed. Messages display masked institutional IDs (e.g. <code>DOC-ORTHO-1042 — Assoc. Professor</code>).
            </p>
          </div>
        </div>

        {viewPerspective === 'PATIENT' ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-[11px] font-bold text-emerald-800">
            <EyeOff className="w-4 h-4 text-emerald-600" />
            <span>Staff-Internal clinical notes are filtered out</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-100 border border-blue-300 text-[11px] font-bold text-blue-900">
            <Eye className="w-4 h-4 text-blue-600" />
            <span>Medical Team Mode: Both Patient & Internal Staff notes visible</span>
          </div>
        )}
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        
        {/* Left: Case Groups List (3 cols) */}
        <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/60 p-4 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Case Groups
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {caseGroups.length} Active
            </span>
          </div>

          <div className="space-y-2">
            {caseGroups.map(group => (
              <div
                key={group.id}
                onClick={() => setActiveGroupId(group.id)}
                className={`p-3.5 rounded-2xl cursor-pointer transition border text-xs ${
                  activeGroupId === group.id 
                    ? 'bg-white border-blue-400 shadow-md ring-2 ring-blue-100' 
                    : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-blue-700">
                    {group.tokenNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {group.lastMessageTime}
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {group.patientName}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  Dept: {group.departmentName}
                </div>
                <p className="text-[11px] text-slate-600 truncate mt-1 italic">
                  "{group.lastMessageText}"
                </p>
              </div>
            ))}
          </div>

          {/* Emergency disclaimer */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2 mt-4">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Doctor Guide Box is for post-op guidance and queries. For life-threatening emergencies, dial 108 immediately.</span>
          </div>
        </div>

        {/* Right: Message Stream & Composer (8 cols) */}
        <div className="md:col-span-8 flex flex-col justify-between h-full bg-white">
          
          {/* Conversation Header */}
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Case Group: {activeGroup?.patientName} ({activeGroup?.tokenNumber})
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                    {activeGroup?.departmentName}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Lead: {activeGroup?.seniorDoctorName} • Junior Residents Assigned
                </p>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-slate-400 block">Encrypted STOMP Channel</span>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online
              </span>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[460px] flex-1 bg-slate-50/40">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No messages yet in this case group.
              </div>
            ) : (
              messages.map(msg => {
                const isInternal = msg.visibility === 'STAFF_INTERNAL';
                const isSystem = msg.senderRole === 'SYSTEM';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center my-2">
                      <span className="inline-block px-3 py-1 rounded-full text-[11px] font-medium bg-slate-200/80 text-slate-700">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${
                      msg.senderRole === 'PATIENT' ? 'items-start' : 'items-end'
                    }`}
                  >
                    {/* Sender Identity Header with Role & MASKED ID */}
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-500 px-1">
                      {msg.isDoctor ? (
                        <>
                          <Stethoscope className="w-3 h-3 text-blue-600" />
                          <span className="font-bold text-blue-900">{msg.senderDisplay}</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 text-emerald-600" />
                          <span className="font-bold text-emerald-900">{msg.senderDisplay}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="font-mono">{msg.timestamp}</span>

                      {/* Staff Internal Badge (only visible in Doctor mode) */}
                      {isInternal && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold border border-amber-300">
                          <Lock className="w-2.5 h-2.5" /> Staff Internal
                        </span>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`p-3.5 rounded-2xl max-w-xl text-xs leading-relaxed shadow-sm ${
                      isInternal 
                        ? 'bg-amber-50 border-2 border-amber-300 text-amber-950 font-medium'
                        : msg.senderRole === 'PATIENT'
                        ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                        : 'bg-blue-600 text-white rounded-tr-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
            
            {/* Visibility Mode Selector for Doctors */}
            {viewPerspective === 'DOCTOR' && (
              <div className="flex items-center gap-4 mb-2.5 px-1 text-xs">
                <span className="font-bold text-slate-600">Message Visibility:</span>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                  <input
                    type="radio"
                    name="msgVisibility"
                    checked={messageVisibility === 'PATIENT_VISIBLE'}
                    onChange={() => setMessageVisibility('PATIENT_VISIBLE')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-emerald-700 font-bold">Patient Visible (मरीज को दिखेगा)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                  <input
                    type="radio"
                    name="msgVisibility"
                    checked={messageVisibility === 'STAFF_INTERNAL'}
                    onChange={() => setMessageVisibility('STAFF_INTERNAL')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-amber-800 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Staff Internal Only (मरीज से गुप्त)
                  </span>
                </label>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder={
                  viewPerspective === 'PATIENT' 
                    ? "Ask your assigned doctor team about medicine or recovery instructions..."
                    : messageVisibility === 'STAFF_INTERNAL'
                    ? "Write confidential internal clinical discussion note (only seen by doctors)..."
                    : "Write clinical advice visible to the patient..."
                }
                className="flex-1 px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50 transition flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
