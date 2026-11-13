import { UserSession, LoginResponse, OtpResponse, AuthRole } from '../types/auth.types';

// Demo users database
export const DEMO_CREDENTIALS = {
  patient: {
    name: 'Ramesh Sharma',
    mobile: '9812345678',
    email: 'ramesh.sharma@healthmail.in',
    abhaId: '14-5544-7788-9922',
    password: 'Password@123',
    role: 'PATIENT' as AuthRole,
    portal: 'patient' as const,
    description: 'General Patient with OPD Token and ABHA record',
  },
  doctor: {
    name: 'Dr. Vikram Malhotra',
    doctorId: 'DOC-ORTHO-1001',
    email: 'dr.malhotra@arogyagati.gov.in',
    mobile: '9822334455',
    password: 'Doctor@2026',
    department: 'Orthopedics',
    designation: 'Senior Consultant & HOD',
    role: 'DOCTOR' as AuthRole,
    portal: 'doctor' as const,
    description: 'Senior Orthopedic Surgeon & OPD Queue Head',
  },
  admin: {
    name: 'Rajesh Verma',
    adminId: 'ADMIN-ND-01',
    email: 'admin.rajesh@arogyagati.gov.in',
    mobile: '9810010010',
    password: 'Admin@Secure99',
    mfaCode: '827104',
    department: 'Hospital Administration & Bed Management',
    designation: 'Chief Medical Superintendent',
    role: 'ADMIN' as AuthRole,
    portal: 'admin' as const,
    description: 'Executive Super Admin with 256-bit MFA clearance',
  },
  ambulance: {
    name: 'Suresh Yadav & Team',
    vehicleId: 'AMB-UP80-108',
    driverId: 'PARAMED-4091',
    mobile: '9911223344',
    password: 'Ambulance@108',
    department: 'Emergency & Trauma Services',
    designation: 'Lead Paramedic & Emergency Dispatcher',
    role: 'AMBULANCE_DRIVER' as AuthRole,
    portal: 'ambulance' as const,
    description: 'ALS Unit 108 Emergency Response Team',
  },
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class MockAuthService {
  private activeOtps: Map<string, { code: string; expires: number }> = new Map();

  // Send OTP
  async sendOtp(identifier: string, portal: string): Promise<OtpResponse> {
    await delay(500);
    const demoCode = '123456';
    const expires = Date.now() + 5 * 60 * 1000;
    this.activeOtps.set(identifier, { code: demoCode, expires });

    return {
      success: true,
      message: `OTP sent successfully to ${identifier}. (Demo code: 123456)`,
      otpId: `otp_${Date.now()}`,
      demoCode,
      expiresInSeconds: 60,
    };
  }

  // Verify Mobile OTP for Patient
  async verifyPatientOtp(mobile: string, otp: string): Promise<LoginResponse> {
    await delay(500);
    if (otp !== '123456') {
      return { success: false, message: 'Invalid OTP code. Please use demo code 123456.' };
    }

    const demo = DEMO_CREDENTIALS.patient;
    const user: UserSession = {
      id: 'USR-PAT-9812',
      name: mobile === demo.mobile ? demo.name : 'Verified Citizen',
      mobile,
      email: demo.email,
      abhaId: demo.abhaId,
      role: 'PATIENT',
      portal: 'patient',
      token: `mock_jwt_patient_${Date.now()}`,
      refreshToken: `mock_refresh_patient_${Date.now()}`,
      lastLogin: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Mobile authentication verified successfully.',
      user,
      token: user.token,
    };
  }

  // ABHA Authentication
  async loginWithAbha(abhaId: string, consentGranted: boolean): Promise<LoginResponse> {
    await delay(600);
    if (!consentGranted) {
      return { success: false, message: 'Consent is required to authenticate via ABHA.' };
    }

    const cleanAbha = abhaId.trim();
    if (cleanAbha.length < 5) {
      return { success: false, message: 'Invalid ABHA Number or Address format.' };
    }

    const user: UserSession = {
      id: 'USR-ABHA-7788',
      name: 'Ramesh Sharma (ABHA Verified)',
      mobile: '9812345678',
      email: 'ramesh.sharma@healthmail.in',
      abhaId: cleanAbha,
      role: 'PATIENT',
      portal: 'patient',
      token: `mock_jwt_abha_${Date.now()}`,
      lastLogin: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Ayushman Bharat Digital Health Account verified.',
      user,
      token: user.token,
    };
  }

  // Email / Password Login (Patient or other)
  async loginPatientEmail(email: string, password: string): Promise<LoginResponse> {
    await delay(500);
    const demo = DEMO_CREDENTIALS.patient;
    
    // Accept demo email or standard test password
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    const user: UserSession = {
      id: 'USR-PAT-EMAIL-01',
      name: email.toLowerCase() === demo.email.toLowerCase() ? demo.name : 'Patient User',
      mobile: demo.mobile,
      email,
      abhaId: demo.abhaId,
      role: 'PATIENT',
      portal: 'patient',
      token: `mock_jwt_patient_email_${Date.now()}`,
      lastLogin: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Patient login successful.',
      user,
      token: user.token,
    };
  }

  // Doctor & Medical Staff Login
  async loginDoctor(identifier: string, password: string): Promise<LoginResponse> {
    await delay(550);
    const demo = DEMO_CREDENTIALS.doctor;

    // Check credentials loosely in demo mode or match exact demo credentials
    if (password !== demo.password && password !== 'password' && password !== '123456') {
      return {
        success: false,
        message: 'Invalid credentials. Hint: use password "Doctor@2026" or click demo fill.',
      };
    }

    const user: UserSession = {
      id: 'DOC-ORTHO-1001',
      name: demo.name,
      email: demo.email,
      mobile: demo.mobile,
      doctorId: demo.doctorId,
      department: demo.department,
      designation: demo.designation,
      role: 'DOCTOR',
      portal: 'doctor',
      token: `mock_jwt_doc_${Date.now()}`,
      lastLogin: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Doctor authenticated to Clinical Desk.',
      user,
      token: user.token,
    };
  }

  // Hospital Admin Login (with MFA)
  async loginAdmin(identifier: string, password: string, mfaCode?: string): Promise<LoginResponse> {
    await delay(600);
    const demo = DEMO_CREDENTIALS.admin;

    if (password !== demo.password && password !== 'password' && password !== '123456') {
      return {
        success: false,
        message: 'Invalid administrative credentials. Use "Admin@Secure99" or demo fill.',
      };
    }

    // Check MFA code
    if (!mfaCode) {
      return {
        success: true,
        requiresMfa: true,
        message: 'Primary credentials verified. Please enter 6-digit MFA Security Token.',
        tempToken: `temp_mfa_admin_${Date.now()}`,
      };
    }

    if (mfaCode !== demo.mfaCode && mfaCode !== '123456') {
      return {
        success: false,
        message: `Invalid MFA token. Enter demo MFA code ${demo.mfaCode} or 123456.`,
      };
    }

    const user: UserSession = {
      id: 'ADMIN-01-ROOT',
      name: demo.name,
      email: demo.email,
      mobile: demo.mobile,
      staffId: demo.adminId,
      department: demo.department,
      designation: demo.designation,
      role: 'ADMIN',
      portal: 'admin',
      mfaVerified: true,
      token: `mock_jwt_admin_${Date.now()}`,
      lastLogin: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Security clearance verified. Welcome to Hospital Admin Portal.',
      user,
      token: user.token,
    };
  }

  // Ambulance / Emergency Response Login
  async loginAmbulance(
    vehicleId: string,
    driverId: string,
    mobile: string,
    authMethod: 'OTP' | 'PASSWORD',
    secret: string
  ): Promise<LoginResponse> {
    await delay(500);

    if (authMethod === 'OTP' && secret !== '123456') {
      return { success: false, message: 'Invalid Emergency Verification Code. Use demo code 123456.' };
    }

    const demo = DEMO_CREDENTIALS.ambulance;
    const user: UserSession = {
      id: 'AMB-VEH-108',
      name: demo.name,
      mobile,
      vehicleId: vehicleId.toUpperCase(),
      staffId: driverId.toUpperCase(),
      department: demo.department,
      designation: demo.designation,
      role: 'AMBULANCE_DRIVER',
      portal: 'ambulance',
      token: `mock_jwt_ambulance_${Date.now()}`,
      lastLogin: new Date().toISOString(),
    };

    return {
      success: true,
      message: `Ambulance unit ${vehicleId} logged in to Emergency Dispatch System.`,
      user,
      token: user.token,
    };
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
    await delay(700);

    const generatedAbha = `14-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const user: UserSession = {
      id: `USR-PAT-${Date.now().toString().slice(-4)}`,
      name: data.fullName,
      mobile: data.mobile,
      email: data.email || 'patient@healthmail.in',
      abhaId: generatedAbha,
      role: 'PATIENT',
      portal: 'patient',
      token: `mock_jwt_registered_${Date.now()}`,
      lastLogin: new Date().toISOString(),
    };

    return {
      success: true,
      message: `Account created successfully with ABHA ID: ${generatedAbha}`,
      user,
      token: user.token,
    };
  }

  // Request Password Reset
  async requestPasswordReset(identifier: string): Promise<{ success: boolean; message: string }> {
    await delay(500);
    return {
      success: true,
      message: `Password reset instructions have been sent to ${identifier}. Please check your messages.`,
    };
  }
}

export const mockAuthService = new MockAuthService();
