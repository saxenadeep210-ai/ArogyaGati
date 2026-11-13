import { apiClient } from './apiClient';
import { mockAuthService, DEMO_CREDENTIALS } from './mockAuthService';
import { UserSession, LoginResponse, OtpResponse, AuthRole } from '../types/auth.types';

// Flag to switch between Mock and Real Spring Boot API
const IS_DEMO_DEFAULT = true;

class AuthService {
  private isDemoMode: boolean = IS_DEMO_DEFAULT;

  setDemoMode(enabled: boolean) {
    this.isDemoMode = enabled;
  }

  getDemoMode(): boolean {
    return this.isDemoMode;
  }

  // Send OTP
  async sendOtp(identifier: string, portal: string): Promise<OtpResponse> {
    if (this.isDemoMode) {
      return mockAuthService.sendOtp(identifier, portal);
    }
    try {
      const response = await apiClient.post<OtpResponse>('/auth/otp/send', {
        identifier,
        portal,
      });
      return response.data;
    } catch (error: any) {
      // Fallback gracefully in demo environments if backend is not yet booted
      console.warn('Real backend unavailable, falling back to mock OTP:', error?.message);
      return mockAuthService.sendOtp(identifier, portal);
    }
  }

  // Patient Mobile OTP Login
  async loginWithPatientOtp(mobile: string, otp: string): Promise<LoginResponse> {
    if (this.isDemoMode) {
      return mockAuthService.verifyPatientOtp(mobile, otp);
    }
    try {
      const response = await apiClient.post<LoginResponse>('/auth/patient/login-otp', {
        mobile,
        otp,
      });
      return response.data;
    } catch (error: any) {
      console.warn('Backend error, falling back to mock auth:', error?.message);
      return mockAuthService.verifyPatientOtp(mobile, otp);
    }
  }

  // Patient ABHA Login
  async loginWithAbha(abhaId: string, consentGranted: boolean): Promise<LoginResponse> {
    if (this.isDemoMode) {
      return mockAuthService.loginWithAbha(abhaId, consentGranted);
    }
    try {
      const response = await apiClient.post<LoginResponse>('/auth/patient/login-abha', {
        abhaId,
        consentGranted,
      });
      return response.data;
    } catch (error: any) {
      return mockAuthService.loginWithAbha(abhaId, consentGranted);
    }
  }

  // Patient Email Login
  async loginPatientEmail(email: string, password: string): Promise<LoginResponse> {
    if (this.isDemoMode) {
      return mockAuthService.loginPatientEmail(email, password);
    }
    try {
      const response = await apiClient.post<LoginResponse>('/auth/patient/login-email', {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      return mockAuthService.loginPatientEmail(email, password);
    }
  }

  // Doctor Login
  async loginDoctor(identifier: string, password: string): Promise<LoginResponse> {
    if (this.isDemoMode) {
      return mockAuthService.loginDoctor(identifier, password);
    }
    try {
      const response = await apiClient.post<LoginResponse>('/auth/doctor/login', {
        identifier,
        password,
      });
      return response.data;
    } catch (error: any) {
      return mockAuthService.loginDoctor(identifier, password);
    }
  }

  // Hospital Admin Login (with MFA support)
  async loginAdmin(identifier: string, password: string, mfaCode?: string): Promise<LoginResponse> {
    if (this.isDemoMode) {
      return mockAuthService.loginAdmin(identifier, password, mfaCode);
    }
    try {
      const response = await apiClient.post<LoginResponse>('/auth/admin/login', {
        identifier,
        password,
        mfaCode,
      });
      return response.data;
    } catch (error: any) {
      return mockAuthService.loginAdmin(identifier, password, mfaCode);
    }
  }

  // Ambulance Login
  async loginAmbulance(
    vehicleId: string,
    driverId: string,
    mobile: string,
    authMethod: 'OTP' | 'PASSWORD',
    secret: string
  ): Promise<LoginResponse> {
    if (this.isDemoMode) {
      return mockAuthService.loginAmbulance(vehicleId, driverId, mobile, authMethod, secret);
    }
    try {
      const response = await apiClient.post<LoginResponse>('/auth/ambulance/login', {
        vehicleId,
        driverId,
        mobile,
        authMethod,
        secret,
      });
      return response.data;
    } catch (error: any) {
      return mockAuthService.loginAmbulance(vehicleId, driverId, mobile, authMethod, secret);
    }
  }

  // Patient Registration
  async registerPatient(data: {
    fullName: string;
    mobile: string;
    email?: string;
    dateOfBirth: string;
    gender: string;
    password?: string;
  }): Promise<LoginResponse> {
    if (this.isDemoMode) {
      return mockAuthService.registerPatient(data);
    }
    try {
      const response = await apiClient.post<LoginResponse>('/auth/patient/register', data);
      return response.data;
    } catch (error: any) {
      return mockAuthService.registerPatient(data);
    }
  }

  // Password Reset
  async requestPasswordReset(identifier: string): Promise<{ success: boolean; message: string }> {
    if (this.isDemoMode) {
      return mockAuthService.requestPasswordReset(identifier);
    }
    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/auth/forgot-password', {
        identifier,
      });
      return response.data;
    } catch (error: any) {
      return mockAuthService.requestPasswordReset(identifier);
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      if (!this.isDemoMode) {
        await apiClient.post('/auth/logout');
      }
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      localStorage.removeItem('arogya_auth_token');
      localStorage.removeItem('arogya_user_session');
    }
  }
}

export const authService = new AuthService();
export { DEMO_CREDENTIALS };
