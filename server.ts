import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  HOSPITAL_INFO, 
  INITIAL_DEPARTMENTS, 
  INITIAL_DOCTORS, 
  SCHEDULE_SETS, 
  INITIAL_BEDS, 
  INITIAL_QUEUE_TOKENS, 
  INITIAL_EMERGENCY_CASES, 
  INITIAL_CASE_GROUPS, 
  INITIAL_GUIDE_MESSAGES,
  MOCK_ABHA_RECORDS
} from './src/services/mockData';
import { QueueToken, HospitalBed, EmergencyCase, DoctorGuideMessage, CaseGroup, BedStatus, TokenStatus } from './src/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory data store for server instance
let tokens: QueueToken[] = [...INITIAL_QUEUE_TOKENS];
let beds: HospitalBed[] = [...INITIAL_BEDS];
let emergencyCases: EmergencyCase[] = [...INITIAL_EMERGENCY_CASES];
let caseGroups: CaseGroup[] = [...INITIAL_CASE_GROUPS];
let messages: DoctorGuideMessage[] = [...INITIAL_GUIDE_MESSAGES];

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'ONLINE',
    name: HOSPITAL_INFO.name,
    timestamp: new Date().toISOString()
  });
});

// 1. Authentication Endpoints
app.post('/api/auth/:role/send-otp', (req: Request, res: Response) => {
  const { identifier } = req.body;
  res.json({
    success: true,
    message: 'One-Time Password dispatched to registered mobile',
    data: {
      identifier,
      otpSent: true,
      cooldownSeconds: 60,
      testOtp: '123456'
    },
    timestamp: new Date().toISOString()
  });
});

