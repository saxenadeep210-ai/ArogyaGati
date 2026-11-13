-- ====================================================================
-- AROGYAGATI: Flyway Migration V2__security_and_corrections.sql
-- Security, Tamper-Evident Hash Chain, Data Corrections, WebAuthn & File Quarantine
-- ====================================================================

-- 1. USER_CREDENTIALS (Argon2id Hashing & Account Security)
CREATE TABLE IF NOT EXISTS user_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    hash_algorithm VARCHAR(30) DEFAULT 'ARGON2ID',
    failed_attempts INT DEFAULT 0,
    lockout_until TIMESTAMP WITH TIME ZONE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_credentials_user UNIQUE (user_id)
);

-- 2. AUDIT_HASH_CHAIN (Tamper-evident cryptographically chained audit logs)
CREATE TABLE IF NOT EXISTS audit_hash_chain (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sequence_number BIGSERIAL NOT NULL UNIQUE,
    actor_id VARCHAR(100) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    reason TEXT,
    canonical_payload TEXT NOT NULL,
    previous_hash VARCHAR(64) NOT NULL,
    current_hash VARCHAR(64) NOT NULL,
    status VARCHAR(30) DEFAULT 'VERIFIED', -- VERIFIED, TAMPERED, PENDING
    ip_address VARCHAR(50),
    correlation_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_seq ON audit_hash_chain(sequence_number);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_hash_chain(actor_id, actor_role);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_hash_chain(entity_type, entity_id);

-- 3. DATA_CORRECTIONS (Administrative correction workflow with dual-approval for high-risk changes)
CREATE TABLE IF NOT EXISTS data_corrections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    correction_number VARCHAR(50) NOT NULL UNIQUE, -- e.g. CORR-2026-0042
    entity_type VARCHAR(50) NOT NULL, -- PATIENT, TOKEN, BED, EMERGENCY, DOCTOR, DEPARTMENT
    entity_id VARCHAR(100) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    previous_value TEXT,
    proposed_value TEXT NOT NULL,
    reason TEXT NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, APPLIED
    requested_by VARCHAR(100) NOT NULL,
    approved_by VARCHAR(100),
    approval_timestamp TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_corrections_status ON data_corrections(status);
CREATE INDEX IF NOT EXISTS idx_corrections_entity ON data_corrections(entity_type, entity_id);

-- 4. WEBAUTHN_CREDENTIALS (Biometric passkey authentication)
CREATE TABLE IF NOT EXISTS webauthn_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_id VARCHAR(255) NOT NULL UNIQUE,
    public_key_cose TEXT NOT NULL,
    signature_count BIGINT DEFAULT 0,
    device_name VARCHAR(150),
    transports VARCHAR(100),
    aaguid VARCHAR(100),
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_webauthn_user ON webauthn_credentials(user_id);

-- 5. QUARANTINED_FILES (File uploads with magic bytes inspection & malware quarantine)
CREATE TABLE IF NOT EXISTS quarantined_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    sha256_checksum VARCHAR(64) NOT NULL,
    scan_status VARCHAR(30) DEFAULT 'PENDING_SCAN', -- UPLOADED, PENDING_SCAN, CLEAN, QUARANTINED, REJECTED
    scan_engine VARCHAR(50) DEFAULT 'HEURISTIC_MAGIC_CLAMAV',
    scan_report TEXT,
    uploader_id VARCHAR(100),
    uploader_role VARCHAR(50),
    entity_reference_type VARCHAR(50), -- MEDICAL_REPORT, PRESCRIPTION_SCAN, LAB_ATTACHMENT
    entity_reference_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    scanned_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_quarantine_checksum ON quarantined_files(sha256_checksum);
CREATE INDEX IF NOT EXISTS idx_quarantine_status ON quarantined_files(scan_status);

-- 6. EMERGENCY_IDENTITY_STATES & VITALS
CREATE TABLE IF NOT EXISTS emergency_patient_vitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emergency_case_id UUID NOT NULL REFERENCES emergency_cases(id) ON DELETE CASCADE,
    identity_state VARCHAR(40) DEFAULT 'IDENTITY_PENDING_VERIFICATION', -- VERIFIED, IDENTITY_PENDING_VERIFICATION, UNIDENTIFIED
    pulse_bpm INT,
    blood_pressure VARCHAR(20),
    oxygen_saturation_pct INT,
    respiratory_rate_bpm INT,
    temperature_fahrenheit NUMERIC(4, 1),
    glasgow_coma_scale INT,
    blood_glucose_mg_dl INT,
    recorded_by VARCHAR(100),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
