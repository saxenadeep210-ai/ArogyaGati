import { 
  AuthUser, 
  Department, 
  Doctor, 
  HospitalBed, 
  QueueToken, 
  EmergencyCase, 
  CaseGroup, 
  DoctorGuideMessage, 
  BedStatus,
  TokenStatus,
  DoctorSetCode
} from '../types';

import { 
  INITIAL_DEPARTMENTS, 
  INITIAL_DOCTORS, 
  SCHEDULE_SETS, 
  INITIAL_BEDS, 
  INITIAL_QUEUE_TOKENS, 
  INITIAL_EMERGENCY_CASES, 
  INITIAL_CASE_GROUPS, 
  INITIAL_GUIDE_MESSAGES,
  MOCK_ABHA_RECORDS
} from './mockData';

// Storage keys
const STORAGE_PREFIX = 'arogyagati_';
const KEY_USER = `${STORAGE_PREFIX}auth_user`;
const KEY_TOKENS = `${STORAGE_PREFIX}tokens`;
const KEY_BEDS = `${STORAGE_PREFIX}beds`;
const KEY_EMERGENCY = `${STORAGE_PREFIX}emergency`;
const KEY_CASE_GROUPS = `${STORAGE_PREFIX}case_groups`;
const KEY_MESSAGES = `${STORAGE_PREFIX}messages`;

// Play audio chime for hospital announcements using Web Audio API
export const playHospitalChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      
      gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Standard hospital dual chime (F#5 -> C#5 -> A#5)
    playTone(740, 0, 0.4);
    playTone(554.37, 0.35, 0.4);
    playTone(932.33, 0.7, 0.6);
  } catch {
    // Ignore audio context errors if sound is restricted
  }
};

