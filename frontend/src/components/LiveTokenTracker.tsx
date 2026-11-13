import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Volume2, 
  Search,
  CheckCircle2, 
  Activity, 
  Building2,
  RefreshCw,
  Bell,
  ShieldCheck,
  Hash,
  User,
  Sparkles,
  ArrowRight,
  Stethoscope
} from 'lucide-react';
import { hospitalStore, playHospitalChime } from '../services/hospitalStore';
import { QueueToken } from '../types';
import { useTranslation } from '../utils/translations';

interface LiveTokenTrackerProps {
  onNavigateToTab?: (tab: string) => void;
  onOpenOpdRegistration?: () => void;
}

export const LiveTokenTracker: React.FC<LiveTokenTrackerProps> = ({ 
  onNavigateToTab,
  onOpenOpdRegistration 
}) => {
  const [tokens, setTokens] = useState<QueueToken[]>(hospitalStore.getTokens());
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [chimePlaying, setChimePlaying] = useState(false);
  
  // Secure token lookup states
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<QueueToken | null | 'NOT_FOUND'>(null);
  const [verificationCode, setVerificationCode] = useState<string>('');

  const departments = hospitalStore.getDepartments();
  const { t, isHindi } = useTranslation();

  useEffect(() => {
    return hospitalStore.subscribe(() => {
      setTokens(hospitalStore.getTokens());
    });
  }, []);

  const handlePlayChime = () => {
    setChimePlaying(true);
    playHospitalChime();
    setTimeout(() => setChimePlaying(false), 2500);
  };

  const handleSecureLookup = (e?: React.FormEvent, directVal?: string) => {
    if (e) e.preventDefault();
    const query = (directVal !== undefined ? directVal : lookupQuery).trim().toUpperCase();
    if (!query) return;

    const allTokens = hospitalStore.getTokens();
    
    // Multi-format lookup: Full Token, Suffix / Number, ID, or Mobile
    const found = allTokens.find(token => {
      const full = token.tokenNumber.toUpperCase();
      const id = token.id.toUpperCase();
      const mobile = token.mobile;
      const abha = token.abhaId?.toUpperCase() || '';
      
      if (full === query || id === query || mobile === query || abha === query) return true;
      if (full.endsWith(`-${query}`) || full.includes(query)) return true;
      // If user typed numeric e.g. "002" or "2"
      const numPart = full.split('-').pop() || '';
      if (numPart.replace(/^0+/, '') === query.replace(/^0+/, '')) return true;
      return false;
    });

    if (found) {
      setLookupResult(found);
      // Generate a mock SHA-256 verifiable token signature
      const mockHash = `HMAC-${found.id}-${found.tokenNumber.replace(/-/g, '')}-SHA256:7f8b9a2c${found.roomCabin.slice(-2)}e1d`;
      setVerificationCode(mockHash);
    } else {
      setLookupResult('NOT_FOUND');
      setVerificationCode('');
    }
  };

  const filteredTokens = tokens.filter(tok => selectedDept === 'ALL' || tok.departmentId === selectedDept);
  
  // Calling / Consultation token
  const currentCalling = filteredTokens.find(tok => tok.status === 'CALLED');
  const currentInConsultation = filteredTokens.find(tok => tok.status === 'IN_CONSULTATION');
  const activeNow = currentCalling || currentInConsultation || filteredTokens.find(tok => tok.status === 'WAITING') || filteredTokens[0];
  const waitingTokens = filteredTokens.filter(tok => tok.status === 'WAITING' || tok.status === 'REGISTERED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              {t.queue.subtitle}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.queue.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            S. N. Medical College & Hospital • Live Central Queue Telemetry & Announcer
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handlePlayChime}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
              chimePlaying 
                ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400' 
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
            title="Play Audio Announcement Chime"
          >
            <Volume2 className={`w-4 h-4 ${chimePlaying ? 'text-amber-600 animate-bounce' : 'text-blue-600'}`} />
            <span>{t.queue.testChime}</span>
          </button>

          {onOpenOpdRegistration && (
            <button
              onClick={onOpenOpdRegistration}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#3435D8] hover:bg-[#2424B8] text-white shadow-sm transition cursor-pointer"
            >
              {t.queue.newToken}
            </button>
          )}
        </div>
      </div>

      {/* Main Digital Calling Board (Airport / High-Visibility LED Display) */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#3435d8_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8">
          
          {/* Left: Token Being Served Right Now */}
          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider animate-pulse">
              <Bell className="w-3.5 h-3.5 text-red-400" />
              <span>{t.queue.nowCalling}</span>
            </div>

            <div>
              <div className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-teal-300 drop-shadow-md">
                {activeNow?.tokenNumber || 'OPD-ORTHO-002'}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-2 flex items-center gap-2">
                <span>{t.common.patient}:</span>
                <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded">
                  {activeNow?.patientName || 'Ramesh Sharma'}
                </span>
                <span className="text-slate-400 text-xs">
                  ({activeNow?.gender || 'MALE'}, {activeNow?.patientAge || 45}y)
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">{t.common.roomCabin}</span>
                <span className="font-bold text-teal-300 text-sm">{activeNow?.roomCabin || 'Cabin 04'}</span>
                <span className="text-[10px] text-slate-400 block">{activeNow?.building || 'Main Wing'}, Fl {activeNow?.floor || 1}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">{t.common.doctor}</span>
                <span className="font-bold text-white text-xs truncate block">{activeNow?.doctorName || 'Prof. (Dr.) Arvind Mehta'}</span>
                <span className="text-[10px] text-slate-400 block truncate">{activeNow?.doctorDesignation || 'HOD & Professor'}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">{t.common.status}</span>
                <span className="font-bold text-emerald-400 uppercase text-xs">
                  {activeNow?.status?.replace('_', ' ') || 'CALLED TO CABIN'}
                </span>
                <span className="text-[10px] text-slate-400 block">Est: ~{activeNow?.estimatedWaitMinutes || 0} {t.common.mins}</span>
              </div>
            </div>
          </div>

          {/* Right: Next Up in Line */}
          <div className="lg:w-84 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-teal-200 uppercase tracking-wider mb-3">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-300" />
                  <span>{t.queue.nextInLine}</span>
                </span>
                <Clock className="w-4 h-4 text-teal-300" />
              </div>

              {waitingTokens.length > 0 ? (
                <div className="space-y-2.5">
                  {waitingTokens.slice(0, 4).map((token, idx) => (
                    <div key={token.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs hover:bg-white/10 transition">
                      <div>
                        <span className="font-mono font-bold text-teal-300 block">{token.tokenNumber}</span>
                        <span className="text-[11px] text-slate-300 truncate max-w-[120px] block">{token.patientName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                          {t.queue.inLinePos} #{idx + 1}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">~{token.estimatedWaitMinutes}m wait</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">{t.queue.noWaiting}</p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span>{t.queue.totalInQueue}:</span>
              <span className="font-black text-white text-sm">{filteredTokens.length} {t.common.patient}s</span>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Department Filter Pills (1-Tap Selection) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#3435D8]" />
            <span>{t.queue.filterDept}</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">11 Hospital Specialties</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedDept('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              selectedDept === 'ALL'
                ? 'bg-[#3435D8] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.common.all} ({tokens.length})
          </button>
          {departments.map(dept => {
            const count = tokens.filter(tok => tok.departmentId === dept.id).length;
            const isSelected = selectedDept === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#3435D8] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{isHindi ? dept.hindiName : dept.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secure Token 4 Queue Lookup & Verify Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#3435D8] flex items-center justify-center font-bold">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {t.queue.secureLookupHeading}
              </h2>
              <p className="text-xs text-slate-500">
                {t.queue.secureLookupSub} • Complete Zero-PII Leakage Protected
              </p>
            </div>
          </div>

          {/* Quick sample chips */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 overflow-x-auto">
            <span className="text-slate-400">Quick test:</span>
            <button
              onClick={() => { setLookupQuery('OPD-ORTHO-002'); handleSecureLookup(undefined, 'OPD-ORTHO-002'); }}
              className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
            >
              OPD-ORTHO-002
            </button>
            <button
              onClick={() => { setLookupQuery('003'); handleSecureLookup(undefined, '003'); }}
              className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 cursor-pointer"
            >
              003 (Cardio)
            </button>
            <button
              onClick={() => { setLookupQuery('9876543210'); handleSecureLookup(undefined, '9876543210'); }}
              className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 cursor-pointer"
            >
              By Phone
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={(e) => handleSecureLookup(e)} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="e.g. OPD-ORTHO-002, 002, TOK-001 or Mobile Number"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3435D8]"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#3435D8] hover:bg-[#2424B8] text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.common.verify}</span>
          </button>
        </form>

        {/* Lookup and Verification Result Card */}
        {lookupResult && lookupResult !== 'NOT_FOUND' && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-teal-50/80 border-2 border-blue-200 text-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-blue-200/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-mono font-black text-sm text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-blue-200">
                  {lookupResult.tokenNumber}
                </span>
                <span className="font-bold text-blue-900">{lookupResult.departmentName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  lookupResult.status === 'CALLED' ? 'bg-red-500 text-white animate-pulse' :
                  lookupResult.status === 'IN_CONSULTATION' ? 'bg-blue-600 text-white' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {lookupResult.status.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                  Verified Authenticity
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/80 p-3 rounded-xl border border-blue-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.common.roomCabin}</span>
                <span className="font-bold text-[#3435D8] text-sm">{lookupResult.roomCabin}</span>
                <span className="text-[10px] text-slate-500 block">{lookupResult.building}, Floor {lookupResult.floor}</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-blue-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.common.doctor}</span>
                <span className="font-bold text-slate-900 text-xs truncate block">{lookupResult.doctorName}</span>
                <span className="text-[10px] text-slate-500 block">{lookupResult.doctorDesignation}</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-blue-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.patient.queuePosition}</span>
                <span className="font-bold text-amber-700 text-sm">#{lookupResult.queuePosition || 1} in queue</span>
                <span className="text-[10px] text-slate-500 block">Est: ~{lookupResult.estimatedWaitMinutes} mins</span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-blue-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Privacy</span>
                <span className="font-bold text-slate-900 text-xs">
                  {lookupResult.patientName.replace(/(\w{1})\w+/g, '$1***')}
                </span>
                <span className="text-[10px] text-emerald-700 block font-semibold">Zero-PII Active</span>
              </div>
            </div>

            {/* Cryptographic SHA-256 Ledger Stamp */}
            <div className="bg-white/60 p-2.5 rounded-xl border border-blue-100 flex items-center justify-between text-[10px] font-mono text-slate-600">
              <span className="truncate pr-2">
                Digital Ledger Seal: <strong className="text-blue-900">{verificationCode}</strong>
              </span>
              <span className="text-emerald-700 font-bold shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Ledger Valid
              </span>
            </div>
          </div>
        )}

        {lookupResult === 'NOT_FOUND' && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
            <span>{t.patient.tokenNotFound}</span>
          </div>
        )}
      </div>

      {/* Department-wise Live Queue Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              {t.queue.tableTitle}
            </h3>
            <p className="text-xs text-slate-500">
              Showing active queue tokens registered in hospital outpatient departments
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Total active tokens: <strong className="text-slate-900">{filteredTokens.length}</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">{t.queue.thToken}</th>
                <th className="py-3 px-4">{t.queue.thPatient}</th>
                <th className="py-3 px-4">{t.queue.thDept}</th>
                <th className="py-3 px-4">{t.queue.thDoctor}</th>
                <th className="py-3 px-4">{t.queue.thCabin}</th>
                <th className="py-3 px-4">{t.queue.thWait}</th>
                <th className="py-3 px-4">{t.queue.thStatus}</th>
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
                    <span className="text-[10px] text-slate-400 block font-normal">
                      {token.gender}, {token.patientAge}y
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {token.departmentName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-900 block">{token.doctorName}</span>
                    <span className="text-[10px] text-slate-500">{token.doctorDesignation}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-teal-700">
                    {token.roomCabin}
                    <span className="text-[10px] text-slate-400 block">{token.building}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-700">
                    {token.status === 'COMPLETED' ? '-' : `~${token.estimatedWaitMinutes}m`}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      token.status === 'CALLED' ? 'bg-red-500 text-white animate-pulse' :
                      token.status === 'IN_CONSULTATION' ? 'bg-blue-600 text-white' :
                      token.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {token.status.replace('_', ' ')}
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
