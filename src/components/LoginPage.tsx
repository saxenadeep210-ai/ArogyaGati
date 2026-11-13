import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Truck, 
  Stethoscope, 
  SlidersHorizontal, 
  ArrowRight, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles,
  Phone,
  Building2,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { apiConnector } from '../services/apiConnector';
import { hospitalStore } from '../services/hospitalStore';
import { UserRole, AuthUser } from '../types';
import { HOSPITAL_INFO } from '../services/mockData';

interface LoginPageProps {
  onSuccess: (role: UserRole) => void;
  onNavigateHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onNavigateHome }) => {
  const [activeRole, setActiveRole] = useState<UserRole>('PATIENT');

  // Input fields
  const [patientMobile, setPatientMobile] = useState('9812345678');
  const [patientName, setPatientName] = useState('Ramesh Sharma');
  const [patientAbha, setPatientAbha] = useState('14-5544-7788-9922');

  const [ambulanceId, setAmbulanceId] = useState('AMB-UP80-108');
  const [attendantId, setAttendantId] = useState('ATT-4091');
  const [ambulanceMobile, setAmbulanceMobile] = useState('9911223344');

  const [doctorId, setDoctorId] = useState('DOC-ORTHO-1001');
  const [doctorMobile, setDoctorMobile] = useState('9822334455');

  const [staffId, setStaffId] = useState('STAFF-ADMIN-01');
  const [staffMobile, setStaffMobile] = useState('9810010010');

  // OTP flow state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const mobile = activeRole === 'PATIENT' ? patientMobile :
                   activeRole === 'AMBULANCE' ? ambulanceMobile :
                   activeRole === 'DOCTOR' ? doctorMobile : staffMobile;

    try {
      const res = await apiConnector.auth.sendOtp(mobile, activeRole);
      setLoading(false);
      if (res.success) {
        setOtpSent(true);
        setOtpCode('123456'); // Pre-fill demo OTP for effortless user experience
        setSuccessMsg('Government Health OTP generated! Use demo code: 123456');
        setCountdown(60);
      } else {
        setErrorMsg(res.message || 'Unable to send OTP');
      }
    } catch {
      setLoading(false);
      setOtpSent(true);
      setOtpCode('123456');
      setSuccessMsg('Use demo verification code: 123456');
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const mobile = activeRole === 'PATIENT' ? patientMobile :
                   activeRole === 'AMBULANCE' ? ambulanceMobile :
                   activeRole === 'DOCTOR' ? doctorMobile : staffMobile;

    try {
      const res = await apiConnector.auth.verifyOtp({
        role: activeRole,
        identifier: mobile,
        otp: otpCode,
        name: patientName,
        abhaId: patientAbha,
        doctorId,
        staffId,
        ambulanceId
      });

      setLoading(false);
      if (res.success && res.user) {
        onSuccess(activeRole);
      } else {
        setErrorMsg(res.message || 'Invalid OTP code. Please enter 123456.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Verification failed. Try again.');
    }
  };

  // One-click fast demo login
  const handleQuickDemoLogin = (role: UserRole, docId?: string) => {
    hospitalStore.loginAsRole(role, docId);
    onSuccess(role);
  };

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    setOtpSent(false);
    setOtpCode('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Return to home button */}
      <div className="max-w-2xl mx-auto w-full mb-4">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hospital Homepage</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-teal-700 p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold text-blue-100 mb-3 border border-white/20">
                <ShieldCheck className="w-4 h-4 text-teal-300" />
                <span>ABDM Single Sign-On • National Health Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                ArogyaGati Secure Portal Access
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-lg">
                Log in to access your OPD tokens, ambulance emergency dispatch, doctor consultation desk, or administrative operations.
              </p>
            </div>
          </div>

          {/* 4 Role Selector Tabs */}
          <div className="p-3 bg-slate-50/80 border-b border-slate-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleRoleChange('PATIENT')}
                className={`py-3 px-3 rounded-2xl font-bold text-xs flex flex-col items-center gap-1.5 transition ${
                  activeRole === 'PATIENT'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <User className="w-4 h-4" />
                <span>1. Patient / Citizen</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('AMBULANCE')}
                className={`py-3 px-3 rounded-2xl font-bold text-xs flex flex-col items-center gap-1.5 transition ${
                  activeRole === 'AMBULANCE'
                    ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>2. Ambulance 108</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('DOCTOR')}
                className={`py-3 px-3 rounded-2xl font-bold text-xs flex flex-col items-center gap-1.5 transition ${
                  activeRole === 'DOCTOR'
                    ? 'bg-blue-700 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>3. Doctor Desk</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('STAFF_ADMIN')}
                className={`py-3 px-3 rounded-2xl font-bold text-xs flex flex-col items-center gap-1.5 transition ${
                  activeRole === 'STAFF_ADMIN'
                    ? 'bg-purple-700 text-white shadow-md shadow-purple-500/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>4. Staff & Admin</span>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                
                {/* 1. Patient Fields */}
                {activeRole === 'PATIENT' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Patient Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={patientName}
                        onChange={e => setPatientName(e.target.value)}
                        placeholder="e.g. Ramesh Sharma"
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Mobile Number (For OTP Verification)
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3.5 text-xs font-bold bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-slate-600">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          value={patientMobile}
                          onChange={e => setPatientMobile(e.target.value)}
                          placeholder="10-digit mobile number"
                          className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        ABHA ID / Address <span className="text-slate-400 font-normal">(Optional, for digital records)</span>
                      </label>
                      <input
                        type="text"
                        value={patientAbha}
                        onChange={e => setPatientAbha(e.target.value)}
                        placeholder="14-5544-7788-9922 or ramesh@abdm"
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-xs"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Connects with Ayushman Bharat Digital Mission (ABDM) for paperless prescription history.
                      </p>
                    </div>
                  </>
                )}

                {/* 2. Ambulance Fields */}
                {activeRole === 'AMBULANCE' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Ambulance Vehicle ID / Registration No.
                      </label>
                      <input
                        type="text"
                        required
                        value={ambulanceId}
                        onChange={e => setAmbulanceId(e.target.value)}
                        placeholder="e.g. AMB-UP80-108 or UP-80-EZ-4192"
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none font-mono font-bold uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Registered Paramedic / EMT Attendant ID
                      </label>
                      <input
                        type="text"
                        required
                        value={attendantId}
                        onChange={e => setAttendantId(e.target.value)}
                        placeholder="e.g. ATT-4091"
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Paramedic Mobile Number
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3.5 text-xs font-bold bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-slate-600">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          value={ambulanceMobile}
                          onChange={e => setAmbulanceMobile(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* 3. Doctor Fields */}
                {activeRole === 'DOCTOR' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Select Doctor Account
                      </label>
                      <select
                        value={doctorId}
                        onChange={e => setDoctorId(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium bg-white"
                      >
                        <option value="DOC-ORTHO-1001">DOC-ORTHO-1001 — Prof. (Dr.) Arvind Mehta (HOD Ortho & Trauma)</option>
                        <option value="DOC-ORTHO-1042">DOC-ORTHO-1042 — Dr. Priya Sharma (Assoc. Professor Ortho)</option>
                        <option value="DOC-CARDIO-1002">DOC-CARDIO-1002 — Prof. (Dr.) V. K. Bansal (HOD Cardiology)</option>
                        <option value="DOC-MED-1004">DOC-MED-1004 — Prof. (Dr.) Ramesh Chandra (HOD Medicine)</option>
                        <option value="DOC-ORTHO-2101">DOC-ORTHO-2101 — Dr. Rahul Srivastava (Junior Resident 3)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Doctor Mobile Number
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3.5 text-xs font-bold bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-slate-600">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          value={doctorMobile}
                          onChange={e => setDoctorMobile(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Doctor personal contact numbers are kept strictly confidential by ArogyaGati server-side masking.
                      </p>
                    </div>
                  </>
                )}

                {/* 4. Staff Admin Fields */}
                {activeRole === 'STAFF_ADMIN' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Hospital Administrative Staff ID
                      </label>
                      <input
                        type="text"
                        required
                        value={staffId}
                        onChange={e => setStaffId(e.target.value)}
                        placeholder="e.g. STAFF-ADMIN-01"
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Registered Mobile Number
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3.5 text-xs font-bold bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-slate-600">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          value={staffMobile}
                          onChange={e => setStaffMobile(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-r-xl focus:ring-2 focus:ring-purple-600 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg transition flex items-center justify-center gap-2 mt-4 ${
                    activeRole === 'PATIENT' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' :
                    activeRole === 'AMBULANCE' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' :
                    activeRole === 'DOCTOR' ? 'bg-blue-700 hover:bg-blue-800 shadow-blue-500/20' :
                    'bg-purple-700 hover:bg-purple-800 shadow-purple-500/20'
                  }`}
                >
                  <span>{loading ? 'Generating Security OTP...' : 'Send One-Time Password (OTP)'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center py-2">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 mx-auto flex items-center justify-center mb-2 border border-blue-200">
                    <KeyRound className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">Enter 6-Digit Verification Code</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Code dispatched via SMS to your registered mobile.
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
                    className="w-full py-3.5 text-center text-3xl font-black tracking-widest border-2 border-blue-500 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:outline-none font-mono text-blue-900 bg-blue-50/30"
                  />
                </div>

                {/* Demo autofill hint */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center text-xs text-slate-600 flex items-center justify-center gap-2">
                  <span>Demo Mode:</span>
                  <button
                    type="button"
                    onClick={() => setOtpCode('123456')}
                    className="font-bold text-blue-700 underline hover:text-blue-900"
                  >
                    Click to auto-fill "123456"
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Verifying...' : 'Verify OTP & Enter Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Change details
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpCode('123456');
                      setSuccessMsg('OTP code refreshed: 123456');
                    }}
                    className="font-bold text-blue-700 hover:text-blue-900"
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}

            {/* Quick Demo One-Click Access Cards */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Instant Demo One-Click Sign-In
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Bypass typing</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('PATIENT')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition text-left"
                >
                  <div className="font-bold text-slate-800">Ramesh Sharma</div>
                  <div className="text-[10px] text-slate-500">Patient PWA</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('AMBULANCE')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-red-400 hover:bg-red-50/50 transition text-left"
                >
                  <div className="font-bold text-slate-800">108 Paramedic</div>
                  <div className="text-[10px] text-slate-500">Emergency Unit</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('DOCTOR', 'DOC-ORTHO-1001')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition text-left"
                >
                  <div className="font-bold text-slate-800">Prof. Arvind Mehta</div>
                  <div className="text-[10px] text-slate-500">Doctor Desk (HOD)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('STAFF_ADMIN')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition text-left"
                >
                  <div className="font-bold text-slate-800">Hospital Admin</div>
                  <div className="text-[10px] text-slate-500">Operations CMS</div>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
