import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-[#F5F6FC] font-sans text-[#171B2C] antialiased overflow-x-hidden selection:bg-[#3435D8] selection:text-white">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
