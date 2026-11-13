-- ====================================================================
-- AROGYAGATI: Unified Smart Government Hospital Management Platform
-- Flyway Database Migration: V1__initial_schema.sql
-- PostgreSQL 15+ Schema
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE,
    mobile_number VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. USER_ROLES
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id VARCHAR(50) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 4. HOSPITALS
CREATE TABLE hospitals (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    short_name VARCHAR(100),
    address TEXT NOT NULL,
    emergency_contact VARCHAR(50),
    abdm_facility_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. BUILDINGS
CREATE TABLE buildings (
    id VARCHAR(50) PRIMARY KEY,
    hospital_id VARCHAR(50) NOT NULL REFERENCES hospitals(id),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20),
    total_floors INT DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. FLOORS
CREATE TABLE floors (
    id VARCHAR(50) PRIMARY KEY,
    building_id VARCHAR(50) NOT NULL REFERENCES buildings(id),
    floor_number INT NOT NULL,
    label VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (building_id, floor_number)
);

-- 7. DEPARTMENTS
CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY,
    hospital_id VARCHAR(50) NOT NULL REFERENCES hospitals(id),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    hindi_name VARCHAR(200),
    building_id VARCHAR(50) REFERENCES buildings(id),
    floor_number INT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. DOCTOR HIERARCHY REFERENCE
CREATE TABLE doctor_hierarchy (
    designation_code VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    hierarchy_level INT NOT NULL, -- 1=Director, 2=HOD, 3=Dean/Sr Prof, 4=Assoc Prof, 5=Asst Prof, 6=JNR3, 7=JNR2, 8=JNR1
    is_clinical_consultant BOOLEAN DEFAULT TRUE
);

-- 9. DOCTORS
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id VARCHAR(50) NOT NULL UNIQUE, -- e.g. DOC-ORTHO-1001
    user_id UUID REFERENCES users(id),
    department_id VARCHAR(50) NOT NULL REFERENCES departments(id),
    name VARCHAR(150) NOT NULL,
    designation_code VARCHAR(50) NOT NULL REFERENCES doctor_hierarchy(designation_code),
    qualification VARCHAR(200),
    specialization VARCHAR(250),
    years_of_experience INT DEFAULT 0,
    room_cabin VARCHAR(50),
    building_id VARCHAR(50) REFERENCES buildings(id),
    floor_number INT,
    status VARCHAR(30) DEFAULT 'AVAILABLE', -- AVAILABLE, IN_CONSULTATION, ON_ROUND, OFF_DUTY
    max_daily_patients INT DEFAULT 50,
    avg_consultation_minutes INT DEFAULT 8,
    is_administrative_only BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. DOCTOR SCHEDULE SETS (Set A, Set B, Set C)
CREATE TABLE doctor_schedule_sets (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(30) NOT NULL, -- SET_A, SET_B, SET_C, SUNDAY_SPECIAL
    name VARCHAR(100) NOT NULL,
    department_id VARCHAR(50) NOT NULL REFERENCES departments(id),
    shift_timing VARCHAR(100) DEFAULT '08:00 AM - 02:00 PM',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. DOCTOR SCHEDULES
CREATE TABLE doctor_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    schedule_set_id VARCHAR(50) NOT NULL REFERENCES doctor_schedule_sets(id),
    day_of_week INT NOT NULL, -- 1=Monday ... 7=Sunday
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. PATIENTS
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    full_name VARCHAR(150) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(20) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    abha_number VARCHAR(30),
    abha_address VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. WARDS
CREATE TABLE wards (
    id VARCHAR(50) PRIMARY KEY,
    hospital_id VARCHAR(50) NOT NULL REFERENCES hospitals(id),
    building_id VARCHAR(50) NOT NULL REFERENCES buildings(id),
    floor_number INT NOT NULL,
    department_id VARCHAR(50) REFERENCES departments(id),
    ward_name VARCHAR(150) NOT NULL,
    ward_type VARCHAR(50) NOT NULL, -- GENERAL, ORTHOPAEDIC, ICU, EMERGENCY, PAEDIATRIC, ISOLATION
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. HOSPITAL_BEDS
CREATE TABLE hospital_beds (
    id VARCHAR(50) PRIMARY KEY,
    bed_number VARCHAR(50) NOT NULL,
    ward_id VARCHAR(50) NOT NULL REFERENCES wards(id),
    hospital_id VARCHAR(50) NOT NULL REFERENCES hospitals(id),
    bed_category VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'AVAILABLE', -- AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE, CLEANING
    patient_id UUID REFERENCES patients(id),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. CASE_GROUPS (Doctor Guide Box Groups)
CREATE TABLE case_groups (
    id VARCHAR(50) PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    department_id VARCHAR(50) NOT NULL REFERENCES departments(id),
    senior_doctor_id UUID NOT NULL REFERENCES doctors(id),
    token_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. CASE_GROUP_MEMBERS
CREATE TABLE case_group_members (
    case_group_id VARCHAR(50) NOT NULL REFERENCES case_groups(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    role_in_case VARCHAR(50), -- SENIOR_LEAD, ASSOCIATE, JUNIOR_RESIDENT
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (case_group_id, doctor_id)
);

-- 17. GROUP_CHAT_MESSAGES
CREATE TABLE group_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_group_id VARCHAR(50) NOT NULL REFERENCES case_groups(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES users(id),
    sender_role VARCHAR(50) NOT NULL,
    sender_display_name VARCHAR(150) NOT NULL, -- MASKED ID: DOC-ORTHO-1001 -- HOD
    message_text TEXT NOT NULL,
    visibility VARCHAR(30) DEFAULT 'PATIENT_VISIBLE', -- PATIENT_VISIBLE or STAFF_INTERNAL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. QUEUE_TOKENS
CREATE TABLE queue_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_number VARCHAR(50) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES patients(id),
    department_id VARCHAR(50) NOT NULL REFERENCES departments(id),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    scheduled_date DATE NOT NULL,
    appointment_time VARCHAR(20),
    priority VARCHAR(20) DEFAULT 'NORMAL', -- NORMAL, URGENT, EMERGENCY
    status VARCHAR(30) DEFAULT 'REGISTERED', -- REGISTERED, WAITING, CALLED, IN_CONSULTATION, COMPLETED, CANCELLED, NO_SHOW
    queue_position INT DEFAULT 0,
    estimated_wait_minutes INT DEFAULT 0,
    cause_of_visit TEXT,
    symptoms TEXT,
    visit_type VARCHAR(20) DEFAULT 'NEW',
    case_group_id VARCHAR(50) REFERENCES case_groups(id),
    clinical_notes TEXT,
    prescription TEXT,
    called_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. AMBULANCES
CREATE TABLE ambulances (
    id VARCHAR(50) PRIMARY KEY,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    hospital_id VARCHAR(50) REFERENCES hospitals(id),
    attendant_id VARCHAR(50),
    attendant_name VARCHAR(150),
    contact_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE
);

-- 20. EMERGENCY_CASES
CREATE TABLE emergency_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emergency_token VARCHAR(50) NOT NULL UNIQUE,
    ambulance_id VARCHAR(50) REFERENCES ambulances(id),
    patient_name VARCHAR(150),
    patient_age INT,
    gender VARCHAR(20),
    abha_id VARCHAR(50),
    category VARCHAR(50) NOT NULL, -- TRAUMA, CARDIAC, STROKE, RESPIRATORY, MATERNAL, BURN
    severity VARCHAR(30) NOT NULL, -- CRITICAL, SERIOUS, STABLE
    incident_location TEXT,
    description TEXT,
    eta_minutes INT,
    assigned_doctor_id UUID REFERENCES doctors(id),
    assigned_bed_id VARCHAR(50) REFERENCES hospital_beds(id),
    status VARCHAR(30) DEFAULT 'EN_ROUTE', -- DISPATCHED, EN_ROUTE, ARRIVED, TRIAGED, ADMITTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. PATIENT_VISITS (FHIR R4 Compatible Encounters)
CREATE TABLE patient_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    token_id UUID REFERENCES queue_tokens(id),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    visit_date DATE NOT NULL,
    diagnosis_code VARCHAR(50),
    diagnosis_description TEXT,
    prescription_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. OTP_VERIFICATIONS
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mobile_number VARCHAR(15) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    role VARCHAR(50) NOT NULL,
    attempts INT DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 23. NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(30) DEFAULT 'WEBSOCKET',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 24. AUDIT_LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id),
    entity_name VARCHAR(100),
    entity_id VARCHAR(100),
    ip_address VARCHAR(50),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 25. NAVIGATION_NODES
CREATE TABLE navigation_nodes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    building_id VARCHAR(50) REFERENCES buildings(id),
    floor_number INT,
    room_number VARCHAR(50),
    x_coord FLOAT,
    y_coord FLOAT,
    description TEXT
);

-- 26. NAVIGATION_EDGES
CREATE TABLE navigation_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_node_id VARCHAR(50) NOT NULL REFERENCES navigation_nodes(id),
    to_node_id VARCHAR(50) NOT NULL REFERENCES navigation_nodes(id),
    distance_meters INT NOT NULL,
    instructions TEXT NOT NULL
);

-- 27. ABHA_VERIFICATION_RECORDS
CREATE TABLE abha_verification_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    abha_number VARCHAR(50) NOT NULL UNIQUE,
    abha_address VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    mobile VARCHAR(15),
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 28. FHIR_RESOURCES
CREATE TABLE fhir_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type VARCHAR(50) NOT NULL, -- Patient, Encounter, Condition, MedicationRequest
    resource_id VARCHAR(100) NOT NULL,
    patient_id UUID REFERENCES patients(id),
    fhir_json JSONB NOT NULL,
    version INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX idx_queue_tokens_dept_status ON queue_tokens(department_id, status);
CREATE INDEX idx_queue_tokens_doctor_date ON queue_tokens(doctor_id, scheduled_date);
CREATE INDEX idx_beds_category_status ON hospital_beds(bed_category, status);
CREATE INDEX idx_chat_group_time ON group_chat_messages(case_group_id, created_at);
CREATE INDEX idx_emergency_status ON emergency_cases(status);
