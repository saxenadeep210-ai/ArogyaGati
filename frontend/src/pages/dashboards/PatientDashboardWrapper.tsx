import React, { useState } from 'react';
import { DashboardHeader } from '../../components/dashboards/DashboardHeader';
import { PatientDashboard } from '../../components/PatientDashboard';
import { LiveTokenTracker } from '../../components/LiveTokenTracker';
import { BedTracker } from '../../components/BedTracker';
import { DoctorDirectory } from '../../components/DoctorDirectory';
import { OpdRegistrationModal } from '../../components/OpdRegistrationModal';
import { MedicalHistoryModal } from '../../components/MedicalHistoryModal';
import { AbhaCardModal } from '../../components/AbhaCardModal';
import { HospitalCommandBar } from '../../components/common/HospitalCommandBar';
import { MobileBottomNav } from '../../components/common/MobileBottomNav';
import { Doctor } from '../../types';
import { useTranslation } from '../../utils/translations';

export const PatientDashboardWrapper: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('patient-dashboard');
  const [opdModalOpen, setOpdModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [abhaModalOpen, setAbhaModalOpen] = useState(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const { t } = useTranslation();

  const handleSelectDoctorForOpd = (_doc: Doctor) => {
    setOpdModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F6FC] flex flex-col selection:bg-[#3435D8] selection:text-white pb-20 md:pb-6">
      <DashboardHeader portalName={t.nav.patientPortal} portalColor="blue" />

      {/* Internal Patient Navigation Bar */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('patient-dashboard')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap font-bold ${
              activeTab === 'patient-dashboard'
                ? 'bg-[#3435D8] text-white shadow-sm'
                : 'text-[#737B91] hover:text-[#171B2C] hover:bg-slate-100'
            }`}
          >
            {t.patient.greeting} & Overview
          </button>
          <button
            onClick={() => setActiveTab('live-token')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap font-bold ${
              activeTab === 'live-token'
                ? 'bg-[#3435D8] text-white shadow-sm'
                : 'text-[#737B91] hover:text-[#171B2C] hover:bg-slate-100'
            }`}
          >
            {t.nav.liveQueue}
          </button>
          <button
            onClick={() => setActiveTab('beds')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap font-bold ${
              activeTab === 'beds'
                ? 'bg-[#3435D8] text-white shadow-sm'
                : 'text-[#737B91] hover:text-[#171B2C] hover:bg-slate-100'
            }`}
          >
            {t.nav.bedTracker}
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap font-bold ${
              activeTab === 'doctors'
                ? 'bg-[#3435D8] text-white shadow-sm'
                : 'text-[#737B91] hover:text-[#171B2C] hover:bg-slate-100'
            }`}
          >
            {t.nav.doctorDirectory}
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

      {/* Omni-Search Hospital Command Bar */}
      <HospitalCommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          setIsCommandBarOpen(false);
        }}
        onOpenOpdRegistration={() => {
          setOpdModalOpen(true);
          setIsCommandBarOpen(false);
        }}
        onOpenAbhaCard={() => {
          setAbhaModalOpen(true);
          setIsCommandBarOpen(false);
        }}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onNavigateToTab={(tab) => setActiveTab(tab)}
        onOpenCommandBar={() => setIsCommandBarOpen(true)}
      />
    </div>
  );
};
