import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthRole } from '../../types/auth.types';
import { ShieldAlert, ArrowLeft, ArrowRight, Loader2, LogOut } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AuthRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading, logout, getDashboardRouteForRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F6FC] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#3435D8]" />
        <p className="text-xs font-semibold text-[#737B91]">Verifying security credentials...</p>
      </div>
    );
  }

  // Not authenticated -> redirect to portal selection / login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const authorizedRoute = getDashboardRouteForRole(user.role);

    return (
      <div className="min-h-screen bg-[#F5F6FC] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#171B2C]">Access Restricted</h2>
            <p className="text-xs text-[#737B91] leading-relaxed">
              Your logged-in role (<strong className="text-[#171B2C]">{user.role}</strong>) does
              not have authorization to view this section. ArogyaGati enforces strict zero-trust
              role-based access control.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-left text-xs border border-slate-200 space-y-1">
            <div className="text-[#737B91]">Logged in as: <strong className="text-[#171B2C]">{user.name}</strong></div>
            <div className="text-[#737B91]">Current Portal: <strong className="text-[#3435D8]">{user.portal.toUpperCase()}</strong></div>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              to={authorizedRoute}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3435D8] text-white font-semibold text-xs hover:bg-[#2424B8] transition"
            >
              <span>Go to Your Authorized Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#737B91] hover:text-[#171B2C] font-semibold text-xs transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out & Switch Portal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
