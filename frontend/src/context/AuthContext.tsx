import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession, AuthRole, SupportedLanguage, PortalType } from '../types/auth.types';
import { authService } from '../services/authService';
import { hospitalStore } from '../services/hospitalStore';

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  activeLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  login: (session: UserSession, token: string) => void;
  logout: () => Promise<void>;
  toggleDemoMode: () => void;
  hasRole: (roles: AuthRole[]) => boolean;
  getDashboardRouteForRole: (role: AuthRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'arogya_auth_token';
const SESSION_KEY = 'arogya_user_session';
const LANG_KEY = 'arogya_language';
const DEMO_KEY = 'arogya_demo_mode';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(DEMO_KEY);
    return saved !== null ? saved === 'true' : true;
  });
  const [activeLanguage, setActiveLanguage] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem(LANG_KEY) as SupportedLanguage) || 'en';
  });

  // Sync session on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedSession = localStorage.getItem(SESSION_KEY);

      if (storedToken && storedSession) {
        const parsedUser: UserSession = JSON.parse(storedSession);
        setUser(parsedUser);
        setToken(storedToken);
        syncWithHospitalStore(parsedUser);
      }
    } catch (e) {
      console.error('Failed to parse stored session:', e);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncWithHospitalStore = (sessionUser: UserSession) => {
    try {
      if (sessionUser.role === 'PATIENT') {
        hospitalStore.loginAsRole('PATIENT');
      } else if (sessionUser.role === 'DOCTOR') {
        hospitalStore.loginAsRole('DOCTOR', sessionUser.doctorId || 'DOC-ORTHO-1001');
      } else if (sessionUser.role === 'ADMIN') {
        hospitalStore.loginAsRole('STAFF_ADMIN');
      } else if (sessionUser.role === 'AMBULANCE_DRIVER' || sessionUser.role === 'PARAMEDIC') {
        hospitalStore.loginAsRole('AMBULANCE');
      }
    } catch (err) {
      console.warn('Sync with hospitalStore:', err);
    }
  };

  const login = (session: UserSession, authToken: string) => {
    setUser(session);
    setToken(authToken);
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    syncWithHospitalStore(session);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
      setIsLoading(false);
    }
  };

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => {
      const next = !prev;
      localStorage.setItem(DEMO_KEY, String(next));
      authService.setDemoMode(next);
      return next;
    });
  };

  const setLanguage = (lang: SupportedLanguage) => {
    setActiveLanguage(lang);
    localStorage.setItem(LANG_KEY, lang);
  };

  const hasRole = (roles: AuthRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const getDashboardRouteForRole = (role: AuthRole): string => {
    switch (role) {
      case 'PATIENT':
        return '/dashboard/patient';
      case 'DOCTOR':
      case 'MEDICAL_STAFF':
        return '/dashboard/doctor';
      case 'ADMIN':
        return '/dashboard/admin';
      case 'AMBULANCE_DRIVER':
      case 'PARAMEDIC':
        return '/dashboard/ambulance';
      default:
        return '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        isDemoMode,
        activeLanguage,
        setLanguage,
        login,
        logout,
        toggleDemoMode,
        hasRole,
        getDashboardRouteForRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
