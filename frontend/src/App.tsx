import React from 'react';
import { BrowserRouter, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { DEMO_CREDENTIALS } from './services/mockAuthService';
import { Sparkles, LayoutGrid } from 'lucide-react';

const QuickRoleBar: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Instant 1-click evaluator role switcher for hackathon judges
  const handleSwitchTo = (roleKey: 'patient' | 'doctor' | 'admin' | 'ambulance') => {
    if (roleKey === 'patient') {
      const cred = DEMO_CREDENTIALS.patient;
      login(
        {
          id: 'USR-PAT-9812',
          name: cred.name,
          mobile: cred.mobile,
          email: cred.email,
          abhaId: cred.abhaId,
          role: 'PATIENT',
          portal: 'patient',
          token: `evaluator_token_pat_${Date.now()}`,
          lastLogin: new Date().toISOString(),
        },
        `token_patient_${Date.now()}`
      );
      navigate('/dashboard/patient');
    } else if (roleKey === 'doctor') {
      const doc = DEMO_CREDENTIALS.doctor;
      login(
        {
          id: doc.doctorId,
          name: doc.name,
          email: doc.email,
          mobile: doc.mobile,
          doctorId: doc.doctorId,
          department: doc.department,
          designation: doc.designation,
          role: 'DOCTOR',
          portal: 'doctor',
          token: `evaluator_token_doc_${Date.now()}`,
          lastLogin: new Date().toISOString(),
        },
        `token_doc_${Date.now()}`
      );
      navigate('/dashboard/doctor');
    } else if (roleKey === 'admin') {
      const adm = DEMO_CREDENTIALS.admin;
      login(
        {
          id: 'ADMIN-01-ROOT',
          name: adm.name,
          email: adm.email,
          mobile: adm.mobile,
          staffId: adm.adminId,
          department: adm.department,
          designation: adm.designation,
          role: 'ADMIN',
          portal: 'admin',
          mfaVerified: true,
          token: `evaluator_token_adm_${Date.now()}`,
          lastLogin: new Date().toISOString(),
        },
        `token_admin_${Date.now()}`
      );
      navigate('/dashboard/admin');
    } else if (roleKey === 'ambulance') {
      const amb = DEMO_CREDENTIALS.ambulance;
      login(
        {
          id: 'AMB-VEH-108',
          name: amb.name,
          mobile: amb.mobile,
          vehicleId: amb.vehicleId,
          staffId: amb.driverId,
          department: amb.department,
          designation: amb.designation,
          role: 'AMBULANCE_DRIVER',
          portal: 'ambulance',
          token: `evaluator_token_amb_${Date.now()}`,
          lastLogin: new Date().toISOString(),
        },
        `token_ambulance_${Date.now()}`
      );
      navigate('/dashboard/ambulance');
    }
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1.5 pl-1 text-slate-400 font-semibold text-[11px] hidden sm:flex">
        <Sparkles className="w-3 h-3 text-amber-400" />
        <span>Hackathon Fast Switch:</span>
      </div>

      <Link
        to="/login"
        className={`px-2.5 py-1 rounded-xl font-bold transition flex items-center gap-1 ${
          location.pathname === '/login'
            ? 'bg-white text-slate-950 shadow-xs'
            : 'hover:bg-slate-800 text-slate-300'
        }`}
      >
        <LayoutGrid className="w-3 h-3" />
        <span>Portals</span>
      </Link>

      <button
        type="button"
        onClick={() => handleSwitchTo('patient')}
        className={`px-2.5 py-1 rounded-xl font-bold transition cursor-pointer ${
          location.pathname === '/dashboard/patient'
            ? 'bg-[#3435D8] text-white shadow-xs'
            : 'hover:bg-slate-800 text-slate-300'
        }`}
      >
        Patient
      </button>

      <button
        type="button"
        onClick={() => handleSwitchTo('doctor')}
        className={`px-2.5 py-1 rounded-xl font-bold transition cursor-pointer ${
          location.pathname === '/dashboard/doctor'
            ? 'bg-[#2424B8] text-white shadow-xs'
            : 'hover:bg-slate-800 text-slate-300'
        }`}
      >
        Doctor Desk
      </button>

      <button
        type="button"
        onClick={() => handleSwitchTo('admin')}
        className={`px-2.5 py-1 rounded-xl font-bold transition cursor-pointer ${
          location.pathname === '/dashboard/admin'
            ? 'bg-purple-600 text-white shadow-xs'
            : 'hover:bg-slate-800 text-slate-300'
        }`}
      >
        Admin
      </button>

      <button
        type="button"
        onClick={() => handleSwitchTo('ambulance')}
        className={`px-2.5 py-1 rounded-xl font-bold transition cursor-pointer ${
          location.pathname === '/dashboard/ambulance'
            ? 'bg-[#DC4545] text-white shadow-xs'
            : 'hover:bg-slate-800 text-slate-300'
        }`}
      >
        Ambulance 108
      </button>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-[#F5F6FC] font-sans text-[#171B2C] antialiased">
          <AppRoutes />
          <QuickRoleBar />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
