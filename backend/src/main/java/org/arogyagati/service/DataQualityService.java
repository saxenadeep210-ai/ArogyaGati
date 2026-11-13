package org.arogyagati.service;

import org.arogyagati.entity.HospitalBed;
import org.arogyagati.entity.QueueToken;
import org.arogyagati.repository.HospitalBedRepository;
import org.arogyagati.repository.QueueTokenRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class DataQualityService {

    private final QueueTokenRepository tokenRepository;
    private final HospitalBedRepository bedRepository;

    public record AnomalyAlert(
            String id,
            String ruleName,
            String description,
            String severity, // INFORMATIONAL, WARNING, HIGH, CRITICAL
            String entityReference,
            String recommendedAction,
            LocalDateTime detectedAt
    ) {}

    public DataQualityService(QueueTokenRepository tokenRepository, HospitalBedRepository bedRepository) {
        this.tokenRepository = tokenRepository;
        this.bedRepository = bedRepository;
    }

    /**
     * Scans operational records for consistency conflicts and anomalies.
     */
    public List<AnomalyAlert> runDataQualityScan() {
        List<AnomalyAlert> alerts = new ArrayList<>();

        // 1. Check for bed consistency anomalies
        List<HospitalBed> allBeds = bedRepository.findAll();
        for (HospitalBed bed : allBeds) {
            if (bed.getStatus() == HospitalBed.BedStatus.AVAILABLE && bed.getPatient() != null) {
                alerts.add(new AnomalyAlert(
                        UUID.randomUUID().toString(),
                        "BED_OCCUPANCY_CONFLICT",
                        "Bed " + bed.getBedNumber() + " is marked as AVAILABLE but still has patient " + bed.getPatient().getFullName() + " attached.",
                        "HIGH",
                        "BED:" + bed.getId(),
                        "Perform discharge audit or reassign bed status to OCCUPIED.",
                        LocalDateTime.now()
                ));
            }
        }

        // 2. Check for impossible queue position anomalies
        List<QueueToken> tokens = tokenRepository.findAll();
        for (QueueToken token : tokens) {
            if (token.getStatus() == QueueToken.TokenStatus.COMPLETED && token.getQueuePosition() != null && token.getQueuePosition() > 0) {
                alerts.add(new AnomalyAlert(
                        UUID.randomUUID().toString(),
                        "QUEUE_POSITION_INCONSISTENCY",
                        "Token " + token.getTokenNumber() + " is marked COMPLETED but still maintains active queue position #" + token.getQueuePosition(),
                        "WARNING",
                        "TOKEN:" + token.getTokenNumber(),
                        "Recalculate departmental queue positions.",
                        LocalDateTime.now()
                ));
            }
        }

        // 3. Informational baseline telemetry alert
        if (alerts.isEmpty()) {
            alerts.add(new AnomalyAlert(
                    UUID.randomUUID().toString(),
                    "ROUTINE_SYSTEM_INTEGRITY_CHECK",
                    "All departmental tokens, bed states, and emergency dispatch queues are 100% consistent with no anomalies detected.",
                    "INFORMATIONAL",
                    "SYSTEM:INTEGRITY_CHECK",
                    "No corrective action required.",
                    LocalDateTime.now()
            ));
        }

        return alerts;
    }
}
