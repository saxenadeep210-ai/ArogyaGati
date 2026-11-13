import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Ticket, 
  Clock, 
  BedDouble, 
  Stethoscope, 
  PhoneCall, 
  Compass, 
  HelpCircle, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { hospitalStore } from '../../services/hospitalStore';
import { HOSPITAL_INFO, DEPARTMENTS } from '../../services/mockData';
import { QueueToken, HospitalBed, Doctor } from '../../types';

interface HospitalCommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenOpdRegistration?: () => void;
}

interface CommandResult {
  title: string;
  subtitle: string;
  category: 'TOKEN' | 'BEDS' | 'DOCTOR' | 'EMERGENCY' | 'NAVIGATION' | 'AI_HELP';
  badge?: string;
  badgeColor?: string;
  actionText?: string;
  onAction?: () => void;
}

export const HospitalCommandBar: React.FC<HospitalCommandBarProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenOpdRegistration,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CommandResult[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isEmergencyDetected, setIsEmergencyDetected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      executeSearch('');
    } else {
      setQuery('');
      setSpeechFeedback(null);
      setIsEmergencyDetected(false);
      stopListening();
    }
  }, [isOpen]);

  // Global Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Voice Recognition via Web Speech API
  const startListening = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported on this browser. Please type your query in the search bar.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Accepts Hindi and English Hinglish input
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechFeedback('Listening... Speak your query in English or हिंदी');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setSpeechFeedback(`Recognized: "${transcript}"`);
        setIsListening(false);
        executeSearch(transcript);
        if (ttsEnabled) {
          speakResponse(`Searching for ${transcript}`);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error', event.error);
        setIsListening(false);
        setSpeechFeedback(`Voice input paused (${event.error})`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Could not start speech recognition', e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  // Text-to-Speech via Web Speech API
  const speakResponse = (text: string) => {
    if (!('speechSynthesis' in window) || !ttsEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Deterministic routing & smart queries
  const executeSearch = (rawQuery: string) => {
    const q = rawQuery.trim().toLowerCase();
    const tokens = hospitalStore.getTokens();
    const beds = hospitalStore.getBeds();
    const doctors = hospitalStore.getDoctors();
    const user = hospitalStore.getUser();

    // 1. Clinical Emergency Guardrail
    const emergencyKeywords = [
      'emergency', 'heart attack', 'chest pain', 'severe bleeding', 'unconscious', 
      'accident', 'trauma', '108', 'casualty', 'stroke', 'seizure', 'saans', 'chhati', 
      'dard', 'beheosh', 'ambulance', 'urgent'
    ];
    const isEmerg = emergencyKeywords.some(kw => q.includes(kw));
    setIsEmergencyDetected(isEmerg);

    const res: CommandResult[] = [];

    // If emergency, put priority alert first
    if (isEmerg) {
      res.push({
        title: 'PRIORITY EMERGENCY DISPATCH: Call 108 Immediately',
        subtitle: 'Immediate medical emergency suspected. Casualty trauma team on standby.',
        category: 'EMERGENCY',
        badge: 'CRITICAL',
        badgeColor: 'bg-red-600 text-white animate-pulse',
        actionText: 'Open 108 Emergency Portal',
        onAction: () => {
          onClose();
          onNavigateToTab?.('ambulance-dashboard');
        }
      });
    }

    // 2. Token & Queue queries
    if (!q || q.includes('token') || q.includes('queue') || q.includes('number') || q.includes('my')) {
      // Find patient's token
      const myToken = tokens.find(
        t => (user && (t.patientName === user.name || t.mobile === user.mobile)) || t.id === 'TOK-002'
      );

      if (myToken) {
        res.push({
          title: `My Active Token: ${myToken.tokenNumber} (${myToken.departmentName})`,
          subtitle: `Dr: ${myToken.doctorName} • Room: ${myToken.roomCabin} • Wait: ~${myToken.estimatedWaitMinutes} mins • Status: ${myToken.status}`,
          category: 'TOKEN',
          badge: myToken.status,
          badgeColor: myToken.status === 'CALLED' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white',
          actionText: 'Locate on Wayfinder',
          onAction: () => {
            onClose();
            onNavigateToTab?.('wayfinder');
          }
        });
      }

      // Add general queue tracker result
      res.push({
        title: 'Live OPD Queue Board',
        subtitle: `Currently serving tokens across 11 departments. Total in queue: ${tokens.filter(t => t.status === 'WAITING').length} patients`,
        category: 'TOKEN',
        badge: 'LIVE',
        badgeColor: 'bg-emerald-600 text-white',
        actionText: 'View Queue',
        onAction: () => {
          onClose();
          onNavigateToTab?.('live-token');
        }
      });
    }

    // 3. Bed Availability queries
    if (!q || q.includes('bed') || q.includes('icu') || q.includes('ward') || q.includes('admit') || q.includes('available')) {
      const availICU = beds.filter(b => b.bedCategory === 'ICU' && b.status === 'AVAILABLE').length;
      const totalICU = beds.filter(b => b.bedCategory === 'ICU').length;
      const availGeneral = beds.filter(b => b.bedCategory === 'GENERAL_WARD' && b.status === 'AVAILABLE').length;
      const totalGeneral = beds.filter(b => b.bedCategory === 'GENERAL_WARD').length;
      const availEmg = beds.filter(b => b.bedCategory === 'EMERGENCY' && b.status === 'AVAILABLE').length;

      res.push({
        title: `Hospital Beds: ${availICU}/${totalICU} ICU Beds Free • ${availEmg} Emergency Free`,
        subtitle: `General Wards: ${availGeneral}/${totalGeneral} beds available. Real-time Bed Matrix updated.`,
        category: 'BEDS',
        badge: `${beds.filter(b => b.status === 'AVAILABLE').length} Total Free`,
        badgeColor: 'bg-emerald-600 text-white',
        actionText: 'Inspect Beds',
        onAction: () => {
          onClose();
          onNavigateToTab?.('beds');
        }
      });
    }

    // 4. Doctor search
    if (q) {
      const matchingDocs = doctors.filter(
        d => d.name.toLowerCase().includes(q) ||
             d.departmentName.toLowerCase().includes(q) ||
             d.specialty.toLowerCase().includes(q)
      );

      matchingDocs.slice(0, 3).forEach(doc => {
        res.push({
          title: `${doc.name} (${doc.designation})`,
          subtitle: `${doc.departmentName} • Room/Cabin: ${doc.roomCabin} • Duty Set: ${doc.doctorSet}`,
          category: 'DOCTOR',
          badge: doc.subRole,
          badgeColor: 'bg-indigo-600 text-white',
          actionText: 'Book OPD',
          onAction: () => {
            onClose();
            onOpenOpdRegistration?.();
          }
        });
      });
    }

    // 5. Indoor Navigation / Wayfinder
    if (!q || q.includes('room') || q.includes('cabin') || q.includes('where') || q.includes('way') || q.includes('map') || q.includes('lab') || q.includes('pharmacy')) {
      res.push({
        title: 'Hospital Indoor Wayfinder & Route Guide',
        subtitle: 'Get turn-by-turn directions to OPD cabins, Jan Aushadhi Pharmacy, Blood Bank, and X-Ray Labs.',
        category: 'NAVIGATION',
        badge: 'MAP',
        badgeColor: 'bg-amber-600 text-white',
        actionText: 'Open Map',
        onAction: () => {
          onClose();
          onNavigateToTab?.('wayfinder');
        }
      });
    }

    // 6. Help & General queries
    if (q) {
      res.push({
        title: `AI Assistant: "${rawQuery}"`,
        subtitle: `Deterministic Hospital Routing: OPD Timings 08:00 AM - 02:00 PM. Jan Aushadhi 24/7. Central Casualty ground floor.`,
        category: 'AI_HELP',
        badge: 'GEMINI AI',
        badgeColor: 'bg-purple-600 text-white',
        actionText: 'Learn More',
        onAction: () => {
          if (ttsEnabled) {
            speakResponse('ArogyaGati Hospital Services are operating normally. OPD consultations run Monday to Saturday from 8 AM to 2 PM.');
          }
        }
      });
    }

    setResults(res);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    executeSearch(val);
  };

  const handleChipClick = (chipText: string) => {
    setQuery(chipText);
    executeSearch(chipText);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-12 sm:pt-20 px-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/50">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <Search className="w-5 h-5" />
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search token, bed availability, doctor, room cabin, or type symptom..."
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-base sm:text-lg font-semibold outline-hidden pr-20"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); executeSearch(''); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Voice Input (Speech-to-Text) Button */}
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition shrink-0 ${
              isListening
                ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-500/30'
                : 'bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700'
            }`}
            title={isListening ? 'Stop Listening' : 'Voice Search (Hindi / English)'}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* TTS Audio Speech Toggle Button */}
          <button
            type="button"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition shrink-0 ${
              ttsEnabled ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-400'
            }`}
            title={ttsEnabled ? 'Speech Output Active' : 'Speech Output Muted'}
          >
            {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Close Modal Button */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Feedback Ribbon if listening */}
        {speechFeedback && (
          <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 text-xs text-blue-800 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              {speechFeedback}
            </span>
            <span className="text-[10px] text-blue-600 uppercase font-bold tracking-wider">Voice Assisted</span>
          </div>
        )}

        {/* Emergency Alert Banner if clinical keywords detected */}
        {isEmergencyDetected && (
          <div className="bg-red-600 text-white p-3.5 flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2 text-xs font-bold">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Life-Saving Protocol: For chest pain, collapse, or severe trauma, call Ambulance 108 immediately.</span>
            </div>
            <a
              href="tel:108"
              className="px-3 py-1 rounded-xl bg-white text-red-700 font-extrabold text-xs shrink-0 shadow-sm"
            >
              Dial 108
            </a>
          </div>
        )}

        {/* Quick Action Chips */}
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Quick Chips:</span>
          
          <button
            onClick={() => handleChipClick('My Token')}
            className="px-3 py-1 rounded-xl bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-slate-700 font-semibold transition shrink-0 flex items-center gap-1"
          >
            <Ticket className="w-3.5 h-3.5 text-blue-600" />
            <span>My Token</span>
          </button>

          <button
            onClick={() => handleChipClick('Live Queue')}
            className="px-3 py-1 rounded-xl bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-slate-700 font-semibold transition shrink-0 flex items-center gap-1"
          >
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Track Queue</span>
          </button>

          <button
            onClick={() => handleChipClick('Available Beds')}
            className="px-3 py-1 rounded-xl bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-slate-700 font-semibold transition shrink-0 flex items-center gap-1"
          >
            <BedDouble className="w-3.5 h-3.5 text-emerald-600" />
            <span>Available Beds</span>
          </button>

          <button
            onClick={() => handleChipClick('Find Doctor')}
            className="px-3 py-1 rounded-xl bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-700 font-semibold transition shrink-0 flex items-center gap-1"
          >
            <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
            <span>Find Doctor</span>
          </button>

          <button
            onClick={() => handleChipClick('Emergency 108')}
            className="px-3 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold transition shrink-0 flex items-center gap-1"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-600" />
            <span>Emergency 108</span>
          </button>

          <button
            onClick={() => handleChipClick('Wayfinder')}
            className="px-3 py-1 rounded-xl bg-white hover:bg-amber-50 hover:text-amber-700 border border-slate-200 text-slate-700 font-semibold transition shrink-0 flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>Wayfinder</span>
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {results.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold">No direct results found</p>
              <p className="text-xs mt-1">Try asking about token numbers, doctors, bed availability, or OPD timings.</p>
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-slate-100 hover:border-blue-300 bg-white hover:bg-blue-50/40 transition flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.category === 'EMERGENCY' ? 'bg-red-100 text-red-700' :
                    item.category === 'TOKEN' ? 'bg-blue-100 text-blue-700' :
                    item.category === 'BEDS' ? 'bg-emerald-100 text-emerald-700' :
                    item.category === 'DOCTOR' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {item.category === 'EMERGENCY' && <PhoneCall className="w-4 h-4" />}
                    {item.category === 'TOKEN' && <Ticket className="w-4 h-4" />}
                    {item.category === 'BEDS' && <BedDouble className="w-4 h-4" />}
                    {item.category === 'DOCTOR' && <Stethoscope className="w-4 h-4" />}
                    {item.category === 'NAVIGATION' && <Compass className="w-4 h-4" />}
                    {item.category === 'AI_HELP' && <Sparkles className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                        {item.title}
                      </h4>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {item.onAction && (
                  <button
                    onClick={item.onAction}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-blue-600 text-slate-700 group-hover:text-white font-bold text-xs transition shrink-0 flex items-center gap-1 mt-1 cursor-pointer"
                  >
                    <span>{item.actionText || 'Open'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] text-slate-700 shadow-2xs">ESC</kbd> to exit</span>
            <span className="hidden sm:inline">Use <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] text-slate-700 shadow-2xs">Ctrl + K</kbd> anywhere</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Ayushman Bharat Digital Health Integration</span>
          </div>
        </div>
      </div>
    </div>
  );
};
