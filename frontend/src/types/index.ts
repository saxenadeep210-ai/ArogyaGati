export type UserRole = 'PATIENT' | 'AMBULANCE' | 'DOCTOR' | 'STAFF_ADMIN';

export type SubRole = 
  | 'DIRECTOR'
  | 'HOD'
  | 'SENIOR_PROFESSOR'
  | 'ASSOCIATE_PROFESSOR'
  | 'ASSISTANT_PROFESSOR'
  | 'JUNIOR_RESIDENT_3'
  | 'JUNIOR_RESIDENT_2'
  | 'JUNIOR_RESIDENT_1'
  | 'NURSE'
  | 'REGISTRATION_STAFF'
  | 'RESOURCE_MANAGER'
  | 'ATTENDANT';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  subRole?: SubRole;
  mobile: string;
  email?: string;
  abhaId?: string;
  doctorId?: string;
  ambulanceId?: string;
  staffId?: string;
  departmentId?: string;
  departmentName?: string;
  cabin?: string;
  token?: string;
}

export type DoctorSetCode = 'SET_A' | 'SET_B' | 'SET_C' | 'SUNDAY_SPECIAL';

export interface Doctor {
  id: string;
  doctorId: string; // e.g. DOC-ORTHO-1042
  name: string;
  designation: string;
  subRole: SubRole;
  departmentId: string;
  departmentName: string;
  qualification: string;
  specialization: string;
  yearsOfExperience: number;
  opdDays: string[]; // e.g. ['Monday', 'Thursday']
  doctorSet: DoctorSetCode;
  building: string;
  floor: number;
  roomCabin: string;
  status: 'AVAILABLE' | 'IN_CONSULTATION' | 'ON_ROUND' | 'OFF_DUTY';
  maxDailyPatients: number;
  avgConsultationMinutes: number;
  isAdministrativeOnly?: boolean;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  hindiName: string;
  hodDoctorId: string;
  hodName: string;
  building: string;
  floor: number;
  description: string;
  iconName: string;
  totalDoctors: number;
  activeQueueCount: number;
}

export interface DoctorScheduleSet {
  id: string;
  code: DoctorSetCode;
  name: string;
  departmentId: string;
  daysOfWeek: number[]; // 1 = Monday, 7 = Sunday
  dayNames: string[];
  shiftTiming: string;
  doctorIds: string[];
}

export type TokenPriority = 'NORMAL' | 'URGENT' | 'EMERGENCY';
export type TokenStatus = 
  | 'REGISTERED'
  | 'WAITING'
  | 'CALLED'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface QueueToken {
  id: string;
  tokenNumber: string; // e.g. OPD-ORTHO-042 or EMG-RED-008
  patientId: string;
  patientName: string;
  patientAge: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  mobile: string;
  abhaId?: string;
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  doctorDesignation: string;
  building: string;
  floor: number;
  roomCabin: string;
  scheduledDate: string; // YYYY-MM-DD
  appointmentTime: string;
  registrationTime: string;
  priority: TokenPriority;
  status: TokenStatus;
  queuePosition: number;
  estimatedWaitMinutes: number;
  causeOfVisit: string;
  symptoms: string;
  visitType: 'NEW' | 'FOLLOW_UP';
  caseGroupId: string;
  clinicalNotes?: string;
  prescription?: string;
  calledAt?: string;
  completedAt?: string;
  photoDataUrl?: string;
  biometricMatched?: boolean;
}

export type EmergencyCategory = 
  | 'TRAUMA'
  | 'CARDIAC'
  | 'STROKE'
  | 'RESPIRATORY'
  | 'MATERNAL'
  | 'BURN'
  | 'OTHER';

export type EmergencyStatus = 
  | 'DISPATCHED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'TRIAGED'
  | 'ADMITTED';

export interface EmergencyCase {
  id: string;
  emergencyToken: string;
  ambulanceId: string;
  ambulanceRegNo: string;
  attendantId: string;
  attendantName: string;
  patientName: string;
  patientAge: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  abhaId?: string;
  category: EmergencyCategory;
  severity: 'CRITICAL' | 'SERIOUS' | 'STABLE';
  description: string;
  incidentLocation: string;
  incidentTime: string;
  pickupTime: string;
  destinationHospital: string;
  etaMinutes: number;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  receivingDepartment: string;
  status: EmergencyStatus;
  vitals: {
    bloodPressure?: string;
    pulseRate?: number;
    spO2?: number;
    consciousness?: string;
  };
  reservedBedId?: string;
  createdTime: string;
  photoDataUrl?: string;
  biometricStatus?: 'NOT_SCANNED' | 'CONNECTING' | 'SCANNING' | 'MATCHED' | 'FAILED';
  biometricMatchDetails?: {
    matchedAadhaarOrAbha?: string;
    sourceDevice?: string;
    matchedName?: string;
    matchedAge?: number;
    matchedGender?: 'MALE' | 'FEMALE' | 'OTHER';
    matchedBloodGroup?: string;
    emergencyContact?: string;
  };
}

export type BedCategory = 
  | 'GENERAL'
  | 'ORTHOPAEDIC'
  | 'ICU'
  | 'EMERGENCY'
  | 'PRIVATE'
  | 'ISOLATION'
  | 'PAEDIATRIC';

export type BedStatus = 
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'RESERVED'
  | 'MAINTENANCE'
  | 'CLEANING';

export interface HospitalBed {
  id: string;
  bedNumber: string;
  hospitalId: string;
  hospitalName: string;
  building: string;
  floor: number;
  wardName: string;
  departmentId: string;
  bedCategory: BedCategory;
  status: BedStatus;
  patientName?: string;
  patientToken?: string;
  admissionDate?: string;
  lastUpdated: string;
}

export type MessageVisibility = 'PATIENT_VISIBLE' | 'STAFF_INTERNAL';

export interface DoctorGuideMessage {
  id: string;
  groupId: string;
  patientId: string;
  senderId: string;
  senderRole: 'PATIENT' | 'DOCTOR' | 'SYSTEM';
  senderDisplay: string; // e.g. "DOC-ORTHO-1042 — Assoc. Professor" or "Patient Ramesh Sharma"
  text: string;
  timestamp: string;
  visibility: MessageVisibility;
  isDoctor: boolean;
}

export interface CaseGroup {
  id: string;
  tokenNumber: string;
  patientId: string;
  patientName: string;
  departmentId: string;
  departmentName: string;
  assignedDoctorIds: string[];
  seniorDoctorId: string;
  seniorDoctorName: string;
  createdAt: string;
  lastMessageText: string;
  lastMessageTime: string;
  unreadForPatient: number;
  unreadForStaff: number;
}

export interface NavigationNode {
  id: string;
  name: string;
  category: 'ENTRANCE' | 'OPD' | 'EMERGENCY' | 'ICU' | 'WARD' | 'DIAGNOSTIC' | 'PHARMACY' | 'ELEVATOR' | 'REGISTRATION';
  building: string;
  floor: number;
  roomNumber?: string;
  x: number; // percentage coordinate 0..100
  y: number; // percentage coordinate 0..100
  description: string;
}

export interface NavigationEdge {
  fromNodeId: string;
  toNodeId: string;
  distanceMeters: number;
  instructions: string;
}

export interface ABHAMockRecord {
  abhaNumber: string; // e.g. 14-8832-9012-4411
  abhaAddress: string; // e.g. ramesh.sharma@abdm
  name: string;
  gender: string;
  dob: string;
  mobile: string;
  address: string;
  verified: boolean;
  fhirRecordsCount: number;
}
