import React, { useState } from 'react';
import { DashboardHeader } from '../../components/dashboards/DashboardHeader';
import { PatientDashboard } from '../../components/PatientDashboard';
import { LiveTokenTracker } from '../../components/LiveTokenTracker';
import { BedTracker } from '../../components/BedTracker';
import { HospitalWayfinder } from '../../components/HospitalWayfinder';
import { DoctorDirectory } from '../../components/DoctorDirectory';
import { OpdRegistrationModal } from '../../components/OpdRegistrationModal';
import { MedicalHistoryModal } from '../../components/MedicalHistoryModal';
import { AbhaCardModal } from '../../components/AbhaCardModal';
import { Doctor } from '../../types';

export const PatientDashboardWrapper: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('patient-dashboard');
  const [opdModalOpen, setOpdModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [abhaModalOpen, setAbhaModalOpen] = useState(false);

  const handleSelectDoctorForOpd = (doc: Doctor) => {
    setOpdModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F6FC] flex flex-col">
      <DashboardHeader portalName="Patient Portal" portalColor="blue" />

      {/* Internal Patient Navigation Bar */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('patient-dashboard')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              activeTab === 'patient-dashboard'
                ? 'bg-[#3435D8] text-white shadow-xs'
                : 'text-[#737B91] hover:text-[#171B2C] hover:bg-slate-100'
            }`}
          >
            My Overview
          </button>
          <button
            onClick={() => setActiveTab('live-token')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              activeTab === 'live-token'
                ? 'bg-[#3435D8] text-white shadow-xs'
                : 'text-[#737B91] hover:text-[#171B2C] hover:bg-slate-100'
            }`}
          >
            Live OPD Queue Tracker
          </button>
          <button
            onClick={() => setActiveTab('beds')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              activeTab === 'beds'
                ? 'bg-[#3435D8] text-white shadow-xs'
                : 'text-[#737B91] hover:text-[#171B2C] hover:bg-slate-100'
            }`}
          >
            Hospital Bed Availability
          </button>
          <button
            onClick={() => setActiveTab('wayfinder')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              activeTab === 'wayfinder'
                ? 'bg-[#3435D8] text-white shadow-xs'
                : 'text-[#737B91] hover:text-[#171B2C] hover:bg-slate-100'
            }`}
          >
            Indoor Hospital Wayfinder
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              activeTab === 'doctors'
                ? 'bg-[#3435D8] text-white shadow-xs'
                : 'text-[#737B91] hover:text-[#171B2C] hover:bg-slate-100'
            }`}
          >
            Doctor Directory
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        {activeTab === 'patient-dashboard' && (
          <PatientDashboard
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onOpenOpdRegistration={() => setOpdModalOpen(true)}
            onOpenMedicalHistory={() => setHistoryModalOpen(true)}
            onOpenAbhaCard={() => setAbhaModalOpen(true)}
          />
        )}

        {activeTab === 'live-token' && (
          <LiveTokenTracker
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onOpenOpdRegistration={() => setOpdModalOpen(true)}
          />
        )}

        {activeTab === 'beds' && <BedTracker />}

        {activeTab === 'wayfinder' && <HospitalWayfinder />}

        {activeTab === 'doctors' && (
          <DoctorDirectory onSelectDoctorForOpd={handleSelectDoctorForOpd} />
        )}
      </main>

      {/* Patient Modals */}
      <OpdRegistrationModal
        isOpen={opdModalOpen}
        onClose={() => setOpdModalOpen(false)}
        onTokenGenerated={() => setActiveTab('live-token')}
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
};
