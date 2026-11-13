import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Volume2, 
  Compass, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  UserCheck, 
  Building2,
  RefreshCw,
  Bell
} from 'lucide-react';
import { hospitalStore, playHospitalChime } from '../services/hospitalStore';
import { QueueToken } from '../types';

interface LiveTokenTrackerProps {
  onNavigateToTab: (tab: string) => void;
  onOpenOpdRegistration: () => void;
}

export const LiveTokenTracker: React.FC<LiveTokenTrackerProps> = ({ 
  onNavigateToTab,
  onOpenOpdRegistration 
}) => {
  const [tokens, setTokens] = useState<QueueToken[]>(hospitalStore.getTokens());
  const [selectedDept, setSelectedDept] = useState('DEP-ORTHO');
  const departments = hospitalStore.getDepartments();

  useEffect(() => {
    return hospitalStore.subscribe(() => {
      setTokens(hospitalStore.getTokens());
    });
  }, []);

  const filteredTokens = tokens.filter(t => selectedDept === 'ALL' || t.departmentId === selectedDept);
  
  // Find current token being served in this department
  const currentCalling = filteredTokens.find(t => t.status === 'CALLED');
  const currentInConsultation = filteredTokens.find(t => t.status === 'IN_CONSULTATION');
  const waitingTokens = filteredTokens.filter(t => t.status === 'WAITING' || t.status === 'REGISTERED');

  // Featured patient token (default Ramesh Sharma or first active)
  const myToken = filteredTokens.find(t => t.id === 'TOK-002') || filteredTokens[0] || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Real-Time Redis Queue Broadcast Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Live OPD Queue & Token Information
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Displaying live token updates, audio chime alerts, and estimated waiting times for S. N. Medical College.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => playHospitalChime()}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition flex items-center gap-1.5"
            title="Play standard hospital announcement chime"
          >
            <Volume2 className="w-4 h-4 text-blue-600" />
            <span>Test Chime</span>
          </button>

          <button
            onClick={onOpenOpdRegistration}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition"
          >
            + New Token
          </button>
        </div>
      </div>

      {/* Main Digital Calling Board (Airport / Hospital LED Board Style) */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8">
          
          {/* Left: Token Being Served Right Now */}
          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider animate-pulse">
              <Bell className="w-3.5 h-3.5 text-red-400" />
              <span>Now Calling / In Consultation</span>
            </div>

            <div>
              <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-teal-400 drop-shadow-md">
                {currentCalling?.tokenNumber || currentInConsultation?.tokenNumber || 'OPD-ORTHO-038'}
              </div>
              <p className="text-sm font-semibold text-slate-300 mt-1">
                Patient: <span className="text-white font-bold">{currentCalling?.patientName || currentInConsultation?.patientName || 'Suraj Kumar'}</span> ({currentCalling?.gender || 'MALE'}, {currentCalling?.patientAge || 42}y)
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[11px]">Room / Cabin:</span>
                <span className="font-bold text-white text-sm">{currentCalling?.roomCabin || 'Cabin 07'}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[11px]">Attending Doctor:</span>
                <span className="font-bold text-white truncate block">{currentCalling?.doctorName || 'Prof. Arvind Mehta'}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[11px]">Status:</span>
                <span className="font-bold text-emerald-400 uppercase">
                  {currentCalling ? 'CALLED TO CABIN' : 'IN CONSULTATION'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Next Up & Estimated Pace */}
          <div className="lg:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-blue-200 uppercase tracking-wider mb-3">
                <span>Next in Line</span>
                <Clock className="w-4 h-4 text-teal-300" />
              </div>

              {waitingTokens.length > 0 ? (
                <div className="space-y-2">
                  {waitingTokens.slice(0, 3).map((token, idx) => (
                    <div key={token.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
                      <div>
                        <span className="font-mono font-bold text-teal-300 block">{token.tokenNumber}</span>
                        <span className="text-[11px] text-slate-300">{token.patientName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                          Pos #{idx + 1}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">~{token.estimatedWaitMinutes}m wait</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No waiting tokens in this queue.</p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span>Total in Dept Queue:</span>
              <span className="font-black text-white text-sm">{filteredTokens.length} Patients</span>
            </div>
          </div>

        </div>
      </div>

      {/* Patient Specific Token Card (if user has token) */}
      {myToken && (
        <div className="bg-white rounded-3xl p-6 border-2 border-teal-500 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Your Registered Consultation Slip
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                {myToken.patientName} — {myToken.tokenNumber}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                myToken.status === 'CALLED' ? 'bg-red-500 text-white animate-pulse' :
                myToken.status === 'IN_CONSULTATION' ? 'bg-blue-600 text-white' :
                'bg-amber-100 text-amber-800'
              }`}>
                {myToken.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Department:</span>
              <span className="font-bold text-slate-800 text-sm">{myToken.departmentName}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Doctor / Faculty:</span>
              <span className="font-bold text-slate-800 text-sm truncate block">{myToken.doctorName}</span>
              <span className="text-[10px] text-slate-500">{myToken.doctorDesignation}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Room / Cabin:</span>
              <span className="font-bold text-teal-700 text-sm">{myToken.roomCabin}</span>
              <span className="text-[10px] text-slate-500">{myToken.building}, Floor {myToken.floor}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Estimated Wait:</span>
              <span className="font-bold text-amber-700 text-base">~{myToken.estimatedWaitMinutes} minutes</span>
              <span className="text-[10px] text-slate-500 block">Queue Position: #{myToken.queuePosition}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigateToTab('wayfinder')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-teal-300" />
              <span>Get Indoor Walking Directions to {myToken.roomCabin}</span>
            </button>

            <button
              onClick={() => onNavigateToTab('guide-box')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message Assigned Doctor Team</span>
            </button>
          </div>
        </div>
      )}

      {/* Department Filter & Live Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-base text-slate-900">
            Department-wise Live Queue Table
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filter Department:</span>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Departments (सभी विभाग)</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Token No.</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Age/Gender</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Doctor & Cabin</th>
                <th className="py-3 px-4">Wait Time</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTokens.map(token => (
                <tr key={token.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {token.tokenNumber}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {token.patientName}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {token.patientAge}y / {token.gender}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {token.departmentName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800 block">{token.doctorName}</span>
                    <span className="text-[10px] text-teal-700 font-semibold">{token.roomCabin}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-700">
                    {token.status === 'COMPLETED' ? '-' : `~${token.estimatedWaitMinutes}m`}
                  </td>
                  <td className="py-3 px-4">
                    {token.priority === 'EMERGENCY' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-300 animate-pulse">
                        EMERGENCY
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        NORMAL
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      token.status === 'CALLED' ? 'bg-red-500 text-white animate-pulse' :
                      token.status === 'IN_CONSULTATION' ? 'bg-blue-600 text-white' :
                      token.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {token.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
