package org.arogyagati.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "emergency_cases")
public class EmergencyCase {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "emergency_token", nullable = false, unique = true, length = 50)
    private String emergencyToken;

    @Column(name = "ambulance_id", length = 50)
    private String ambulanceId;

    @Column(name = "patient_name", length = 150)
    private String patientName;

    @Column(name = "patient_age")
    private Integer patientAge;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "category", nullable = false, length = 50)
    private String category; // TRAUMA, CARDIAC, STROKE, RESPIRATORY, MATERNAL, BURN

    @Column(name = "severity", nullable = false, length = 30)
    private String severity; // CRITICAL, SERIOUS, STABLE

    @Column(name = "incident_location", columnDefinition = "TEXT")
    private String incidentLocation;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "eta_minutes")
    private Integer etaMinutes;

    @Column(name = "assigned_doctor_id")
    private UUID assignedDoctorId;

    @Column(name = "assigned_bed_id", length = 50)
    private String assignedBedId;

    @Column(name = "status", length = 30)
    private String status = "EN_ROUTE"; // DISPATCHED, EN_ROUTE, ARRIVED, TRIAGED, ADMITTED

    @Enumerated(EnumType.STRING)
    @Column(name = "identity_state", length = 40)
    private IdentityState identityState = IdentityState.IDENTITY_PENDING_VERIFICATION;

    // Vitals recorded in transit
    @Column(name = "pulse_bpm")
    private Integer pulseBpm;

    @Column(name = "blood_pressure", length = 20)
    private String bloodPressure;

    @Column(name = "oxygen_saturation_pct")
    private Integer oxygenSaturationPct;

    @Column(name = "respiratory_rate_bpm")
    private Integer respiratoryRateBpm;

    @Column(name = "glasgow_coma_scale")
    private Integer glasgowComaScale;

    @Column(name = "photo_data", columnDefinition = "TEXT")
    private String photoData;

    @Column(name = "biometric_status", length = 50)
    private String biometricStatus;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum IdentityState {
        VERIFIED,
        IDENTITY_PENDING_VERIFICATION,
        UNIDENTIFIED
    }

    public EmergencyCase() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmergencyToken() { return emergencyToken; }
    public void setEmergencyToken(String emergencyToken) { this.emergencyToken = emergencyToken; }

    public String getAmbulanceId() { return ambulanceId; }
    public void setAmbulanceId(String ambulanceId) { this.ambulanceId = ambulanceId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public Integer getPatientAge() { return patientAge; }
    public void setPatientAge(Integer patientAge) { this.patientAge = patientAge; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getIncidentLocation() { return incidentLocation; }
    public void setIncidentLocation(String incidentLocation) { this.incidentLocation = incidentLocation; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getEtaMinutes() { return etaMinutes; }
    public void setEtaMinutes(Integer etaMinutes) { this.etaMinutes = etaMinutes; }

    public UUID getAssignedDoctorId() { return assignedDoctorId; }
    public void setAssignedDoctorId(UUID assignedDoctorId) { this.assignedDoctorId = assignedDoctorId; }

    public String getAssignedBedId() { return assignedBedId; }
    public void setAssignedBedId(String assignedBedId) { this.assignedBedId = assignedBedId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public IdentityState getIdentityState() { return identityState; }
    public void setIdentityState(IdentityState identityState) { this.identityState = identityState; }

    public Integer getPulseBpm() { return pulseBpm; }
    public void setPulseBpm(Integer pulseBpm) { this.pulseBpm = pulseBpm; }

    public String getBloodPressure() { return bloodPressure; }
    public void setBloodPressure(String bloodPressure) { this.bloodPressure = bloodPressure; }

    public Integer getOxygenSaturationPct() { return oxygenSaturationPct; }
    public void setOxygenSaturationPct(Integer oxygenSaturationPct) { this.oxygenSaturationPct = oxygenSaturationPct; }

    public Integer getRespiratoryRateBpm() { return respiratoryRateBpm; }
    public void setRespiratoryRateBpm(Integer respiratoryRateBpm) { this.respiratoryRateBpm = respiratoryRateBpm; }

    public Integer getGlasgowComaScale() { return glasgowComaScale; }
    public void setGlasgowComaScale(Integer glasgowComaScale) { this.glasgowComaScale = glasgowComaScale; }

    public String getPhotoData() { return photoData; }
    public void setPhotoData(String photoData) { this.photoData = photoData; }

    public String getBiometricStatus() { return biometricStatus; }
    public void setBiometricStatus(String biometricStatus) { this.biometricStatus = biometricStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
