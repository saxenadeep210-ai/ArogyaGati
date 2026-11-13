import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  PhoneCall, 
  AlertTriangle, 
  HeartPulse, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Activity,
  BedDouble,
  UserPlus
} from 'lucide-react';
import { hospitalStore } from '../services/hospitalStore';
import { EmergencyCase, AuthUser } from '../types';

export const AmbulanceDashboard: React.FC = () => {
  const currentUser = hospitalStore.getUser();
  const [emergencyCases, setEmergencyCases] = useState<EmergencyCase[]>(hospitalStore.getEmergencyCases());
  const [beds, setBeds] = useState(hospitalStore.getBeds());

  // Form states
  const [ambulanceId, setAmbulanceId] = useState(currentUser?.ambulanceId || 'AMB-UP80-108');
  const [ambulanceRegNo, setAmbulanceRegNo] = useState('UP-80-EZ-4192');
  const [attendantId, setAttendantId] = useState('ATT-4091');
  const [attendantName, setAttendantName] = useState('Rajveer Tyagi (EMT-Paramedic)');
  
  const [patientName, setPatientName] = useState('Anil Kumar (Motorbike Rider)');
  const [patientAge, setPatientAge] = useState(29);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [abhaId, setAbhaId] = useState('14-9988-1234-5566');
  
  const [category, setCategory] = useState<EmergencyCase['category']>('TRAUMA');
  const [severity, setSeverity] = useState<EmergencyCase['severity']>('CRITICAL');
  const [description, setDescription] = useState('Compound fracture right femur, active bleeding controlled with tourniquet pressure dressing. Patient pale, BP 100/68, HR 114.');
  const [incidentLocation, setIncidentLocation] = useState('NH-19 Runakta Flyover, Agra');
  const [etaMinutes, setEtaMinutes] = useState(8);

  // Vitals
  const [bp, setBp] = useState('100/68');
  const [pulse, setPulse] = useState(114);
  const [spO2, setSpO2] = useState(96);
  const [consciousness, setConsciousness] = useState('Conscious, GCS 14/15');

  const [registeredCase, setRegisteredCase] = useState<EmergencyCase | null>(null);

  useEffect(() => {
    return hospitalStore.subscribe(() => {
      setEmergencyCases(hospitalStore.getEmergencyCases());
      setBeds(hospitalStore.getBeds());
    });
  }, []);

  const handleRegisterEmergency = (e: React.FormEvent) => {
    e.preventDefault();

    const newCase = hospitalStore.registerEmergencyCase({
      ambulanceId,
      ambulanceRegNo,
      attendantId,
      attendantName,
      patientName,
      patientAge: Number(patientAge),
      gender,
      abhaId: abhaId.trim() || undefined,
      category,
      severity,
      description,
      incidentLocation,
      etaMinutes: Number(etaMinutes),
      vitals: {
        bloodPressure: bp,
        pulseRate: Number(pulse),
        spO2: Number(spO2),
        consciousness
      }
    });

    setRegisteredCase(newCase);
  };

  const handleUpdateStatus = (caseId: string, status: EmergencyCase['status']) => {
    hospitalStore.updateEmergencyStatus(caseId, status);
  };

  const traumaBedsAvailable = beds.filter(b => b.bedCategory === 'EMERGENCY' && b.status === 'AVAILABLE').length;
  const icuBedsAvailable = beds.filter(b => b.bedCategory === 'ICU' && b.status === 'AVAILABLE').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-600/30 border border-red-500/40 flex items-center justify-center text-white shadow-inner">
            <Truck className="w-8 h-8 animate-pulse text-red-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-red-300 bg-red-950/60 px-2.5 py-0.5 rounded border border-red-800">
                108 EMERGENCY DISPATCH
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                GPS Radar Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              Ambulance & Priority Trauma Portal
            </h1>
            <p className="text-xs text-rose-200 font-medium">
              S. N. Medical College Emergency Casualty • High-Priority Triage Coordination
            </p>
          </div>
        </div>

        {/* Live Hospital Readiness Counter */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center gap-6 text-xs">
          <div>
            <span className="text-rose-200 block text-[11px]">Trauma Bay Beds Free:</span>
            <span className="font-bold text-emerald-300 text-lg">{traumaBedsAvailable} Available</span>
          </div>
          <div className="border-l border-white/15 pl-6">
            <span className="text-rose-200 block text-[11px]">ICU Beds Free:</span>
            <span className="font-bold text-white text-lg">{icuBedsAvailable} Available</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Register New Emergency Case Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Register Inbound Emergency Case
              </h2>
            </div>
            <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full uppercase">
              Immediate Triage Priority
            </span>
          </div>

          {registeredCase && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Emergency Case Dispatched to Hospital!
                </span>
                <span className="font-mono bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded">
                  {registeredCase.emergencyToken}
                </span>
              </div>
              <p>
                Assigned Team: <strong>{registeredCase.assignedDoctorName}</strong> at Emergency Trauma Centre.
                {registeredCase.reservedBedId && ` Temporary trauma bay reserved.`}
              </p>
            </div>
          )}

          <form onSubmit={handleRegisterEmergency} className="space-y-4 text-xs">
            
            {/* Row 1: Ambulance ID & Attendant */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ambulance ID / Vehicle Reg. *
                </label>
                <input
                  type="text"
                  required
                  value={ambulanceId}
                  onChange={e => setAmbulanceId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Attendant / Paramedic Name & ID *
                </label>
                <input
                  type="text"
                  required
                  value={attendantName}
                  onChange={e => setAttendantName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Row 2: Patient Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Patient Name (or "Unknown Male/Female")
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Approx. Age & Gender
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={patientAge}
                    onChange={e => setPatientAge(Number(e.target.value))}
                    className="w-20 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as 'MALE' | 'FEMALE' | 'OTHER')}
                    className="flex-1 px-2 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ABHA ID (if card available)
                </label>
                <input
                  type="text"
                  value={abhaId}
                  onChange={e => setAbhaId(e.target.value)}
                  placeholder="14-digit ABHA"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Row 3: Emergency Category & Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Emergency Category *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as EmergencyCase['category'])}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold text-slate-800"
                >
                  <option value="TRAUMA">Accident & Trauma (सड़क दुर्घटना)</option>
                  <option value="CARDIAC">Cardiac Arrest / Heart Attack (हार्ट अटैक)</option>
                  <option value="STROKE">Brain Stroke / Paralysis (स्ट्रोक)</option>
                  <option value="RESPIRATORY">Severe Respiratory Distress (सांस की तकलीफ)</option>
                  <option value="MATERNAL">High-Risk Delivery / Maternal</option>
                  <option value="BURN">Major Burn Injury</option>
                  <option value="OTHER">Other Acute Emergency</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Clinical Severity Level *
                </label>
                <select
                  value={severity}
                  onChange={e => setSeverity(e.target.value as EmergencyCase['severity'])}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-black text-red-700"
                >
                  <option value="CRITICAL">RED: Critical (Life Threatening)</option>
                  <option value="SERIOUS">YELLOW: Serious (Urgent Care)</option>
                  <option value="STABLE">GREEN: Stable (Observation)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Estimated Arrival Time (ETA) *
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={etaMinutes}
                    onChange={e => setEtaMinutes(Number(e.target.value))}
                    className="w-24 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none font-bold"
                  />
                  <span className="text-slate-500 font-bold">Minutes</span>
                </div>
              </div>
            </div>

            {/* Row 4: Location & Clinical Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Accident / Incident Location *
                </label>
                <input
                  type="text"
                  required
                  value={incidentLocation}
                  onChange={e => setIncidentLocation(e.target.value)}
                  placeholder="e.g. NH-19 Runakta Flyover, Agra"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Hospital Destination
                </label>
                <input
                  type="text"
                  disabled
                  value="S. N. Medical College Emergency Trauma Center"
                  className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-100 rounded-xl font-medium text-slate-600"
                />
              </div>
            </div>

            {/* Row 5: Paramedic Vitals */}
            <div className="bg-red-50/60 border border-red-200 rounded-2xl p-3.5 space-y-2">
              <span className="font-bold text-red-950 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-red-600" />
                Live En-Route Vitals Transmitted by Paramedic:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-medium">Blood Pressure:</span>
                  <input
                    type="text"
                    value={bp}
                    onChange={e => setBp(e.target.value)}
                    placeholder="120/80"
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium">Pulse Rate (BPM):</span>
                  <input
                    type="number"
                    value={pulse}
                    onChange={e => setPulse(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium">SpO2 Oxygen (%):</span>
                  <input
                    type="number"
                    value={spO2}
                    onChange={e => setSpO2(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-medium">Consciousness (GCS):</span>
                  <input
                    type="text"
                    value={consciousness}
                    onChange={e => setConsciousness(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Brief Case Description & First Aid Administered *
              </label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Injuries observed, CPR administered, oxygen mask placed..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-black text-xs bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 transition flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Transmit Emergency Alert & Generate Priority Token</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Inbound Ambulances Radar & Live Emergency Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <h3 className="font-bold text-base text-slate-900">
                  Inbound Ambulances Radar
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                {emergencyCases.length} Cases
              </span>
            </div>

            <div className="space-y-3">
              {emergencyCases.map(c => (
                <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-red-700 text-sm">
                      {c.emergencyToken}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === 'EN_ROUTE' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                      c.status === 'ARRIVED' ? 'bg-blue-100 text-blue-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="font-bold text-slate-900 text-sm">
                    {c.patientName} ({c.patientAge}y, {c.gender})
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">{c.incidentLocation}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px]">ETA to Casualty:</span>
                      <span className="font-black text-red-600 text-sm">~{c.etaMinutes} mins</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Assigned Lead:</span>
                      <span className="font-bold text-slate-800 truncate block">{c.assignedDoctorName}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 italic">
                    "{c.description}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                    <span className="text-slate-500 font-mono">Amb: {c.ambulanceRegNo}</span>
                    <div className="flex gap-1.5">
                      {c.status === 'EN_ROUTE' && (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'ARRIVED')}
                          className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
                        >
                          Mark Arrived
                        </button>
                      )}
                      {c.status === 'ARRIVED' && (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'TRIAGED')}
                          className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                        >
                          Mark Triaged
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
