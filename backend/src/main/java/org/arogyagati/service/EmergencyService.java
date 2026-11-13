package org.arogyagati.service;

import org.arogyagati.entity.EmergencyCase;
import org.arogyagati.entity.Patient;
import org.arogyagati.repository.EmergencyCaseRepository;
import org.arogyagati.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class EmergencyService {

    private static final Logger log = LoggerFactory.getLogger(EmergencyService.class);

    private final EmergencyCaseRepository emergencyRepository;
    private final PatientRepository patientRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final SecureRandom secureRandom = new SecureRandom();

    public EmergencyService(
            EmergencyCaseRepository emergencyRepository,
            PatientRepository patientRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.emergencyRepository = emergencyRepository;
        this.patientRepository = patientRepository;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * One-Tap / Assisted Emergency Registration
     * Supports both verified identity and unknown/unidentified patients.
     * Never delays care if patient identity cannot be verified.
     */
    @Transactional
    public EmergencyCase registerEmergency(
            String ambulanceId,
            String patientName,
            Integer patientAge,
            String gender,
            String category,
            String severity,
            String incidentLocation,
            Integer etaMinutes,
            Integer pulseBpm,
            String bloodPressure,
            Integer oxygenSaturationPct,
            Integer glasgowComaScale
    ) {
        int randomSeq = 100000 + secureRandom.nextInt(900000);
        String emergencyToken = String.format("EMG-%d-%06d", LocalDateTime.now().getYear(), randomSeq);

        EmergencyCase.IdentityState identityState;
        String finalName = patientName;

        if (patientName == null || patientName.isBlank() || "UNKNOWN".equalsIgnoreCase(patientName.trim())) {
            identityState = EmergencyCase.IdentityState.UNIDENTIFIED;
            finalName = "Unidentified Trauma Patient (" + emergencyToken + ")";
        } else {
            identityState = EmergencyCase.IdentityState.IDENTITY_PENDING_VERIFICATION;
        }

        EmergencyCase emg = new EmergencyCase();
        emg.setEmergencyToken(emergencyToken);
        emg.setAmbulanceId(ambulanceId != null ? ambulanceId : "AMB-108");
        emg.setPatientName(finalName);
        emg.setPatientAge(patientAge);
        emg.setGender(gender != null ? gender : "UNKNOWN");
        emg.setCategory(category != null ? category : "TRAUMA");
        emg.setSeverity(severity != null ? severity : "CRITICAL");
        emg.setIncidentLocation(incidentLocation);
        emg.setEtaMinutes(etaMinutes != null ? etaMinutes : 8);
        emg.setStatus("EN_ROUTE");
        emg.setIdentityState(identityState);

        // Vitals
        emg.setPulseBpm(pulseBpm);
        emg.setBloodPressure(bloodPressure);
        emg.setOxygenSaturationPct(oxygenSaturationPct);
        emg.setGlasgowComaScale(glasgowComaScale);

        EmergencyCase saved = emergencyRepository.save(emg);

        // Transmit pre-arrival alert to Emergency Department via STOMP WebSocket
        if (messagingTemplate != null) {
            try {
                messagingTemplate.convertAndSend("/topic/emergency/alerts", saved);
            } catch (Exception ex) {
                log.warn("Failed to broadcast emergency alert: {}", ex.getMessage());
            }
        }

        log.info("Registered emergency case {} for ambulance {} - Identity state: {}",
                emergencyToken, ambulanceId, identityState);

        return saved;
    }

    /**
     * Post-stabilization identity reconciliation.
     * Reconciles an unidentified emergency record with an authorized verified patient profile.
     */
    @Transactional
    public EmergencyCase reconcileIdentity(UUID emergencyCaseId, UUID verifiedPatientId) {
        EmergencyCase emg = emergencyRepository.findById(emergencyCaseId)
                .orElseThrow(() -> new IllegalArgumentException("Emergency case not found: " + emergencyCaseId));

        Patient patient = patientRepository.findById(verifiedPatientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + verifiedPatientId));

        emg.setPatientName(patient.getFullName());
        emg.setPatientAge(patient.getAge());
        emg.setGender(patient.getGender());
        emg.setIdentityState(EmergencyCase.IdentityState.VERIFIED);

        return emergencyRepository.save(emg);
    }

    public List<EmergencyCase> getActiveEmergencies() {
        return emergencyRepository.findTop20ByOrderByCreatedAtDesc();
    }
}
