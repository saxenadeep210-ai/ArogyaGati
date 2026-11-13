# ArogyaGati: System Architecture & Technical Specifications

## 1. High-Level Architecture

ArogyaGati is a microservice-oriented, event-driven government healthcare coordination platform tailored for public hospitals such as Sarojini Naidu Medical College & Hospital (S. N. M. C.), Agra.

```
Clients (Citizen PWA, Ambulance Portal, Doctor Desk, Staff Admin)
   │
   ▼
Spring Cloud Gateway (Port 8080)
   ├── JWT Auth & Token Verification
   ├── Redis Rate Limiting
   └── Route Proxies
   │
   ├──▶ Identity & Authentication Service
   ├──▶ Token & Queue Service (Spring Boot + Redis Sorted Sets)
   ├──▶ Resource & Facility Service (PostgreSQL + Bed Cache)
   ├──▶ Doctor Directory & Weekly Set Rotation Service
   ├──▶ Doctor Guide Box Service (WebSocket STOMP + Role-Based Message Masking)
   └──▶ Indoor Wayfinder & Graph Navigation Service
```

---

## 2. Token Queue Management via Redis Sorted Sets

To avoid database locking under peak morning OPD rushes (08:00 AM – 10:00 AM), all live queue sequences are managed atomically using **Redis Sorted Sets (`ZSET`)**:

- **Key Pattern:** `queue:department:{departmentId}`
- **Member:** Token identifier (e.g., `OPD-ORTHO-042`)
- **Score:** Timestamp in milliseconds.
- **Emergency Priority Override:** Emergency cases dispatched by 108 ambulances receive a negative score offset (`score - 10^12`), guaranteeing they position at the front of the queue ahead of routine OPD tokens.

---

## 3. Doctor OPD Schedule & Weekly Rotation (Set A, B, C)

Public teaching hospitals rotate clinical units to balance Outpatient Department (OPD), Inpatient Ward rounds, and Operation Theatre (OT) schedules:

| Set Code | Duty Days | Department Example (Orthopaedics) |
|---|---|---|
| **Set A** | Monday & Thursday | Prof. Arvind Mehta (HOD), Dr. Priya Sharma (Assoc Prof), Dr. Anand Gupta (Asst Prof), Junior Residents |
| **Set B** | Tuesday & Friday | Dr. Rajesh Verma (Assoc Prof), Dr. Rahul Srivastava (Senior Resident) |
| **Set C** | Wednesday & Saturday | Dr. Meenakshi Rai (Asst Prof), Dr. Divya Singh (Junior Resident), Director OPD |
| **Sunday** | Emergency Special | Emergency Casualty Trauma On-Call Rotation |

---

## 4. Doctor Guide Box Privacy & Masking Architecture

To protect doctors from harassment and personal intrusion, the Doctor Guide Box enforces strict server-side masking:
1. **Never exposes** personal telephone numbers, personal emails, or social messaging accounts.
2. Formats all doctor senders as institutional role badges (e.g. `DOC-ORTHO-1042 — Associate Professor`).
3. Dual-visibility stream:
   - `PATIENT_VISIBLE`: Sanitized clinical answers sent to patient interface.
   - `STAFF_INTERNAL`: Differential diagnosis, lab review, and resident instructions completely hidden from the patient.
