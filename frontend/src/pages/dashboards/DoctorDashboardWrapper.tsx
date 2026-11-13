import React, { useState } from 'react';
import { DashboardHeader } from '../../components/dashboards/DashboardHeader';
import { DoctorDesk } from '../../components/DoctorDesk';
import { DoctorGuideBox } from '../../components/DoctorGuideBox';
import { BedTracker } from '../../components/BedTracker';
import { HospitalWayfinder } from '../../components/HospitalWayfinder';

export const DoctorDashboardWrapper: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'desk' | 'guide-box' | 'beds' | 'wayfinder'>('desk');
  const [selectedCaseGroupId, setSelectedCaseGroupId] = useState<string | undefined>(undefined);

  const handleOpenCaseChat = (groupId: string) => {
    setSelectedCaseGroupId(groupId);
    setActiveTab('guide-box');
  };

  return (
    <div className="min-h-screen bg-[#F5F6FC] flex flex-col">
      <DashboardHeader portalName="Doctor's Desk" portalColor="indigo" />

      {/* Internal Navigation Bar */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('desk')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              activeTab === 'desk'
                ? 'bg-[#2424B8] text-white shadow-xs'
                : 'text-[#737B91] hover:text-[#171B2C] hover:bg-slate-100'
            }`}
          >
            Live Patient Queue & Consultations
          </button>
          <button
            onClick={() => setActiveTab('guide-box')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              activeTab === 'guide-box'
                ? 'bg-[#2424B8] text-white shadow-xs'
                : 'text-[#737B91] hover:text-[#171B2C] hover:bg-slate-100'
            }`}
          >
            Multi-Specialty Guide Box
          </button>
          <button
            onClick={() => setActiveTab('beds')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              activeTab === 'beds'
                ? 'bg-[#2424B8] text-white shadow-xs'
                : 'text-[#737B91] hover:text-[#171B2C] hover:bg-slate-100'
            }`}
          >
            Ward & ICU Bed Status
          </button>
          <button
            onClick={() => setActiveTab('wayfinder')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
              activeTab === 'wayfinder'
                ? 'bg-[#2424B8] text-white shadow-xs'
                : 'text-[#737B91] hover:text-[#171B2C] hover:bg-slate-100'
            }`}
          >
            Hospital Wayfinder Map
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        {activeTab === 'desk' && <DoctorDesk onOpenCaseChat={handleOpenCaseChat} />}
        {activeTab === 'guide-box' && (
          <DoctorGuideBox initialGroupId={selectedCaseGroupId} />
        )}
        {activeTab === 'beds' && <BedTracker />}
        {activeTab === 'wayfinder' && <HospitalWayfinder />}
      </main>
    </div>
  );
};
