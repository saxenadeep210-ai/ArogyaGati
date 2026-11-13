import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PortalSelection } from '../pages/auth/PortalSelection';
import { PatientLogin } from '../pages/auth/PatientLogin';
import { DoctorLogin } from '../pages/auth/DoctorLogin';
import { AdminLogin } from '../pages/auth/AdminLogin';
import { AmbulanceLogin } from '../pages/auth/AmbulanceLogin';
import { PatientRegister } from '../pages/auth/PatientRegister';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { PatientDashboardWrapper } from '../pages/dashboards/PatientDashboardWrapper';
import { DoctorDashboardWrapper } from '../pages/dashboards/DoctorDashboardWrapper';
import { AdminDashboardWrapper } from '../pages/dashboards/AdminDashboardWrapper';
import { AmbulanceDashboardWrapper } from '../pages/dashboards/AmbulanceDashboardWrapper';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root redirects to unified portal selection */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Authentication Routes */}
      <Route path="/login" element={<PortalSelection />} />
      <Route path="/login/patient" element={<PatientLogin />} />
      <Route path="/login/doctor" element={<DoctorLogin />} />
      <Route path="/login/admin" element={<AdminLogin />} />
      <Route path="/login/ambulance" element={<AmbulanceLogin />} />
      <Route path="/register/patient" element={<PatientRegister />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Role-Based Dashboard Routes */}
      <Route
        path="/dashboard/patient"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientDashboardWrapper />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/doctor"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR', 'MEDICAL_STAFF']}>
            <DoctorDashboardWrapper />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboardWrapper />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/ambulance"
        element={
          <ProtectedRoute allowedRoles={['AMBULANCE_DRIVER', 'PARAMEDIC']}>
            <AmbulanceDashboardWrapper />
          </ProtectedRoute>
        }
      />

      {/* Fallback to portal selection */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
