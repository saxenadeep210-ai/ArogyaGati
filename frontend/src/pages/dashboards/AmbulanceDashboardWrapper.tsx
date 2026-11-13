import React from 'react';
import { DashboardHeader } from '../../components/dashboards/DashboardHeader';
import { AmbulanceDashboard } from '../../components/AmbulanceDashboard';

export const AmbulanceDashboardWrapper: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F6FC] flex flex-col">
      <DashboardHeader portalName="Ambulance & Emergency Response" portalColor="red" />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        <AmbulanceDashboard />
      </main>
    </div>
  );
};
