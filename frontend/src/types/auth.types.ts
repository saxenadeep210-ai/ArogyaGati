export type AuthRole = 
  | 'PATIENT' 
  | 'DOCTOR' 
  | 'MEDICAL_STAFF' 
  | 'ADMIN' 
  | 'AMBULANCE_DRIVER' 
  | 'PARAMEDIC';

export type PortalType = 'patient' | 'doctor' | 'admin' | 'ambulance';

export interface UserSession {
  id: string;
  name: string;
  email?: string;
  mobile: string;
  role: AuthRole;
  portal: PortalType;
  token: string;
  refreshToken?: string;
  abhaId?: string;
  staffId?: string;
  doctorId?: string;
  vehicleId?: string;
  department?: string;
  designation?: string;
  mfaVerified?: boolean;
  lastLogin: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: UserSession;
  token?: string;
  requiresMfa?: boolean;
  tempToken?: string;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  otpId?: string;
  demoCode?: string;
  expiresInSeconds?: number;
}

export type SupportedLanguage = 'en' | 'hi';
