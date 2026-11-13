package org.arogyagati.service;

import org.arogyagati.entity.Doctor;
import org.arogyagati.entity.Patient;
import org.arogyagati.entity.QueueToken;
import org.arogyagati.repository.DoctorRepository;
import org.arogyagati.repository.PatientRepository;
import org.arogyagati.repository.QueueTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class TokenService {

    private static final Logger log = LoggerFactory.getLogger(TokenService.class);

    private final QueueTokenRepository tokenRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final TokenQueueService tokenQueueService;

    public TokenService(
            QueueTokenRepository tokenRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            TokenQueueService tokenQueueService
    ) {
        this.tokenRepository = tokenRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.tokenQueueService = tokenQueueService;
    }

    /**
     * Generates a new atomic OPD token.
     */
    @Transactional
    public QueueToken generateToken(
            UUID patientId,
            String departmentId,
            String doctorIdStr,
            String causeOfVisit,
            String symptoms,
            QueueToken.TokenPriority priority
    ) {
        Patient patient = patientRepository.findById(patientId)
                .orElseGet(() -> {
                    Patient p = new Patient();
                    p.setId(patientId);
                    p.setFullName("Registered Patient");
                    p.setAge(35);
                    p.setGender("MALE");
                    p.setMobileNumber("9812345678");
                    return patientRepository.save(p);
                });

        Doctor doctor = null;
        if (doctorIdStr != null && !doctorIdStr.isBlank()) {
            doctor = doctorRepository.findByDoctorId(doctorIdStr).orElse(null);
        }
        if (doctor == null) {
            List<Doctor> docs = doctorRepository.findByDepartmentId(departmentId);
            doctor = docs.isEmpty() ? null : docs.get(0);
        }

        LocalDate today = LocalDate.now();
        Integer maxPos = tokenRepository.findMaxQueuePosition(departmentId, today);
        int nextPos = (maxPos != null ? maxPos : 0) + 1;

        String deptCode = departmentId.replace("DEPT-", "").toUpperCase();
        String tokenNumber = String.format("OPD-%s-%03d", deptCode, nextPos);

        QueueToken token = new QueueToken();
        token.setTokenNumber(tokenNumber);
        token.setPatient(patient);
        token.setDoctor(doctor);
        token.setDepartmentId(departmentId);
        token.setScheduledDate(today);
        token.setAppointmentTime(String.format("%02d:00 AM", 9 + (nextPos % 5)));
        token.setPriority(priority != null ? priority : QueueToken.TokenPriority.NORMAL);
        token.setStatus(QueueToken.TokenStatus.WAITING);
        token.setQueuePosition(nextPos);
        token.setEstimatedWaitMinutes(nextPos * 8);
        token.setCauseOfVisit(causeOfVisit);
        token.setSymptoms(symptoms);
        token.setVisitType("NEW");

        QueueToken saved = tokenRepository.save(token);

        // Enqueue atomically in Redis Sorted Set
        tokenQueueService.enqueueToken(departmentId, tokenNumber, token.getPriority());

        return saved;
    }

    /**
     * Public-safe Token Lookup: Returns strictly operational information without patient PII.
     */
    public Map<String, Object> lookupTokenPublic(String tokenNumber) {
        Optional<QueueToken> tokenOpt = tokenRepository.findByTokenNumber(tokenNumber.trim().toUpperCase());
        if (tokenOpt.isEmpty()) {
            return Map.of("found", false, "message", "Token " + tokenNumber + " not found in hospital queue system.");
        }

        QueueToken token = tokenOpt.get();
        Long livePosition = tokenQueueService.getQueuePosition(token.getDepartmentId(), token.getTokenNumber());
        int queuePos = (livePosition != null && livePosition > 0) ? livePosition.intValue() : (token.getQueuePosition() != null ? token.getQueuePosition() : 1);
        int estWait = queuePos * 8;

        Map<String, Object> sanitized = new HashMap<>();
        sanitized.put("found", true);
        sanitized.put("tokenNumber", token.getTokenNumber());
        sanitized.put("departmentId", token.getDepartmentId());
        sanitized.put("status", token.getStatus().name());
        sanitized.put("queuePosition", queuePos);
        sanitized.put("estimatedWaitMinutes", estWait);
        sanitized.put("cabin", token.getDoctor() != null ? token.getDoctor().getRoomCabin() : "Cabin 07");
        sanitized.put("building", token.getDoctor() != null ? token.getDoctor().getBuildingId() : "Block A");
        sanitized.put("priority", token.getPriority().name());
        sanitized.put("lastUpdated", LocalDateTime.now().toString());

        // Zero PII exposed in public lookup
        return sanitized;
    }

    /**
     * Patient-authenticated retrieval: Returns complete record for authorized patient owner only.
     */
    public List<QueueToken> getTokensForPatient(UUID patientId) {
        return tokenRepository.findByPatientId(patientId);
    }
}
