import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from '../../components/dashboards/DashboardHeader';
import { AmbulanceDashboard } from '../../components/AmbulanceDashboard';
import { useTranslation } from '../../utils/translations';

export const AmbulanceDashboardWrapper: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F5F6FC] flex flex-col">
      <DashboardHeader portalName={t.nav.ambulancePortal} portalColor="red" onBack={handleBack} />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        <AmbulanceDashboard />
      </main>
    </div>
  );
};