app.post('/api/auth/:role/verify-otp', (req: Request, res: Response) => {
  const { role } = req.params;
  const { identifier, otp, name, abhaId, doctorId, staffId, ambulanceId } = req.body;

  if (otp !== '123456' && otp?.length < 4) {
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP code. Please use 123456 for demo authorization.',
      timestamp: new Date().toISOString()
    });
  }

  let userObj: Record<string, unknown> = {
    id: `AUTH-${Date.now().toString().slice(-4)}`,
    role: role.toUpperCase(),
    mobile: identifier || '9812345678'
  };

  if (role.toUpperCase() === 'PATIENT') {
    userObj = {
      ...userObj,
      name: name || 'Ramesh Sharma',
      abhaId: abhaId || '14-5544-7788-9922'
    };
  } else if (role.toUpperCase() === 'AMBULANCE') {
    userObj = {
      ...userObj,
      name: 'Rajveer Tyagi (EMT Paramedic)',
      ambulanceId: ambulanceId || 'AMB-UP80-108',
      subRole: 'ATTENDANT'
    };
  } else if (role.toUpperCase() === 'DOCTOR') {
    const doc = INITIAL_DOCTORS.find(d => d.doctorId === doctorId) || INITIAL_DOCTORS[1];
    userObj = {
      ...userObj,
      doctorId: doc.doctorId,
      name: doc.name,
      subRole: doc.subRole,
      departmentId: doc.departmentId,
      departmentName: doc.departmentName,
      cabin: doc.roomCabin
    };
  } else {
    userObj = {
      ...userObj,
      name: 'Dr. Satish Singhal (Medical Superintendent)',
      subRole: 'DIRECTOR',
      staffId: staffId || 'STAFF-ADMIN-01'
    };
  }

  return res.json({
    success: true,
    message: 'Authentication successful',
    data: {
      accessToken: `mock_jwt_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      user: userObj
    },
    timestamp: new Date().toISOString()
  });
});

// 2. Token & Queue Endpoints
app.get('/api/tokens', (req: Request, res: Response) => {
  const { departmentId, doctorId, status, mobile } = req.query;
  let filtered = [...tokens];

  if (departmentId) {
    filtered = filtered.filter(t => t.departmentId === departmentId);
  }
  if (doctorId) {
    filtered = filtered.filter(t => t.doctorId === doctorId);
  }
  if (status) {
    filtered = filtered.filter(t => t.status === status);
  }
  if (mobile) {
    filtered = filtered.filter(t => t.mobile === mobile);
  }

  res.json({
    success: true,
    data: filtered,
    total: filtered.length,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/tokens/opd', (req: Request, res: Response) => {
  const {
    patientName,
    patientAge,
    gender,
    mobile,
    abhaId,
    departmentId,
    causeOfVisit,
    symptoms,
    visitType,
    preferredDate
  } = req.body;

  const dept = INITIAL_DEPARTMENTS.find(d => d.id === departmentId) || INITIAL_DEPARTMENTS[0];
  const assignedDoctor = INITIAL_DOCTORS.find(d => d.departmentId === dept.id && !d.isAdministrativeOnly) || INITIAL_DOCTORS[1];
  
  const existingDeptTokens = tokens.filter(t => t.departmentId === dept.id);
  const sequenceNum = existingDeptTokens.length + 42;
  const tokenNumber = `OPD-${dept.code}-${String(sequenceNum).padStart(3, '0')}`;

  const waitingTokens = existingDeptTokens.filter(t => t.status === 'WAITING' || t.status === 'REGISTERED');
  const queuePos = waitingTokens.length + 1;
  const estWait = queuePos * (assignedDoctor.avgConsultationMinutes || 8);
  const caseGroupId = `CASE-GRP-${Date.now().toString().slice(-5)}`;

  const newToken: QueueToken = {
    id: `TOK-${Date.now()}`,
    tokenNumber,
    patientId: `PAT-${Date.now().toString().slice(-4)}`,
    patientName: patientName || 'Ramesh Sharma',
    patientAge: Number(patientAge) || 45,
    gender: gender || 'MALE',
    mobile: mobile || '9812345678',
    abhaId,
    departmentId: dept.id,
    departmentName: dept.name,
    doctorId: assignedDoctor.doctorId,
    doctorName: assignedDoctor.name,
    doctorDesignation: assignedDoctor.designation,
    building: dept.building,
    floor: dept.floor,
    roomCabin: assignedDoctor.roomCabin,
    scheduledDate: preferredDate || new Date().toISOString().split('T')[0],
    appointmentTime: '10:30 AM',
    registrationTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    priority: 'NORMAL',
    status: 'WAITING',
    queuePosition: queuePos,
    estimatedWaitMinutes: estWait,
    causeOfVisit: causeOfVisit || 'General Health Checkup',
    symptoms: symptoms || 'Routine follow-up',
    visitType: visitType || 'NEW',
    caseGroupId
  };

  tokens = [newToken, ...tokens];

  // Also initialize Guide Box case group
  const newGroup: CaseGroup = {
    id: caseGroupId,
    tokenNumber,
    patientId: newToken.patientId,
    patientName: newToken.patientName,
    departmentId: dept.id,
    departmentName: dept.name,
    assignedDoctorIds: [assignedDoctor.doctorId],
    seniorDoctorId: assignedDoctor.doctorId,
    seniorDoctorName: assignedDoctor.name,
    createdAt: new Date().toLocaleString(),
    lastMessageText: `Case consultation opened for ${tokenNumber}`,
    lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    unreadForPatient: 1,
    unreadForStaff: 0
  };

  const initialMsg: DoctorGuideMessage = {
    id: `MSG-${Date.now()}`,
    groupId: caseGroupId,
    patientId: newToken.patientId,
    senderId: 'SYSTEM',
    senderRole: 'SYSTEM',
    senderDisplay: 'ArogyaGati Hospital System',
    text: `Token ${tokenNumber} registered. Attending team: ${assignedDoctor.name} at ${dept.building}, ${assignedDoctor.roomCabin}.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    visibility: 'PATIENT_VISIBLE',
    isDoctor: false
  };

  caseGroups = [newGroup, ...caseGroups];
  messages = [...messages, initialMsg];

  res.status(201).json({
    success: true,
    message: 'OPD Token generated successfully',
    data: newToken,
    timestamp: new Date().toISOString()
  });
});

