# ArogyaGati: Unified Smart Government Hospital Management & Patient Coordination Platform

ArogyaGati is a comprehensive, production-grade, database-connected government hospital coordination platform engineered for high-volume medical institutions such as **Sarojini Naidu Medical College & Hospital (S. N. M. C.), Agra**.

---

## 🏥 Key Platform Capabilities

1. **Four Distinct Role Portals:**
   - **Citizen / Patient PWA:** Self-registration, OPD token generation, live queue tracking, available beds, Doctor Guide Box chat, and ABHA card integration.
   - **Emergency 108 Ambulance Portal:** Inbound road traffic trauma and cardiac triage, destination hospital routing, vitals transmission, and emergency bed reservation.
   - **Doctor Desk Workspace:** Today's OPD duty set, real-time calling with synthesized hospital dual-chime audio, patient clinical notes, and prescription management.
   - **Hospital Staff / Admin Portal:** Centralized bed inventory control, cross-department queue load balancer, weekly doctor duty sets (Set A/B/C) management, and ABDM FHIR R4 JSON bundle export.

2. **Real-Time Token & Queue Management:**
   - Atomic departmental token numbering (e.g. `OPD-ORTHO-042`).
   - Dynamic estimated waiting time computation based on doctor consultation averages.
   - Emergency cases jump to the head of the clinical triage queue automatically.
   - Dual-tone hospital audio chime synthesized via Web Audio API.

3. **Doctor Guide Box (Strict Privacy Protection):**
   - Case-specific group conversation pairing each patient with 1 Senior Doctor (HOD), 1 Associate Professor, and Junior Residents.
   - **100% Doctor Privacy:** Doctor personal phone numbers and personal emails are never exposed. Senders appear with masked institutional IDs (e.g. `DOC-ORTHO-1042 — Assoc. Professor`).
   - **Dual-Stream Visibility:** Patients see only `PATIENT_VISIBLE` clinical guidance, while `STAFF_INTERNAL` notes (differential diagnosis, lab findings) are strictly restricted to doctors.

4. **Available Bed Matrix:**
   - Real-time hierarchy: `Hospital → Building → Floor → Ward → Bed Number` (e.g., *Building B → Floor 2 → Orthopaedic Ward → Bed 204*).
   - Instant categorization across General Ward, Orthopaedic Ward, ICU (Ventilator), Emergency Trauma Bay, and Paediatrics.

5. **Interactive Campus Wayfinder:**
   - Indoor interactive SVG campus map covering Ground, 1st, 2nd, and 3rd floors.
   - Turn-by-turn walking steps with estimated distance (meters) and walking duration.

---

## 🔑 Quick Test Credentials & Role Switcher

Use the **Quick Portal Switcher** floating at the bottom or in the header navigation bar to instantly switch roles:

| Role | Name / Badge | Test Credentials | Default Landing View |
|---|---|---|---|
| **Patient** | Ramesh Sharma | Mobile: `9812345678` (OTP: `123456`) | Patient Dashboard (`OPD-ORTHO-039`) |
| **Ambulance** | Rajveer Tyagi (EMT) | ID: `AMB-UP80-108` / Reg: `UP-80-EZ-4192` | Ambulance 108 Portal |
| **Doctor** | Prof. (Dr.) Arvind Mehta | Doctor ID: `DOC-ORTHO-1001` (Cabin 07) | Doctor Desk Consultation |
| **Staff Admin** | Medical Superintendent | Staff ID: `STAFF-ADMIN-01` | Hospital Staff / Admin Portal |

---

## 🧪 Verification of Specification Scenarios

- **Scenario 1: Patient OPD Token:** Navigate to Patient Portal → Click "Book OPD Token" → Select Orthopaedics → Confirm. Receives `OPD-ORTHO-042`, assigned to Cabin 07, with live queue estimation.
- **Scenario 2: Emergency Ambulance 108:** Navigate to Ambulance Portal → Enter trauma accident case on NH-19 → Transmit alert. Generates `EMG-RED-008` priority token and reserves trauma bay bed.
- **Scenario 3: Doctor Desk:** Switch to Doctor role → View Orthopaedics queue → Click "Call Next Patient". Dual chime plays, status updates to `CALLED`, and patient board updates.
- **Scenario 4: Doctor Guide Box Privacy:** Switch between "View as Patient" and "View as Doctor Team" in Doctor Guide Box. Notice that `[STAFF INTERNAL]` messages are hidden from the patient and doctors' phone numbers are completely masked.
- **Scenario 5: Bed Availability:** Navigate to Bed Tracker → Filter by Orthopaedics / Floor 2. See Bed 201 through Bed 205 with live statuses.
- **Scenario 6: OPD Duty Sets Rotation:** View Doctor Directory / Admin Portal → See Set A (Mon/Thu), Set B (Tue/Fri), Set C (Wed/Sat) units.
- **Scenario 7: Unauthorized Access Prevention:** Patient interface filters out staff-internal clinical notes and staff administrative actions.

---

## 💻 Tech Stack & Deployment

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Web Audio API
- **Backend Architecture:** Spring Boot 3.x, Spring Cloud Gateway, Spring Data JPA, Spring WebSocket (STOMP)
- **Database & Queue:** PostgreSQL 15, Redis 7 (Sorted Sets)
- **Standards:** ABDM M1/M2/M3 compliant, FHIR R4 Encounter and Condition bundles
