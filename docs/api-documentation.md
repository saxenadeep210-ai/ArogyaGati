# ArogyaGati REST API & WebSocket Specification

All requests sent to the backend require standard JSON payloads and return a structured envelope:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2026-11-05T09:30:00Z"
}
```

---

## 1. Authentication Endpoints

### 1.1 Send OTP
- **Endpoint:** `POST /api/auth/{role}/send-otp`
- **Roles:** `patient`, `ambulance`, `doctor`, `staff`
- **Request:**
  ```json
  {
    "identifier": "9812345678",
    "role": "PATIENT"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "otpSent": true,
    "cooldownSeconds": 60
  }
  ```

### 1.2 Verify OTP
- **Endpoint:** `POST /api/auth/{role}/verify-otp`
- **Request:**
  ```json
  {
    "identifier": "9812345678",
    "otp": "123456"
  }
  ```
- **Response:**
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzUxMiIs...",
    "refreshToken": "eyJhbGciOiJIUzUxMiIs...",
    "user": {
      "id": "PAT-1002",
      "name": "Ramesh Sharma",
      "role": "PATIENT"
    }
  }
  ```

---

## 2. Token & Queue Endpoints

### 2.1 Generate OPD Token
- **Endpoint:** `POST /api/tokens/opd`
- **Headers:** `Authorization: Bearer <token>`
- **Request:**
  ```json
  {
    "patientName": "Ramesh Sharma",
    "patientAge": 58,
    "gender": "MALE",
    "mobile": "9812345678",
    "abhaId": "14-5544-7788-9922",
    "departmentId": "DEP-ORTHO",
    "causeOfVisit": "Severe lumbar back stiffness",
    "symptoms": "Numbness in left foot for 2 weeks",
    "visitType": "NEW",
    "preferredDate": "2026-11-05"
  }
  ```

### 2.2 Call Next Patient
- **Endpoint:** `PATCH /api/tokens/{tokenId}/status`
- **Request:**
  ```json
  {
    "status": "CALLED",
    "doctorCabin": "Cabin 07"
  }
  ```

---

## 3. Hospital Bed Endpoints

### 3.1 Get Bed Matrix
- **Endpoint:** `GET /api/beds/hospital/{hospitalId}`
- **Query Params:** `departmentId`, `category`, `status`

### 3.2 Update Bed Status (Authorized Staff)
- **Endpoint:** `PATCH /api/beds/{bedId}/status`
- **Request:**
  ```json
  {
    "status": "OCCUPIED",
    "patientId": "PAT-1002"
  }
  ```

---

## 4. WebSocket STOMP Endpoints

- **Connection URL:** `ws://localhost:8080/ws`
- **Topics:**
  - `/topic/queue/{departmentId}` - Department-wide token call broadcast
  - `/topic/token/{tokenId}` - Individual patient token status updates
  - `/topic/emergency/{hospitalId}` - Inbound 108 ambulance triage alert
  - `/topic/beds/{hospitalId}` - Real-time bed availability updates
  - `/topic/chat/{groupId}` - Doctor Guide Box case messaging channel
