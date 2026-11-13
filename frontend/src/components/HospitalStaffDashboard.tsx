import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  BedDouble, 
  Ticket, 
  Truck, 
  Stethoscope, 
  ShieldCheck, 
  Activity, 
  Users, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { hospitalStore } from '../services/hospitalStore';
import { BedStatus } from '../types';

export const HospitalStaffDashboard: React.FC = () => {
  const [beds, setBeds] = useState(hospitalStore.getBeds());
  const [tokens, setTokens] = useState(hospitalStore.getTokens());
  const [emergencyCases, setEmergencyCases] = useState(hospitalStore.getEmergencyCases());
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BEDS' | 'QUEUES' | 'DOCTOR_SETS' | 'ABDM_GATEWAY'>('OVERVIEW');

  useEffect(() => {
    return hospitalStore.subscribe(() => {
      setBeds(hospitalStore.getBeds());
      setTokens(hospitalStore.getTokens());
      setEmergencyCases(hospitalStore.getEmergencyCases());
    });
  }, []);

  const totalBeds = beds.length;
  const availableBeds = beds.filter(b => b.status === 'AVAILABLE').length;
  const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED').length;
  const totalTokens = tokens.length;
  const waitingTokens = tokens.filter(t => t.status === 'WAITING' || t.status === 'REGISTERED').length;
  const completedTokens = tokens.filter(t => t.status === 'COMPLETED').length;

  const handleBedStatusChange = (bedId: string, status: BedStatus) => {
    hospitalStore.updateBedStatus(bedId, status);
  };

  const handleExportFhirBundle = () => {
    const fhirBundle = {
      resourceType: "Bundle",
      type: "transaction",
      timestamp: new Date().toISOString(),
      entry: tokens.map(t => ({
        fullUrl: `urn:uuid:${t.id}`,
        resource: {
          resourceType: "Encounter",
          id: t.id,
          status: t.status.toLowerCase(),
          subject: {
            display: t.patientName,
            reference: `Patient/${t.patientId}`
          },
          participant: [{
            individual: {
              display: t.doctorName,
              identifier: { value: t.doctorId }
            }
          }],
          period: {
            start: t.registrationTime
          },
          reasonCode: [{
            text: t.causeOfVisit
          }]
        }
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fhirBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `arogyagati_fhir_bundle_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">
              Hospital Operations & Administrative Gateway
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Administration & Resource Control Center
          </h1>
          <p className="text-xs text-purple-200 mt-1 max-w-xl">
            S. N. Medical College, Agra • Real-time patient throughput, cross-department queue balancing, bed occupancy control, and ABDM compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportFhirBundle}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-2"
            title="Download FHIR R4 Encounter Bundle"
          >
            <Download className="w-4 h-4 text-purple-300" />
            <span>Export FHIR R4 Bundle</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'OVERVIEW' ? 'bg-purple-700 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Hospital Operations Overview
        </button>
        <button
          onClick={() => setActiveTab('BEDS')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'BEDS' ? 'bg-purple-700 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Bed Inventory Control ({availableBeds} free)
        </button>
        <button
          onClick={() => setActiveTab('QUEUES')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'QUEUES' ? 'bg-purple-700 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Cross-Department Queues ({waitingTokens} waiting)
        </button>
        <button
          onClick={() => setActiveTab('DOCTOR_SETS')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'DOCTOR_SETS' ? 'bg-purple-700 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Doctor Sets Rotation (A/B/C)
        </button>
        <button
          onClick={() => setActiveTab('ABDM_GATEWAY')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'ABDM_GATEWAY' ? 'bg-purple-700 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          ABDM Health Gateway Settings
        </button>
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium block mb-1">Today's OPD Throughput</span>
              <div className="text-3xl font-black text-slate-900">{totalTokens}</div>
              <span className="text-[11px] text-emerald-600 font-semibold">{completedTokens} Consultations Concluded</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium block mb-1">Total Waiting Queue</span>
              <div className="text-3xl font-black text-amber-600">{waitingTokens}</div>
              <span className="text-[11px] text-slate-500">Avg Wait Time: ~14 mins</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium block mb-1">Bed Occupancy Rate</span>
              <div className="text-3xl font-black text-purple-700">{((occupiedBeds / totalBeds) * 100).toFixed(0)}%</div>
              <span className="text-[11px] text-slate-500">{availableBeds} of {totalBeds} beds available</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium block mb-1">Active 108 Ambulances</span>
              <div className="text-3xl font-black text-red-600">{emergencyCases.length}</div>
              <span className="text-[11px] text-red-600 font-bold">1 Inbound Trauma Alert</span>
            </div>
          </div>

          {/* Department Load Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Departmental Patient Load & Average Wait Distribution
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {hospitalStore.getDepartments().slice(0, 6).map(d => {
                const deptWaiting = tokens.filter(t => t.departmentId === d.id && (t.status === 'WAITING' || t.status === 'CALLED')).length;
                return (
                  <div key={d.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{d.name}</span>
                      <span className="text-purple-700 font-mono">Floor {d.floor}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span>Waiting Patients:</span>
                      <span className="font-bold text-slate-900 text-sm">{deptWaiting}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-600 h-full rounded-full" 
                        style={{ width: `${Math.min(100, deptWaiting * 15)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: BED INVENTORY CONTROL */}
      {activeTab === 'BEDS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Authorized Bed Status & Allocation Management
              </h3>
              <p className="text-xs text-slate-500">
                Staff can toggle bed occupancy, assign admitted patients, or schedule sanitization/maintenance.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Bed Number</th>
                  <th className="py-3 px-4">Building & Floor</th>
                  <th className="py-3 px-4">Ward Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Assigned Patient</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Quick Modify Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {beds.map(bed => (
                  <tr key={bed.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {bed.bedNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {bed.building} (Fl.{bed.floor})
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {bed.wardName}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {bed.bedCategory}
                    </td>
                    <td className="py-3 px-4 text-slate-800">
                      {bed.patientName || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        bed.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                        bed.status === 'OCCUPIED' ? 'bg-rose-100 text-rose-800' :
                        bed.status === 'RESERVED' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {bed.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={bed.status}
                        onChange={e => handleBedStatusChange(bed.id, e.target.value as BedStatus)}
                        className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white font-semibold text-slate-800"
                      >
                        <option value="AVAILABLE">Mark Available</option>
                        <option value="OCCUPIED">Mark Occupied</option>
                        <option value="RESERVED">Mark Reserved</option>
                        <option value="CLEANING">Mark Cleaning</option>
                        <option value="MAINTENANCE">Mark Maintenance</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: CROSS-DEPARTMENT QUEUES */}
      {activeTab === 'QUEUES' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900">
            Real-Time Token & Emergency Queue Monitor
          </h3>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Token No</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Doctor & Room</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tokens.map(token => (
                  <tr key={token.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{token.tokenNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{token.patientName}</td>
                    <td className="py-3 px-4 text-slate-600">{token.departmentName}</td>
                    <td className="py-3 px-4 text-slate-800">{token.doctorName} ({token.roomCabin})</td>
                    <td className="py-3 px-4">
                      {token.priority === 'EMERGENCY' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800">EMERGENCY</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">NORMAL</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">{token.status}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {token.status !== 'COMPLETED' && (
                        <button
                          onClick={() => hospitalStore.updateTokenStatus(token.id, 'COMPLETED')}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                        >
                          Force Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: DOCTOR SETS ROTATION */}
      {activeTab === 'DOCTOR_SETS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Doctor Schedule Sets & Weekly Rotation Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Department faculty rotation ensures comprehensive patient coverage across Mon-Sat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Set A */}
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between font-bold text-blue-900">
                <span className="text-base">Doctor Set A</span>
                <span className="px-2 py-0.5 rounded bg-blue-200 text-blue-800 font-mono text-[10px]">Active Today</span>
              </div>
              <p className="font-semibold text-slate-700">Working Days: Monday & Thursday</p>
              <div className="text-slate-600 space-y-1">
                <p>• Prof. (Dr.) Arvind Mehta (HOD Ortho)</p>
                <p>• Dr. Priya Sharma (Associate Prof)</p>
                <p>• Dr. Anand Gupta (Assistant Prof)</p>
                <p>• Dr. Rahul Srivastava (Junior Resident 3)</p>
                <p>• Dr. Divya Singh (Junior Resident 2)</p>
              </div>
            </div>

            {/* Set B */}
            <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 space-y-3">
              <div className="flex items-center justify-between font-bold text-teal-900">
                <span className="text-base">Doctor Set B</span>
                <span className="px-2 py-0.5 rounded bg-teal-200 text-teal-800 font-mono text-[10px]">Rotational</span>
              </div>
              <p className="font-semibold text-slate-700">Working Days: Tuesday & Friday</p>
              <div className="text-slate-600 space-y-1">
                <p>• Dr. Rajesh Verma (Associate Prof)</p>
                <p>• Dr. Rahul Srivastava (Senior Resident)</p>
                <p>• Ward Clinical Staff Assigned</p>
              </div>
            </div>

            {/* Set C */}
            <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
              <div className="flex items-center justify-between font-bold text-purple-900">
                <span className="text-base">Doctor Set C</span>
                <span className="px-2 py-0.5 rounded bg-purple-200 text-purple-800 font-mono text-[10px]">Rotational</span>
              </div>
              <p className="font-semibold text-slate-700">Working Days: Wednesday & Saturday</p>
              <div className="text-slate-600 space-y-1">
                <p>• Dr. Meenakshi Rai (Assistant Prof)</p>
                <p>• Dr. Divya Singh (Junior Resident)</p>
                <p>• Director Special Consultation Clinic</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: ABDM GATEWAY SETTINGS */}
      {activeTab === 'ABDM_GATEWAY' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <span>Ayushman Bharat Digital Mission (ABDM) Gateway Integration</span>
            </h3>
            <p className="text-slate-500 mt-0.5">
              Configured Mock ABDM M1 (ABHA creation), M2 (Health record discovery), and M3 (FHIR R4 record exchange).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block">Health Facility Registry (HFR) Metadata:</span>
              <p>Facility ID: <strong>IN0910002144</strong></p>
              <p>Facility Name: <strong>Sarojini Naidu Medical College & Hospital</strong></p>
              <p>HIP/HIU Status: <strong className="text-emerald-700">Registered & Connected (Mock)</strong></p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block">ABHA Consent Manager:</span>
              <p>Consent Flow: <strong>Automated Push to Registered ABHA Mobile</strong></p>
              <p>Data Format: <strong>FHIR R4 DiagnosticReport / Condition / Encounter</strong></p>
              <p>Encryption: <strong>Diffie-Hellman Key Exchange (RFC 2631)</strong></p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExportFhirBundle}
              className="px-5 py-2.5 rounded-xl font-bold bg-teal-600 hover:bg-teal-700 text-white transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Live FHIR R4 Patient Bundle</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