app.patch('/api/tokens/:tokenId/status', (req: Request, res: Response) => {
  const { tokenId } = req.params;
  const { status, clinicalNotes, prescription } = req.body;

  let found = false;
  tokens = tokens.map(token => {
    if (token.id === tokenId || token.tokenNumber === tokenId) {
      found = true;
      const updated: QueueToken = {
        ...token,
        status: status as TokenStatus,
        clinicalNotes: clinicalNotes !== undefined ? clinicalNotes : token.clinicalNotes,
        prescription: prescription !== undefined ? prescription : token.prescription
      };
      if (status === 'CALLED') {
        updated.calledAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (status === 'COMPLETED') {
        updated.completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return updated;
    }
    return token;
  });

  if (!found) {
    return res.status(404).json({
      success: false,
      message: `Token ${tokenId} not found`,
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    message: `Token status updated to ${status}`,
    timestamp: new Date().toISOString()
  });
});

// 3. Hospital Bed Endpoints
app.get('/api/beds/hospital/:hospitalId', (req: Request, res: Response) => {
  const { departmentId, category, status } = req.query;
  let result = [...beds];

  if (departmentId) {
    result = result.filter(b => b.departmentId === departmentId);
  }
  if (category) {
    result = result.filter(b => b.bedCategory === category);
  }
  if (status) {
    result = result.filter(b => b.status === status);
  }

  res.json({
    success: true,
    data: result,
    stats: {
      total: beds.length,
      available: beds.filter(b => b.status === 'AVAILABLE').length,
      occupied: beds.filter(b => b.status === 'OCCUPIED').length,
      reserved: beds.filter(b => b.status === 'RESERVED').length
    },
    timestamp: new Date().toISOString()
  });
});

app.patch('/api/beds/:bedId/status', (req: Request, res: Response) => {
  const { bedId } = req.params;
  const { status, patientName } = req.body;

  beds = beds.map(b => {
    if (b.id === bedId) {
      return {
        ...b,
        status: status as BedStatus,
        patientName: status === 'AVAILABLE' ? undefined : (patientName || b.patientName),
        lastUpdated: 'Just now'
      };
    }
    return b;
  });

  res.json({
    success: true,
    message: `Bed ${bedId} updated to ${status}`,
    timestamp: new Date().toISOString()
  });
});

// 4. Emergency Ambulance 108 Endpoints
app.get('/api/emergency/cases', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: emergencyCases,
    total: emergencyCases.length,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/emergency/register', (req: Request, res: Response) => {
  const data = req.body;
  const tokenSeq = emergencyCases.length + 10;
  const emergencyToken = `EMG-RED-${String(tokenSeq).padStart(3, '0')}`;

  const availableBed = beds.find(b => b.status === 'AVAILABLE' && (b.bedCategory === 'EMERGENCY' || b.bedCategory === 'ICU'));
  if (availableBed) {
    availableBed.status = 'RESERVED';
    availableBed.patientName = `Incoming ${data.patientName || 'Emergency Victim'}`;
    availableBed.patientToken = emergencyToken;
  }

  const newCase: EmergencyCase = {
    id: `EMG-CASE-${Date.now()}`,
    emergencyToken,
    ambulanceId: data.ambulanceId || 'AMB-UP80-108',
    ambulanceRegNo: data.ambulanceRegNo || 'UP-80-EZ-4192',
    attendantId: data.attendantId || 'ATT-4091',
    attendantName: data.attendantName || 'Rajveer Tyagi',
    patientName: data.patientName || 'Emergency Victim',
    patientAge: Number(data.patientAge) || 35,
    gender: data.gender || 'MALE',
    abhaId: data.abhaId,
    category: data.category || 'TRAUMA',
    severity: data.severity || 'CRITICAL',
    description: data.description || 'Road traffic accident on Highway',
    incidentLocation: data.incidentLocation || 'NH-19 Highway, Near Agra',
    incidentTime: new Date(Date.now() - 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    pickupTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    destinationHospital: 'S. N. Medical College Emergency Trauma Center',
    etaMinutes: Number(data.etaMinutes) || 8,
    assignedDoctorId: 'DOC-ORTHO-1001',
    assignedDoctorName: 'Prof. (Dr.) Arvind Mehta (Trauma Incharge)',
    receivingDepartment: 'Trauma & Emergency Services',
    status: 'EN_ROUTE',
    vitals: data.vitals || {
      pulse: 112,
      bloodPressure: '88/58',
      spo2: 91,
      respiratoryRate: 26,
      gcsScore: 'E3V4M5 (12/15)'
    },
    reservedBedId: availableBed?.id,
    createdTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  emergencyCases = [newCase, ...emergencyCases];

  // Insert high priority emergency token into token queue
  const emergencyQueueToken: QueueToken = {
    id: `TOK-${Date.now()}`,
    tokenNumber: emergencyToken,
    patientId: `PAT-EMG-${Date.now().toString().slice(-4)}`,
    patientName: newCase.patientName,
    patientAge: newCase.patientAge,
    gender: newCase.gender,
    mobile: '108 (Paramedic Relay)',
    abhaId: newCase.abhaId,
    departmentId: 'DEP-ORTHO',
    departmentName: 'Emergency Trauma Center',
    doctorId: 'DOC-ORTHO-1001',
    doctorName: 'Prof. (Dr.) Arvind Mehta',
    doctorDesignation: 'HOD Orthopaedics & Trauma Incharge',
    building: 'Emergency Trauma Centre',
    floor: 0,
    roomCabin: 'Red Trauma Resuscitation Bay',
    scheduledDate: new Date().toISOString().split('T')[0],
    appointmentTime: 'IMMEDIATE',
    registrationTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    priority: 'EMERGENCY',
    status: 'WAITING',
    queuePosition: 1,
    estimatedWaitMinutes: 1,
    causeOfVisit: `EMERGENCY: ${newCase.category} - ${newCase.incidentLocation}`,
    symptoms: newCase.description,
    visitType: 'NEW',
    caseGroupId: `CASE-GRP-EMG-${Date.now().toString().slice(-4)}`
  };

  tokens = [emergencyQueueToken, ...tokens];

  res.status(201).json({
    success: true,
    message: 'Emergency 108 case registered & trauma team alerted',
    data: newCase,
    timestamp: new Date().toISOString()
  });
});

app.patch('/api/emergency/:caseId/status', (req: Request, res: Response) => {
  const { caseId } = req.params;
  const { status } = req.body;

  emergencyCases = emergencyCases.map(c => {
    if (c.id === caseId) {
      return { ...c, status };
    }
    return c;
  });

  res.json({
    success: true,
    message: `Emergency case status updated to ${status}`,
    timestamp: new Date().toISOString()
  });
});

// 5. Doctor Guide Box (Strict Privacy Protection)
app.get('/api/chat/groups', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: caseGroups,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/chat/:groupId/messages', (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { role } = req.query; // 'PATIENT' or 'DOCTOR' / 'STAFF'

  let list = messages.filter(m => m.groupId === groupId);
  
  // Privacy filtering: Patients NEVER see STAFF_INTERNAL notes!
  if (role === 'PATIENT') {
    list = list.filter(m => m.visibility === 'PATIENT_VISIBLE');
  }

  res.json({
    success: true,
    data: list,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/chat/:groupId/messages', (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { text, senderRole, senderDisplay, visibility } = req.body;

  const isDoc = senderRole === 'DOCTOR';
  const finalVisibility = visibility || 'PATIENT_VISIBLE';

  const newMsg: DoctorGuideMessage = {
    id: `MSG-${Date.now()}`,
    groupId,
    patientId: 'PAT-1002',
    senderId: isDoc ? 'DOC-AUTH' : 'PAT-AUTH',
    senderRole: isDoc ? 'DOCTOR' : 'PATIENT',
    senderDisplay: senderDisplay || (isDoc ? 'DOC-ORTHO-1001 — HOD' : 'Patient Ramesh Sharma'),
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    visibility: finalVisibility,
    isDoctor: isDoc
  };

  messages = [...messages, newMsg];

  const group = caseGroups.find(g => g.id === groupId);
  if (group) {
    group.lastMessageText = text;
    group.lastMessageTime = newMsg.timestamp;
  }

  res.status(201).json({
    success: true,
    data: newMsg,
    timestamp: new Date().toISOString()
  });
});

// 6. Master Data Endpoints
app.get('/api/departments', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: INITIAL_DEPARTMENTS,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/doctors', (req: Request, res: Response) => {
  const { departmentId } = req.query;
  let list = INITIAL_DOCTORS;
  if (departmentId) {
    list = list.filter(d => d.departmentId === departmentId);
  }
  res.json({
    success: true,
    data: list,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/doctors/schedule', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: SCHEDULE_SETS,
    timestamp: new Date().toISOString()
  });
});

// 7. ABHA Digital Health Record Verification
app.post('/api/abha/verify', (req: Request, res: Response) => {
  const { abhaId } = req.body;
  const clean = (abhaId || '').trim();
  const record = MOCK_ABHA_RECORDS[clean] || Object.values(MOCK_ABHA_RECORDS).find(r => r.abhaAddress.toLowerCase() === clean.toLowerCase());

  if (record) {
    return res.json({
      success: true,
      verified: true,
      data: record,
      message: 'ABHA Record verified successfully via ABDM Gateway'
    });
  }

  return res.json({
    success: true,
    verified: false,
    message: 'ABHA ID not found in ABDM sandbox registry'
  });
});

// Start Express API Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[ArogyaGati API Server] running on http://localhost:${PORT}`);
    console.log(`[ArogyaGati API Server] REST endpoints active for Authentication, Live Tokens, Beds, Ambulance 108 & Doctor Guide Box.`);
  });
}

export default app;
