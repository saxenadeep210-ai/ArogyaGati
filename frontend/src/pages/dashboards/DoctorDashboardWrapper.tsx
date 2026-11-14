import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '../../components/dashboards/DashboardHeader';
import { DoctorDesk } from '../../components/DoctorDesk';
import { DoctorGuideBox } from '../../components/DoctorGuideBox';
import { BedTracker } from '../../components/BedTracker';
import { useTranslation } from '../../utils/translations';

export const DoctorDashboardWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'desk' | 'guide-box' | 'beds'>('desk');
  const [selectedCaseGroupId, setSelectedCaseGroupId] = useState<string | undefined>(undefined);
  const { t, isHindi } = useTranslation();

  const handleOpenCaseChat = (groupId: string) => {
    setSelectedCaseGroupId(groupId);
    setActiveTab('guide-box');
  };

  const handleBack = () => {
    if (activeTab !== 'desk') {
      setActiveTab('desk');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FC] flex flex-col selection:bg-[#2424B8] selection:text-white">
      <DashboardHeader portalName={t.nav.doctorDesk} portalColor="indigo" onBack={handleBack} />

      {/* Internal Navigation Bar */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2 sticky top-[57px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('desk')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap font-bold ${
              activeTab === 'desk'
                ? 'bg-[#2424B8] text-white shadow-xs'
                : 'text-[#737B91] hover:text-[#171B2C] hover:bg-slate-100'
            }`}
          >
            {isHindi ? 'लाइव ओपीडी कतार एवं परामर्श' : 'Live Patient Queue & Consultations'}
          </button>
          <button
            onClick={() => setActiveTab('guide-box')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap font-bold ${
              activeTab === 'guide-box'
                ? 'bg-[#2424B8] text-white shadow-xs'
                : 'text-[#737B91] hover:text-[#171B2C] hover:bg-slate-100'
            }`}
          >
            {isHindi ? 'मल्टी-स्पेशियलिटी गाइड बॉक्स' : 'Multi-Specialty Guide Box'}
          </button>
          <button
            onClick={() => setActiveTab('beds')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap font-bold ${
              activeTab === 'beds'
                ? 'bg-[#2424B8] text-white shadow-xs'
                : 'text-[#737B91] hover:text-[#171B2C] hover:bg-slate-100'
            }`}
          >
            {isHindi ? 'वार्ड एवं आईसीयू बेड स्थिति' : 'Ward & ICU Bed Status'}
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 pb-20 md:pb-8">
        {activeTab === 'desk' && <DoctorDesk onOpenCaseChat={handleOpenCaseChat} />}
        {activeTab === 'guide-box' && (
          <DoctorGuideBox initialGroupId={selectedCaseGroupId} />
        )}
        {activeTab === 'beds' && <BedTracker />}
      </main>
    </div>
  );
};
