import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { PatientDashboard } from './components/PatientDashboard';
import { LiveTokenTracker } from './components/LiveTokenTracker';
import { AmbulanceDashboard } from './components/AmbulanceDashboard';
import { DoctorDesk } from './components/DoctorDesk';
import { DoctorGuideBox } from './components/DoctorGuideBox';
import { BedTracker } from './components/BedTracker';
import { HospitalWayfinder } from './components/HospitalWayfinder';
import { DoctorDirectory } from './components/DoctorDirectory';
import { HospitalStaffDashboard } from './components/HospitalStaffDashboard';
import { LoginModal } from './components/LoginModal';
import { OpdRegistrationModal } from './components/OpdRegistrationModal';
import { MedicalHistoryModal } from './components/MedicalHistoryModal';
import { AbhaCardModal } from './components/AbhaCardModal';
import { hospitalStore } from './services/hospitalStore';
import { QueueToken, Doctor } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  
  // Modals state
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [opdModalOpen, setOpdModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [abhaModalOpen, setAbhaModalOpen] = useState(false);
  const [selectedCaseGroupId, setSelectedCaseGroupId] = useState<string | undefined>(undefined);

  const handleOpenCaseChat = (groupId: string) => {
    setSelectedCaseGroupId(groupId);
    setActiveTab('guide-box');
  };

  const handleSelectDoctorForOpd = (doc: Doctor) => {
    setOpdModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 flex flex-col antialiased selection:bg-teal-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        onOpenLogin={() => setLoginModalOpen(true)}
        onNavigateHome={() => setActiveTab('landing')}
        onNavigateToTab={(tab: string) => setActiveTab(tab)}
        activeTab={activeTab}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            onNavigateToTab={(tab: string) => setActiveTab(tab)}
            onOpenLogin={() => setLoginModalOpen(true)}
            onOpenOpdRegistration={() => setOpdModalOpen(true)}
          />
        )}

        {activeTab === 'patient-dashboard' && (
          <PatientDashboard
            onNavigateToTab={(tab: string) => setActiveTab(tab)}
            onOpenOpdRegistration={() => setOpdModalOpen(true)}
            onOpenMedicalHistory={() => setHistoryModalOpen(true)}
            onOpenAbhaCard={() => setAbhaModalOpen(true)}
          />
        )}

        {activeTab === 'live-token' && (
          <LiveTokenTracker
            onNavigateToTab={(tab: string) => setActiveTab(tab)}
            onOpenOpdRegistration={() => setOpdModalOpen(true)}
          />
        )}

        {activeTab === 'ambulance-dashboard' && (
          <AmbulanceDashboard />
        )}

        {activeTab === 'doctor-desk' && (
          <DoctorDesk
            onOpenCaseChat={handleOpenCaseChat}
          />
        )}

        {activeTab === 'guide-box' && (
          <DoctorGuideBox
            initialGroupId={selectedCaseGroupId}
          />
        )}

        {activeTab === 'beds' && (
          <BedTracker />
        )}

        {activeTab === 'wayfinder' && (
          <HospitalWayfinder />
        )}

        {activeTab === 'doctors' && (
          <DoctorDirectory
            onSelectDoctorForOpd={handleSelectDoctorForOpd}
          />
        )}

        {activeTab === 'admin-dashboard' && (
          <HospitalStaffDashboard />
        )}
      </main>

      {/* Floating Fast Role Bar at bottom for effortless evaluator switching */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs">
        <span className="text-[11px] font-bold text-slate-400 pl-1 hidden sm:inline">
          Quick Portal Switcher:
        </span>
        <button
          onClick={() => {
            hospitalStore.loginAsRole('PATIENT');
            setActiveTab('patient-dashboard');
          }}
          className={`px-2.5 py-1 rounded-xl font-bold transition ${
            activeTab === 'patient-dashboard' ? 'bg-emerald-500 text-slate-950' : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          Patient
        </button>
        <button
          onClick={() => {
            hospitalStore.loginAsRole('AMBULANCE');
            setActiveTab('ambulance-dashboard');
          }}
          className={`px-2.5 py-1 rounded-xl font-bold transition ${
            activeTab === 'ambulance-dashboard' ? 'bg-red-500 text-white' : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          Ambulance 108
        </button>
        <button
          onClick={() => {
            hospitalStore.loginAsRole('DOCTOR', 'DOC-ORTHO-1001');
            setActiveTab('doctor-desk');
          }}
          className={`px-2.5 py-1 rounded-xl font-bold transition ${
            activeTab === 'doctor-desk' ? 'bg-blue-500 text-white' : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          Doctor Desk
        </button>
        <button
          onClick={() => {
            hospitalStore.loginAsRole('STAFF_ADMIN');
            setActiveTab('admin-dashboard');
          }}
          className={`px-2.5 py-1 rounded-xl font-bold transition ${
            activeTab === 'admin-dashboard' ? 'bg-purple-500 text-white' : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          Staff Admin
        </button>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={(role) => {
          if (role === 'PATIENT') setActiveTab('patient-dashboard');
          else if (role === 'AMBULANCE') setActiveTab('ambulance-dashboard');
          else if (role === 'DOCTOR') setActiveTab('doctor-desk');
          else setActiveTab('admin-dashboard');
        }}
      />

      <OpdRegistrationModal
        isOpen={opdModalOpen}
        onClose={() => setOpdModalOpen(false)}
        onTokenGenerated={() => {
          setActiveTab('live-token');
        }}
      />

      <MedicalHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
      />

      <AbhaCardModal
        isOpen={abhaModalOpen}
        onClose={() => setAbhaModalOpen(false)}
      />

    </div>
  );
}
