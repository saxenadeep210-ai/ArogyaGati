import React, { useState } from 'react';
import { 
  X, 
  User, 
  Truck, 
  Stethoscope, 
  SlidersHorizontal, 
  ShieldCheck, 
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { hospitalStore } from '../services/hospitalStore';
import { AuthUser, UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<UserRole>('PATIENT');
  
  // Patient fields
  const [patientMobile, setPatientMobile] = useState('9812345678');
  const [patientName, setPatientName] = useState('Ramesh Sharma');
  const [patientAbha, setPatientAbha] = useState('14-5544-7788-9922');

  // Ambulance fields
  const [ambulanceId, setAmbulanceId] = useState('AMB-UP80-108');
  const [attendantId, setAttendantId] = useState('ATT-4091');
  const [ambulanceMobile, setAmbulanceMobile] = useState('9911223344');

  // Doctor fields
  const [doctorId, setDoctorId] = useState('DOC-ORTHO-1001');
  const [doctorMobile, setDoctorMobile] = useState('9822334455');

  // Staff fields
  const [staffId, setStaffId] = useState('STAFF-ADMIN-01');
  const [staffMobile, setStaffMobile] = useState('9810010010');

  // OTP flow
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setOtpSent(true);
    setSuccessMsg('Government Health OTP generated! Use test OTP: 123456');
    setOtpCode('123456');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpCode !== '123456' && otpCode.length < 4) {
      setErrorMsg('Invalid OTP. Please enter the test verification code 123456.');
      return;
    }

    let authUser: AuthUser;

    if (activeTab === 'PATIENT') {
      authUser = {
        id: `PAT-${Date.now().toString().slice(-4)}`,
        name: patientName.trim() || 'Ramesh Sharma',
        role: 'PATIENT',
        mobile: patientMobile,
        abhaId: patientAbha.trim() || undefined
      };
    } else if (activeTab === 'AMBULANCE') {
      authUser = {
        id: ambulanceId,
        name: `Paramedic (${attendantId})`,
        role: 'AMBULANCE',
        subRole: 'ATTENDANT',
        mobile: ambulanceMobile,
        ambulanceId
      };
    } else if (activeTab === 'DOCTOR') {
      const doc = hospitalStore.getDoctors().find(d => d.doctorId === doctorId) || hospitalStore.getDoctors()[1];
      authUser = {
        id: doc.id,
        doctorId: doc.doctorId,
        name: doc.name,
        role: 'DOCTOR',
        subRole: doc.subRole,
        departmentId: doc.departmentId,
        departmentName: doc.departmentName,
        cabin: doc.roomCabin,
        mobile: doctorMobile
      };
    } else {
      authUser = {
        id: staffId,
        name: 'Administrative Officer',
        role: 'STAFF_ADMIN',
        subRole: 'DIRECTOR',
        staffId,
        mobile: staffMobile
      };
    }

    hospitalStore.setUser(authUser);
    onClose();
    onSuccess(activeTab);
  };

  const resetOtpFlow = (tab: UserRole) => {
    setActiveTab(tab);
    setOtpSent(false);
    setOtpCode('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 to-teal-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">ArogyaGati Secure Portal</h3>
              <p className="text-xs text-blue-100 font-medium">National Health Mission Single Sign-On</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Tabs */}
        <div className="grid grid-cols-4 bg-slate-100 border-b border-slate-200 p-1 gap-1 text-xs font-semibold">
          <button
            onClick={() => resetOtpFlow('PATIENT')}
            className={`py-2 px-1 rounded-lg transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === 'PATIENT' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Patient</span>
          </button>

          <button
            onClick={() => resetOtpFlow('AMBULANCE')}
            className={`py-2 px-1 rounded-lg transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === 'AMBULANCE' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Ambulance</span>
          </button>

          <button
            onClick={() => resetOtpFlow('DOCTOR')}
            className={`py-2 px-1 rounded-lg transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === 'DOCTOR' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor</span>
          </button>

          <button
            onClick={() => resetOtpFlow('STAFF_ADMIN')}
            className={`py-2 px-1 rounded-lg transition flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === 'STAFF_ADMIN' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Staff</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              
              {/* Option 1: Patient Login */}
              {activeTab === 'PATIENT' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Patient Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={e => setPatientName(e.target.value)}
                      placeholder="e.g. Ramesh Sharma"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number (for OTP verification)
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-xs font-bold bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-slate-600">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={patientMobile}
                        onChange={e => setPatientMobile(e.target.value)}
                        placeholder="10 digit mobile"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ABHA ID / Address <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={patientAbha}
                      onChange={e => setPatientAbha(e.target.value)}
                      placeholder="e.g. 14-5544-7788-9922 or ramesh@abdm"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Linked to Ayushman Bharat Digital Mission (ABDM) for instant paperless records.
                    </p>
                  </div>
                </>
              )}

              {/* Option 2: Ambulance Login */}
              {activeTab === 'AMBULANCE' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ambulance ID / Vehicle Reg. No.
                    </label>
                    <input
                      type="text"
                      required
                      value={ambulanceId}
                      onChange={e => setAmbulanceId(e.target.value)}
                      placeholder="e.g. AMB-UP80-108 or UP-80-EZ-4192"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Registered Attendant / Paramedic ID
                    </label>
                    <input
                      type="text"
                      required
                      value={attendantId}
                      onChange={e => setAttendantId(e.target.value)}
                      placeholder="e.g. ATT-4091"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Registered Mobile Number
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-xs font-bold bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-slate-600">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        value={ambulanceMobile}
                        onChange={e => setAmbulanceMobile(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Option 3: Doctor Login */}
              {activeTab === 'DOCTOR' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Unique Doctor ID
                    </label>
                    <select
                      value={doctorId}
                      onChange={e => setDoctorId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold bg-white"
                    >
                      <option value="DOC-ORTHO-1001">DOC-ORTHO-1001 — Prof. Arvind Mehta (HOD Ortho)</option>
                      <option value="DOC-ORTHO-1042">DOC-ORTHO-1042 — Dr. Priya Sharma (Assoc Prof)</option>
                      <option value="DOC-CARDIO-8892">DOC-CARDIO-8892 — Prof. V. K. Bansal (HOD Cardio)</option>
                      <option value="DOC-MED-1005">DOC-MED-1005 — Prof. Ramesh Chandra (HOD Medicine)</option>
                      <option value="DOC-ORTHO-2101">DOC-ORTHO-2101 — Dr. Rahul Srivastava (JNR-3)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Registered Mobile Number
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-xs font-bold bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-slate-600">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        value={doctorMobile}
                        onChange={e => setDoctorMobile(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Doctor personal contact numbers are kept strictly confidential by ArogyaGati.
                    </p>
                  </div>
                </>
              )}

              {/* Option 4: Staff Login */}
              {activeTab === 'STAFF_ADMIN' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hospital Staff ID / CMS Badge
                    </label>
                    <input
                      type="text"
                      required
                      value={staffId}
                      onChange={e => setStaffId(e.target.value)}
                      placeholder="e.g. STAFF-ADMIN-01"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Staff Mobile Number
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-xs font-bold bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-slate-600">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        value={staffMobile}
                        onChange={e => setStaffMobile(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 mt-4"
              >
                <span>Send One-Time Password (OTP)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Enter 6-Digit OTP</h4>
                <p className="text-xs text-slate-500">
                  Verification code dispatched to registered mobile number.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full py-3 text-center text-2xl font-bold tracking-widest border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center text-xs text-slate-600">
                <span>Demo Fast-Track: </span>
                <button
                  type="button"
                  onClick={() => setOtpCode('123456')}
                  className="font-bold text-blue-700 underline"
                >
                  Click to Auto-fill "123456"
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2"
              >
                <span>Verify & Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Change mobile / details
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
