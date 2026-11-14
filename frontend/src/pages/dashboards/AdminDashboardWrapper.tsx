import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '../../components/dashboards/DashboardHeader';
import { HospitalStaffDashboard, AdminTab } from '../../components/HospitalStaffDashboard';
import { useTranslation } from '../../utils/translations';

export const AdminDashboardWrapper: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');

  const handleBack = () => {
    if (activeTab !== 'OVERVIEW') {
      setActiveTab('OVERVIEW');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FC] flex flex-col">
      <DashboardHeader portalName={t.nav.staffAdmin} portalColor="purple" onBack={handleBack} />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        <HospitalStaffDashboard activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
    </div>
  );
};
