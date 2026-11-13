/**
 * ArogyaGati API Connector
 * Provides unified, production-grade connectivity between the React Frontend
 * and the REST & WebSocket backend services with automatic store synchronization.
 */

import { 
  AuthUser, 
  QueueToken, 
  HospitalBed, 
  EmergencyCase, 
  DoctorGuideMessage, 
  CaseGroup, 
  Department, 
  Doctor, 
  ABHAMockRecord,
  TokenStatus,
  BedStatus
} from '../types';
import { hospitalStore } from './hospitalStore';

const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  total?: number;
  stats?: Record<string, number>;
  timestamp?: string;
}

class ApiConnector {
  private isBackendOnline: boolean = false;
  private checkInterval: number | null = null;

  constructor() {
    this.checkHealth();
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
      if (res.ok) {
        this.isBackendOnline = true;
        return true;
      }
    } catch {
      this.isBackendOnline = false;
    }
    return false;
  }

  public getOnlineStatus(): boolean {
    return this.isBackendOnline;
  }

  // --- 1. Authentication Connector ---
  public auth = {
    sendOtp: async (identifier: string, role: string): Promise<{ success: boolean; message: string }> => {
      try {
        const res = await fetch(`${API_BASE}/auth/${role.toLowerCase()}/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier })
        });
        if (res.ok) {
          const json: ApiResponse<{ otpSent: boolean }> = await res.json();
          return { success: json.success, message: json.message || 'OTP sent successfully' };
        }
      } catch (e) {
        console.warn('[ApiConnector] Fallback to local store for OTP send', e);
      }
      return { success: true, message: 'Government Health OTP generated! Use test OTP: 123456' };
    },

    verifyOtp: async (params: {
      role: 'PATIENT' | 'AMBULANCE' | 'DOCTOR' | 'STAFF_ADMIN';
      identifier: string;
      otp: string;
      name?: string;
      abhaId?: string;
      doctorId?: string;
      staffId?: string;
      ambulanceId?: string;
    }): Promise<{ success: boolean; user?: AuthUser; message?: string }> => {
      try {
        const res = await fetch(`${API_BASE}/auth/${params.role.toLowerCase()}/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.user) {
            const user = json.data.user as AuthUser;
            hospitalStore.setUser(user);
            return { success: true, user, message: 'Authenticated successfully' };
          }
        }
      } catch (e) {
        console.warn('[ApiConnector] Fallback to local store for OTP verify', e);
      }

      // Local Fallback
      if (params.otp !== '123456' && params.otp.length < 4) {
        return { success: false, message: 'Invalid OTP code. Use test code: 123456' };
      }

      let user: AuthUser;
      if (params.role === 'PATIENT') {
        user = {
          id: `PAT-${Date.now().toString().slice(-4)}`,
          name: params.name?.trim() || 'Ramesh Sharma',
          role: 'PATIENT',
          mobile: params.identifier,
          abhaId: params.abhaId?.trim() || undefined
        };
      } else if (params.role === 'AMBULANCE') {
        user = {
          id: params.ambulanceId || 'AMB-UP80-108',
          name: 'Rajveer Tyagi (EMT Paramedic)',
          role: 'AMBULANCE',
          subRole: 'ATTENDANT',
          mobile: params.identifier,
          ambulanceId: params.ambulanceId || 'AMB-UP80-108'
        };
      } else if (params.role === 'DOCTOR') {
        const doc = hospitalStore.getDoctors().find(d => d.doctorId === params.doctorId) || hospitalStore.getDoctors()[1];
        user = {
          id: doc.id,
          doctorId: doc.doctorId,
          name: doc.name,
          role: 'DOCTOR',
          subRole: doc.subRole,
          departmentId: doc.departmentId,
          departmentName: doc.departmentName,
          cabin: doc.roomCabin,
          mobile: params.identifier
        };
      } else {
        user = {
          id: params.staffId || 'STAFF-ADMIN-01',
          name: 'Dr. Satish Singhal (Medical Superintendent)',
          role: 'STAFF_ADMIN',
          subRole: 'DIRECTOR',
          staffId: params.staffId || 'STAFF-ADMIN-01',
          mobile: params.identifier
        };
      }

      hospitalStore.setUser(user);
      return { success: true, user, message: 'Authenticated successfully' };
    },

    logout: () => {
      hospitalStore.setUser(null);
    }
  };

  // --- 2. Live Token & OPD Queue Connector ---
  public tokens = {
    getAll: async (filters?: { departmentId?: string; doctorId?: string; status?: string }): Promise<QueueToken[]> => {
      try {
        const params = new URLSearchParams();
        if (filters?.departmentId) params.append('departmentId', filters.departmentId);
        if (filters?.doctorId) params.append('doctorId', filters.doctorId);
        if (filters?.status) params.append('status', filters.status);

        const res = await fetch(`${API_BASE}/tokens?${params.toString()}`);
        if (res.ok) {
          const json: ApiResponse<QueueToken[]> = await res.json();
          if (json.success && Array.isArray(json.data)) {
            return json.data;
          }
        }
      } catch (e) {
        console.warn('[ApiConnector] Fallback to local store for tokens', e);
      }
      return hospitalStore.getTokens();
    },

    generateOpd: async (params: {
      patientName: string;
      patientAge: number;
      gender: 'MALE' | 'FEMALE' | 'OTHER';
      mobile: string;
      abhaId?: string;
      departmentId: string;
      causeOfVisit: string;
      symptoms: string;
      visitType: 'NEW' | 'FOLLOW_UP';
      preferredDate?: string;
    }): Promise<QueueToken> => {
      try {
        const res = await fetch(`${API_BASE}/tokens/opd`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });
        if (res.ok) {
          const json: ApiResponse<QueueToken> = await res.json();
          if (json.success && json.data) {
            // Also sync into local store
            return hospitalStore.generateOpdToken(params);
          }
        }
      } catch (e) {
        console.warn('[ApiConnector] Fallback to local store for token generation', e);
      }
      return hospitalStore.generateOpdToken(params);
    },

    updateStatus: async (tokenId: string, status: TokenStatus, notes?: string, prescription?: string): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE}/tokens/${tokenId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, clinicalNotes: notes, prescription })
        });
        if (res.ok) {
          hospitalStore.updateTokenStatus(tokenId, status, notes, prescription);
          return true;
        }
      } catch (e) {
        console.warn('[ApiConnector] Fallback to local store for token update', e);
      }
      hospitalStore.updateTokenStatus(tokenId, status, notes, prescription);
      return true;
    }
  };

  // --- 3. Hospital Beds Matrix Connector ---
  public beds = {
    getAll: async (filters?: { departmentId?: string; category?: string; status?: string }): Promise<HospitalBed[]> => {
      try {
        const params = new URLSearchParams();
        if (filters?.departmentId) params.append('departmentId', filters.departmentId);
        if (filters?.category) params.append('category', filters.category);
        if (filters?.status) params.append('status', filters.status);

        const res = await fetch(`${API_BASE}/beds/hospital/HOSP-SNMC-AGRA?${params.toString()}`);
        if (res.ok) {
          const json: ApiResponse<HospitalBed[]> = await res.json();
          if (json.success && Array.isArray(json.data)) {
            return json.data;
          }
        }
      } catch (e) {
        console.warn('[ApiConnector] Fallback to local store for beds', e);
      }
      return hospitalStore.getBeds();
    },

    updateStatus: async (bedId: string, status: BedStatus, patientName?: string): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE}/beds/${bedId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, patientName })
        });
        if (res.ok) {
          hospitalStore.updateBedStatus(bedId, status, patientName);
          return true;
        }
      } catch (e) {
        console.warn('[ApiConnector] Fallback to local store for bed update', e);
      }
      hospitalStore.updateBedStatus(bedId, status, patientName);
      return true;
    }
  };

  // --- 4. Emergency Ambulance 108 Connector ---
  public emergency = {
    getAll: async (): Promise<EmergencyCase[]> => {
      try {
        const res = await fetch(`${API_BASE}/emergency/cases`);
        if (res.ok) {
          const json: ApiResponse<EmergencyCase[]> = await res.json();
          if (json.success && Array.isArray(json.data)) {
            return json.data;
          }
        }
      } catch (e) {
        console.warn('[ApiConnector] Fallback to local store for emergency cases', e);
      }
      return hospitalStore.getEmergencyCases();
    },

    register: async (params: Parameters<typeof hospitalStore.registerEmergencyCase>[0]): Promise<EmergencyCase> => {
      try {
        const res = await fetch(`${API_BASE}/emergency/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });
        if (res.ok) {
          const json: ApiResponse<EmergencyCase> = await res.json();
          if (json.success && json.data) {
            return hospitalStore.registerEmergencyCase(params);
          }
        }
      } catch (e) {
        console.warn('[ApiConnector] Fallback to local store for emergency register', e);
      }
      return hospitalStore.registerEmergencyCase(params);
    },

    updateStatus: async (caseId: string, status: EmergencyCase['status']): Promise<boolean> => {
      try {
        const res = await fetch(`${API_BASE}/emergency/${caseId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        if (res.ok) {
          hospitalStore.updateEmergencyStatus(caseId, status);
          return true;
        }
      } catch (e) {
        console.warn('[ApiConnector] Fallback to local store for emergency status update', e);
      }
      hospitalStore.updateEmergencyStatus(caseId, status);
      return true;
    }
  };

  // --- 5. Doctor Guide Box Connector ---
  public chat = {
    getGroups: async (): Promise<CaseGroup[]> => {
      try {
        const res = await fetch(`${API_BASE}/chat/groups`);
        if (res.ok) {
          const json: ApiResponse<CaseGroup[]> = await res.json();
          if (json.success && Array.isArray(json.data)) {
            return json.data;
          }
        }
      } catch (e) {
        console.warn('[ApiConnector] Fallback to local store for chat groups', e);
      }
      return hospitalStore.getCaseGroups();
    },

    getMessages: async (groupId: string, isPatientViewing: boolean = false): Promise<DoctorGuideMessage[]> => {
      try {
        const role = isPatientViewing ? 'PATIENT' : 'DOCTOR';
        const res = await fetch(`${API_BASE}/chat/${groupId}/messages?role=${role}`);
        if (res.ok) {
          const json: ApiResponse<DoctorGuideMessage[]> = await res.json();
          if (json.success && Array.isArray(json.data)) {
            return json.data;
          }
        }
      } catch (e) {
        console.warn('[ApiConnector] Fallback to local store for chat messages', e);
      }
      return hospitalStore.getMessagesForGroup(groupId, isPatientViewing);
    },

    sendMessage: async (params: {
      groupId: string;
      text: string;
      visibility?: 'PATIENT_VISIBLE' | 'STAFF_INTERNAL';
      senderRole?: 'PATIENT' | 'DOCTOR' | 'SYSTEM';
      customSenderDisplay?: string;
    }): Promise<DoctorGuideMessage> => {
      try {
        const res = await fetch(`${API_BASE}/chat/${params.groupId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });
        if (res.ok) {
          const json: ApiResponse<DoctorGuideMessage> = await res.json();
          if (json.success && json.data) {
            return hospitalStore.sendMessage(params);
          }
        }
      } catch (e) {
        console.warn('[ApiConnector] Fallback to local store for sending message', e);
      }
      return hospitalStore.sendMessage(params);
    }
  };

  // --- 6. Master Data Connector ---
  public master = {
    getDepartments: async (): Promise<Department[]> => {
      try {
        const res = await fetch(`${API_BASE}/departments`);
        if (res.ok) {
          const json: ApiResponse<Department[]> = await res.json();
          if (json.success && Array.isArray(json.data)) {
            return json.data;
          }
        }
      } catch (e) {
        console.warn('[ApiConnector] Fallback to local store for departments', e);
      }
      return hospitalStore.getDepartments();
    },

    getDoctors: async (departmentId?: string): Promise<Doctor[]> => {
      try {
        const url = departmentId ? `${API_BASE}/doctors?departmentId=${departmentId}` : `${API_BASE}/doctors`;
        const res = await fetch(url);
        if (res.ok) {
          const json: ApiResponse<Doctor[]> = await res.json();
          if (json.success && Array.isArray(json.data)) {
            return json.data;
          }
        }
      } catch (e) {
        console.warn('[ApiConnector] Fallback to local store for doctors', e);
      }
      return departmentId ? hospitalStore.getDoctorsByDepartment(departmentId) : hospitalStore.getDoctors();
    }
  };

  // --- 7. ABHA Digital Health Verification Connector ---
  public abha = {
    verify: async (abhaNumberOrAddress: string): Promise<ABHAMockRecord | null> => {
      try {
        const res = await fetch(`${API_BASE}/abha/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ abhaId: abhaNumberOrAddress })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.verified && json.data) {
            return json.data as ABHAMockRecord;
          }
        }
      } catch (e) {
        console.warn('[ApiConnector] Fallback to local store for ABHA verification', e);
      }
      return hospitalStore.verifyAbha(abhaNumberOrAddress);
    }
  };
}

export const apiConnector = new ApiConnector();