class HospitalStore {
  private user: AuthUser | null = null;
  private departments: Department[] = INITIAL_DEPARTMENTS;
  private doctors: Doctor[] = INITIAL_DOCTORS;
  private tokens: QueueToken[] = [];
  private beds: HospitalBed[] = [];
  private emergencyCases: EmergencyCase[] = [];
  private caseGroups: CaseGroup[] = [];
  private messages: DoctorGuideMessage[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const savedUser = localStorage.getItem(KEY_USER);
      if (savedUser) {
        this.user = JSON.parse(savedUser);
      } else {
        // Default to a patient session for immediate accessibility
        this.user = {
          id: 'PAT-1002',
          name: 'Ramesh Sharma',
          role: 'PATIENT',
          mobile: '9812345678',
          abhaId: '14-5544-7788-9922'
        };
      }

      const savedTokens = localStorage.getItem(KEY_TOKENS);
      this.tokens = savedTokens ? JSON.parse(savedTokens) : INITIAL_QUEUE_TOKENS;

      const savedBeds = localStorage.getItem(KEY_BEDS);
      this.beds = savedBeds ? JSON.parse(savedBeds) : INITIAL_BEDS;

      const savedEmergency = localStorage.getItem(KEY_EMERGENCY);
      this.emergencyCases = savedEmergency ? JSON.parse(savedEmergency) : INITIAL_EMERGENCY_CASES;

      const savedGroups = localStorage.getItem(KEY_CASE_GROUPS);
      this.caseGroups = savedGroups ? JSON.parse(savedGroups) : INITIAL_CASE_GROUPS;

      const savedMessages = localStorage.getItem(KEY_MESSAGES);
      this.messages = savedMessages ? JSON.parse(savedMessages) : INITIAL_GUIDE_MESSAGES;
    } catch {
      this.tokens = INITIAL_QUEUE_TOKENS;
      this.beds = INITIAL_BEDS;
      this.emergencyCases = INITIAL_EMERGENCY_CASES;
      this.caseGroups = INITIAL_CASE_GROUPS;
      this.messages = INITIAL_GUIDE_MESSAGES;
    }
  }

  private saveState() {
    try {
      if (this.user) {
        localStorage.setItem(KEY_USER, JSON.stringify(this.user));
      } else {
        localStorage.removeItem(KEY_USER);
      }
      localStorage.setItem(KEY_TOKENS, JSON.stringify(this.tokens));
      localStorage.setItem(KEY_BEDS, JSON.stringify(this.beds));
      localStorage.setItem(KEY_EMERGENCY, JSON.stringify(this.emergencyCases));
      localStorage.setItem(KEY_CASE_GROUPS, JSON.stringify(this.caseGroups));
      localStorage.setItem(KEY_MESSAGES, JSON.stringify(this.messages));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // --- Auth & Profile ---
  public getUser(): AuthUser | null {
    return this.user;
  }

  public setUser(user: AuthUser | null) {
    this.user = user;
    this.saveState();
  }

  public loginAsRole(roleType: 'PATIENT' | 'AMBULANCE' | 'DOCTOR' | 'STAFF_ADMIN', customDoctorId?: string) {
    if (roleType === 'PATIENT') {
      this.user = {
        id: 'PAT-1002',
        name: 'Ramesh Sharma',
        role: 'PATIENT',
        mobile: '9812345678',
        abhaId: '14-5544-7788-9922'
      };
    } else if (roleType === 'AMBULANCE') {
      this.user = {
        id: 'AMB-UP80-108',
        name: 'Rajveer Tyagi (EMT Paramedic)',
        role: 'AMBULANCE',
        subRole: 'ATTENDANT',
        mobile: '9911223344',
        ambulanceId: 'AMB-UP80-108'
      };
    } else if (roleType === 'DOCTOR') {
      const doc = this.doctors.find(d => d.doctorId === (customDoctorId || 'DOC-ORTHO-1001')) || this.doctors[1];
      this.user = {
        id: doc.id,
        doctorId: doc.doctorId,
        name: doc.name,
        role: 'DOCTOR',
        subRole: doc.subRole,
        departmentId: doc.departmentId,
        departmentName: doc.departmentName,
        cabin: doc.roomCabin,
        mobile: '9822334455'
      };
    } else {
      this.user = {
        id: 'STAFF-ADMIN-01',
        name: 'Dr. Satish Singhal (Medical Superintendent)',
        role: 'STAFF_ADMIN',
        subRole: 'DIRECTOR',
        staffId: 'STAFF-ADMIN-01',
        mobile: '9810010010'
      };
    }
    this.saveState();
  }

  // --- Department & Doctor queries ---
  public getDepartments(): Department[] {
    return this.departments;
  }

  public getDoctors(): Doctor[] {
    return this.doctors;
  }

  public getDoctorsByDepartment(deptId: string): Doctor[] {
    return this.doctors.filter(d => d.departmentId === deptId);
  }

  // Determine active doctor set for a specific date (Set A = Mon/Thu, Set B = Tue/Fri, Set C = Wed/Sat)
  public getScheduleForDate(departmentId: string, dateStr: string): { setCode: DoctorSetCode; doctors: Doctor[]; dayName: string } {
    const targetDate = new Date(dateStr);
    const dayOfWeek = targetDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNames[dayOfWeek];

    let setCode: DoctorSetCode = 'SET_A';
    if (dayOfWeek === 1 || dayOfWeek === 4) {
      setCode = 'SET_A'; // Monday & Thursday
    } else if (dayOfWeek === 2 || dayOfWeek === 5) {
      setCode = 'SET_B'; // Tuesday & Friday
    } else if (dayOfWeek === 3 || dayOfWeek === 6) {
      setCode = 'SET_C'; // Wednesday & Saturday
    } else {
      setCode = 'SUNDAY_SPECIAL';
    }

    const deptSet = SCHEDULE_SETS.find(s => s.departmentId === departmentId && s.code === setCode);
    let activeDocs = this.doctors.filter(d => d.departmentId === departmentId && (d.doctorSet === setCode || d.opdDays.includes(currentDayName)));

    if (activeDocs.length === 0) {
      // Fallback to department doctors if specific set has none
      activeDocs = this.doctors.filter(d => d.departmentId === departmentId && !d.isAdministrativeOnly);
    }

    return {
      setCode,
      doctors: activeDocs,
      dayName: currentDayName
    };
  }

  // --- Queue & Token operations ---
  public getTokens(): QueueToken[] {
    return this.tokens;
  }

  public getTokensByDepartment(departmentId: string): QueueToken[] {
    return this.tokens.filter(t => t.departmentId === departmentId);
  }

  public getTokensForDoctor(doctorId: string): QueueToken[] {
    return this.tokens.filter(t => t.doctorId === doctorId);
  }

  public getPatientTokens(patientMobileOrId: string): QueueToken[] {
    return this.tokens.filter(t => t.patientId === patientMobileOrId || t.mobile === patientMobileOrId);
  }

  public generateOpdToken(params: {
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
  }): QueueToken {
    const dept = this.departments.find(d => d.id === params.departmentId) || this.departments[0];
    const targetDate = params.preferredDate || new Date().toISOString().split('T')[0];

    // Determine scheduled doctor set and primary attending doctor
    const schedule = this.getScheduleForDate(dept.id, targetDate);
    const assignedDoctor = schedule.doctors.find(d => !d.isAdministrativeOnly) || this.doctors.find(d => d.departmentId === dept.id) || this.doctors[1];

    // Generate atomic departmental token sequence
    const existingDeptTokens = this.tokens.filter(t => t.departmentId === dept.id);
    const sequenceNum = existingDeptTokens.length + 42;
    const tokenNumber = `OPD-${dept.code}-${String(sequenceNum).padStart(3, '0')}`;

    // Queue position and dynamic wait estimation
    const waitingTokens = existingDeptTokens.filter(t => t.status === 'WAITING' || t.status === 'REGISTERED');
    const queuePos = waitingTokens.length + 1;
    const estWait = queuePos * (assignedDoctor.avgConsultationMinutes || 8);

    const caseGroupId = `CASE-GRP-${Date.now().toString().slice(-5)}`;

    const newToken: QueueToken = {
      id: `TOK-${Date.now()}`,
      tokenNumber,
      patientId: `PAT-${Date.now().toString().slice(-4)}`,
      patientName: params.patientName,
      patientAge: params.patientAge,
      gender: params.gender,
      mobile: params.mobile,
      abhaId: params.abhaId,
      departmentId: dept.id,
      departmentName: dept.name,
      doctorId: assignedDoctor.doctorId,
      doctorName: assignedDoctor.name,
      doctorDesignation: assignedDoctor.designation,
      building: dept.building,
      floor: dept.floor,
      roomCabin: assignedDoctor.roomCabin,
      scheduledDate: targetDate,
      appointmentTime: '10:15 AM',
      registrationTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      priority: 'NORMAL',
      status: 'WAITING',
      queuePosition: queuePos,
      estimatedWaitMinutes: estWait,
      causeOfVisit: params.causeOfVisit,
      symptoms: params.symptoms,
      visitType: params.visitType,
      caseGroupId
    };

    this.tokens = [newToken, ...this.tokens];

    // Create corresponding Doctor Guide Box Case Group
    const newCaseGroup: CaseGroup = {
      id: caseGroupId,
      tokenNumber,
      patientId: newToken.patientId,
      patientName: newToken.patientName,
      departmentId: dept.id,
      departmentName: dept.name,
      assignedDoctorIds: schedule.doctors.map(d => d.doctorId),
      seniorDoctorId: assignedDoctor.doctorId,
      seniorDoctorName: assignedDoctor.name,
      createdAt: new Date().toLocaleString(),
      lastMessageText: `Case Group initialized for Token ${tokenNumber}`,
      lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unreadForPatient: 1,
      unreadForStaff: 0
    };

    const initialSysMsg: DoctorGuideMessage = {
      id: `MSG-${Date.now()}`,
      groupId: caseGroupId,
      patientId: newToken.patientId,
      senderId: 'SYSTEM',
      senderRole: 'SYSTEM',
      senderDisplay: 'ArogyaGati Hospital System',
      text: `Dedicated case consultation channel established. Your attending doctor team is ${assignedDoctor.name} (${assignedDoctor.designation}) at ${dept.building}, ${assignedDoctor.roomCabin}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      visibility: 'PATIENT_VISIBLE',
      isDoctor: false
    };

    this.caseGroups = [newCaseGroup, ...this.caseGroups];
    this.messages = [...this.messages, initialSysMsg];

    this.saveState();
    return newToken;
  }

  public updateTokenStatus(tokenId: string, newStatus: TokenStatus, notes?: string, prescription?: string) {
    this.tokens = this.tokens.map(token => {
      if (token.id === tokenId || token.tokenNumber === tokenId) {
        const updated: QueueToken = {
          ...token,
          status: newStatus,
          clinicalNotes: notes !== undefined ? notes : token.clinicalNotes,
          prescription: prescription !== undefined ? prescription : token.prescription
        };
        if (newStatus === 'CALLED') {
          updated.calledAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          playHospitalChime();
        } else if (newStatus === 'COMPLETED') {
          updated.completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return updated;
      }
      return token;
    });

    // Recalculate queue positions
    this.recalculateQueuePositions();
    this.saveState();
  }

  private recalculateQueuePositions() {
    const deptTokens = new Map<string, QueueToken[]>();
    this.tokens.forEach(t => {
      const list = deptTokens.get(t.departmentId) || [];
      list.push(t);
      deptTokens.set(t.departmentId, list);
    });

    deptTokens.forEach(list => {
      let currentWaitPos = 1;
      list.forEach(t => {
        if (t.status === 'CALLED') {
          t.queuePosition = 1;
          t.estimatedWaitMinutes = 2;
        } else if (t.status === 'WAITING' || t.status === 'REGISTERED') {
          t.queuePosition = currentWaitPos++;
          t.estimatedWaitMinutes = t.queuePosition * 7;
        } else {
          t.queuePosition = 0;
          t.estimatedWaitMinutes = 0;
        }
      });
    });
  }

  // --- Emergency & Ambulance ---
  public getEmergencyCases(): EmergencyCase[] {
    return this.emergencyCases;
  }

  public registerEmergencyCase(params: {
    ambulanceId: string;
    ambulanceRegNo: string;
    attendantId: string;
    attendantName: string;
    patientName: string;
    patientAge: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    abhaId?: string;
    category: EmergencyCase['category'];
    severity: EmergencyCase['severity'];
    description: string;
    incidentLocation: string;
    etaMinutes: number;
    vitals: EmergencyCase['vitals'];
  }): EmergencyCase {
    const tokenSeq = this.emergencyCases.length + 10;
    const emergencyToken = `EMG-RED-${String(tokenSeq).padStart(3, '0')}`;

    // Select primary emergency trauma team
    const orthoHOD = this.doctors.find(d => d.doctorId === 'DOC-ORTHO-1001') || this.doctors[1];

    // Find and temporarily reserve a trauma bay bed if available
    const availableBed = this.beds.find(b => b.status === 'AVAILABLE' && (b.bedCategory === 'EMERGENCY' || b.bedCategory === 'ICU'));
    if (availableBed) {
      availableBed.status = 'RESERVED';
      availableBed.patientName = `Incoming ${params.patientName} (${params.ambulanceRegNo})`;
      availableBed.patientToken = emergencyToken;
    }

    const newCase: EmergencyCase = {
      id: `EMG-CASE-${Date.now()}`,
      emergencyToken,
      ambulanceId: params.ambulanceId,
      ambulanceRegNo: params.ambulanceRegNo,
      attendantId: params.attendantId,
      attendantName: params.attendantName,
      patientName: params.patientName,
      patientAge: params.patientAge,
      gender: params.gender,
      abhaId: params.abhaId,
      category: params.category,
      severity: params.severity,
      description: params.description,
      incidentLocation: params.incidentLocation,
      incidentTime: new Date(Date.now() - 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pickupTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      destinationHospital: 'S. N. Medical College Emergency Trauma Center',
      etaMinutes: params.etaMinutes,
      assignedDoctorId: orthoHOD.doctorId,
      assignedDoctorName: `${orthoHOD.name} (Emergency Trauma Incharge)`,
      receivingDepartment: 'Trauma & Emergency Services',
      status: 'EN_ROUTE',
      vitals: params.vitals,
      reservedBedId: availableBed?.id,
      createdTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Add priority emergency token to QueueTokens list so it appears in Doctor Desk & Admin monitor with high priority!
    const emergencyQueueToken: QueueToken = {
      id: `TOK-${Date.now()}`,
      tokenNumber: emergencyToken,
      patientId: `PAT-EMG-${Date.now().toString().slice(-4)}`,
      patientName: params.patientName,
      patientAge: params.patientAge,
      gender: params.gender,
      mobile: '108 (Paramedic Relay)',
      abhaId: params.abhaId,
      departmentId: 'DEP-ORTHO',
      departmentName: 'Emergency Trauma Center',
      doctorId: orthoHOD.doctorId,
      doctorName: orthoHOD.name,
      doctorDesignation: orthoHOD.designation,
      building: 'Emergency Trauma Centre',
      floor: 0,
      roomCabin: 'Red Trauma Resuscitation Bay',
      scheduledDate: new Date().toISOString().split('T')[0],
      appointmentTime: 'IMMEDIATE',
      registrationTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      priority: 'EMERGENCY',
      status: 'WAITING',
      queuePosition: 1, // Emergency jumps to front of queue
      estimatedWaitMinutes: 1,
      causeOfVisit: `EMERGENCY: ${params.category} - ${params.incidentLocation}`,
      symptoms: params.description,
      visitType: 'NEW',
      caseGroupId: `CASE-GRP-EMG-${Date.now().toString().slice(-4)}`
    };

    this.emergencyCases = [newCase, ...this.emergencyCases];
    this.tokens = [emergencyQueueToken, ...this.tokens];
    playHospitalChime();

    this.saveState();
    return newCase;
  }

  public updateEmergencyStatus(caseId: string, status: EmergencyCase['status']) {
    this.emergencyCases = this.emergencyCases.map(c => {
      if (c.id === caseId) {
        return { ...c, status };
      }
      return c;
    });
    this.saveState();
  }

  // --- Beds Management ---
  public getBeds(): HospitalBed[] {
    return this.beds;
  }

  public getBedsByDepartment(deptId: string): HospitalBed[] {
    return this.beds.filter(b => b.departmentId === deptId);
  }

  public updateBedStatus(bedId: string, newStatus: BedStatus, patientName?: string) {
    this.beds = this.beds.map(b => {
      if (b.id === bedId) {
        return {
          ...b,
          status: newStatus,
          patientName: newStatus === 'AVAILABLE' ? undefined : (patientName || b.patientName),
          lastUpdated: 'Just now'
        };
      }
      return b;
    });
    this.saveState();
  }

  // --- Doctor Guide Box (Messaging) ---
  public getCaseGroups(): CaseGroup[] {
    return this.caseGroups;
  }

  public getCaseGroup(groupId: string): CaseGroup | undefined {
    return this.caseGroups.find(g => g.id === groupId);
  }

  public getMessagesForGroup(groupId: string, isPatientViewing: boolean = false): DoctorGuideMessage[] {
    const list = this.messages.filter(m => m.groupId === groupId);
    if (isPatientViewing) {
      // CRITICAL PRIVACY & SECURITY REQUIREMENT:
      // Patients must NEVER see STAFF_INTERNAL clinical messages or doctor personal details!
      return list.filter(m => m.visibility === 'PATIENT_VISIBLE');
    }
    // Doctors and hospital staff can see both PATIENT_VISIBLE and STAFF_INTERNAL messages
    return list;
  }

  public sendMessage(params: {
    groupId: string;
    text: string;
    visibility?: 'PATIENT_VISIBLE' | 'STAFF_INTERNAL';
    senderRole?: 'PATIENT' | 'DOCTOR' | 'SYSTEM';
    customSenderDisplay?: string;
  }): DoctorGuideMessage {
    const group = this.caseGroups.find(g => g.id === params.groupId);
    const user = this.user;

    const isDoc = (params.senderRole || user?.role) === 'DOCTOR';
    const visibility = params.visibility || (isDoc ? 'PATIENT_VISIBLE' : 'PATIENT_VISIBLE');

    // MASK PERSONAL PHONE NUMBER / PERSONAL EMAIL OF DOCTOR!
    // Format strictly as "DOC-ORTHO-1042 — Assoc. Professor"
    let display = params.customSenderDisplay;
    if (!display) {
      if (isDoc) {
        const docObj = this.doctors.find(d => d.doctorId === user?.doctorId) || this.doctors[1];
        display = `${docObj.doctorId} — ${docObj.designation}`;
      } else if (user?.role === 'PATIENT') {
        display = `Patient ${user.name}`;
      } else {
        display = 'Hospital Staff Relayer';
      }
    }

    const newMsg: DoctorGuideMessage = {
      id: `MSG-${Date.now()}`,
      groupId: params.groupId,
      patientId: group?.patientId || 'PAT-1002',
      senderId: user?.id || 'ANON',
      senderRole: isDoc ? 'DOCTOR' : 'PATIENT',
      senderDisplay: display,
      text: params.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      visibility,
      isDoctor: isDoc
    };

    this.messages = [...this.messages, newMsg];

    if (group) {
      group.lastMessageText = params.text;
      group.lastMessageTime = newMsg.timestamp;
      if (isDoc) {
        group.unreadForPatient += 1;
      } else {
        group.unreadForStaff += 1;
      }
    }

    this.saveState();
    return newMsg;
  }

  // --- ABDM / ABHA Mock verification ---
  public verifyAbha(abhaNumberOrAddress: string) {
    const clean = abhaNumberOrAddress.trim();
    const record = MOCK_ABHA_RECORDS[clean] || Object.values(MOCK_ABHA_RECORDS).find(r => r.abhaAddress.toLowerCase() === clean.toLowerCase());
    return record || null;
  }

  public resetToDefaultSeed() {
    localStorage.clear();
    this.tokens = INITIAL_QUEUE_TOKENS;
    this.beds = INITIAL_BEDS;
    this.emergencyCases = INITIAL_EMERGENCY_CASES;
    this.caseGroups = INITIAL_CASE_GROUPS;
    this.messages = INITIAL_GUIDE_MESSAGES;
    this.user = {
      id: 'PAT-1002',
      name: 'Ramesh Sharma',
      role: 'PATIENT',
      mobile: '9812345678',
      abhaId: '14-5544-7788-9922'
    };
    this.saveState();
  }
}

export const hospitalStore = new HospitalStore();
