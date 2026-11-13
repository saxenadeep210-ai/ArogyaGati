import React from 'react';
import { DashboardHeader } from '../../components/dashboards/DashboardHeader';
import { HospitalStaffDashboard } from '../../components/HospitalStaffDashboard';

export const AdminDashboardWrapper: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F6FC] flex flex-col">
      <DashboardHeader portalName="Hospital Administrator" portalColor="purple" />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        <HospitalStaffDashboard />
      </main>
    </div>
  );
};
