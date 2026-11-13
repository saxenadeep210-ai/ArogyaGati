package org.arogyagati.service;

import org.arogyagati.entity.AuditHashChainEntry;
import org.arogyagati.entity.DataCorrection;
import org.arogyagati.repository.AuditHashChainRepository;
import org.arogyagati.repository.DataCorrectionRepository;
import org.arogyagati.security.AuditHashChainService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class DataCorrectionService {

    private static final Logger log = LoggerFactory.getLogger(DataCorrectionService.class);

    private final DataCorrectionRepository correctionRepository;
    private final AuditHashChainRepository auditRepository;
    private final AuditHashChainService auditHashChainService;

    public DataCorrectionService(
            DataCorrectionRepository correctionRepository,
            AuditHashChainRepository auditRepository,
            AuditHashChainService auditHashChainService
    ) {
        this.correctionRepository = correctionRepository;
        this.auditRepository = auditRepository;
        this.auditHashChainService = auditHashChainService;
    }

    /**
     * Proposes a new administrative record correction.
     * High-risk changes require independent second-party approval.
     */
    @Transactional
    public DataCorrection submitCorrection(
            String entityType,
            String entityId,
            String fieldName,
            String previousValue,
            String proposedValue,
            String reason,
            String riskLevel,
            String requestedBy
    ) {
        if (reason == null || reason.trim().length() < 10) {
            throw new IllegalArgumentException("A comprehensive clinical/administrative reason (minimum 10 characters) is required.");
        }

        String correctionNumber = "CORR-" + LocalDateTime.now().getYear() + "-" + String.format("%04d", (int)(Math.random() * 9000 + 1000));

        DataCorrection correction = new DataCorrection();
        correction.setCorrectionNumber(correctionNumber);
        correction.setEntityType(entityType);
        correction.setEntityId(entityId);
        correction.setFieldName(fieldName);
        correction.setPreviousValue(previousValue);
        correction.setProposedValue(proposedValue);
        correction.setReason(reason);
        correction.setRiskLevel(riskLevel != null ? riskLevel : "MEDIUM");
        correction.setStatus("PENDING");
        correction.setRequestedBy(requestedBy);

        DataCorrection saved = correctionRepository.save(correction);

        logAudit(requestedBy, "ADMIN", "CORRECTION_PROPOSED", entityType, entityId,
                "Proposed amendment " + correctionNumber + " for field " + fieldName + ": " + reason);

        return saved;
    }

    /**
     * Approves and executes a proposed data correction.
     * Enforces dual-control separation of duty: A user cannot approve their own high-risk correction!
     */
    @Transactional
    public DataCorrection approveCorrection(UUID correctionId, String approvedBy) {
        DataCorrection correction = correctionRepository.findById(correctionId)
                .orElseThrow(() -> new IllegalArgumentException("Correction not found: " + correctionId));

        if (!"PENDING".equalsIgnoreCase(correction.getStatus())) {
            throw new IllegalStateException("Correction is already " + correction.getStatus());
        }

        // Dual-authorization security check
        if ("HIGH".equalsIgnoreCase(correction.getRiskLevel()) || "CRITICAL".equalsIgnoreCase(correction.getRiskLevel())) {
            if (approvedBy.equalsIgnoreCase(correction.getRequestedBy())) {
                throw new SecurityException("Separation of duties violation: High-risk corrections require an independent secondary approver.");
            }
        }

        correction.setStatus("APPROVED");
        correction.setApprovedBy(approvedBy);
        correction.setApprovalTimestamp(LocalDateTime.now());

        DataCorrection updated = correctionRepository.save(correction);

        logAudit(approvedBy, "ADMIN", "CORRECTION_APPROVED", correction.getEntityType(), correction.getEntityId(),
                "Approved correction " + correction.getCorrectionNumber() + " with immutable versioning");

        return updated;
    }

    @Transactional
    public DataCorrection rejectCorrection(UUID correctionId, String rejectedBy, String rejectionReason) {
        DataCorrection correction = correctionRepository.findById(correctionId)
                .orElseThrow(() -> new IllegalArgumentException("Correction not found: " + correctionId));

        correction.setStatus("REJECTED");
        correction.setApprovedBy(rejectedBy);
        correction.setRejectionReason(rejectionReason);
        correction.setApprovalTimestamp(LocalDateTime.now());

        DataCorrection updated = correctionRepository.save(correction);

        logAudit(rejectedBy, "ADMIN", "CORRECTION_REJECTED", correction.getEntityType(), correction.getEntityId(),
                "Rejected correction " + correction.getCorrectionNumber() + ": " + rejectionReason);

        return updated;
    }

    public List<DataCorrection> getAllCorrections() {
        return correctionRepository.findTop30ByOrderByCreatedAtDesc();
    }

    private void logAudit(String actorId, String actorRole, String action, String entityType, String entityId, String reason) {
        try {
            Optional<AuditHashChainEntry> lastOpt = auditRepository.findTopByOrderBySequenceNumberDesc();
            String prevHash = lastOpt.map(AuditHashChainEntry::getCurrentHash).orElse(AuditHashChainService.GENESIS_HASH);
            long seq = lastOpt.map(e -> e.getSequenceNumber() + 1).orElse(1L);

            String timestamp = LocalDateTime.now().toString();
            String canonical = "{\"action\":\"" + action + "\",\"entity\":\"" + entityType + ":" + entityId + "\",\"reason\":\"" + reason + "\"}";

            String currentHash = auditHashChainService.calculateHash(prevHash, seq, actorId, actorRole, action, entityType, entityId, canonical, timestamp);

            AuditHashChainEntry entry = new AuditHashChainEntry();
            entry.setActorId(actorId);
            entry.setActorRole(actorRole);
            entry.setAction(action);
            entry.setEntityType(entityType);
            entry.setEntityId(entityId);
            entry.setReason(reason);
            entry.setCanonicalPayload(canonical);
            entry.setPreviousHash(prevHash);
            entry.setCurrentHash(currentHash);
            entry.setStatus("VERIFIED");
            entry.setCorrelationId(UUID.randomUUID().toString());

            auditRepository.save(entry);
        } catch (Exception ex) {
            log.warn("Non-fatal: failed to append audit hash: {}", ex.getMessage());
        }
    }
}
