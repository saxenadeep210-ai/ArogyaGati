package org.arogyagati.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "data_corrections")
public class DataCorrection {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "correction_number", nullable = false, unique = true, length = 50)
    private String correctionNumber;

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType; // PATIENT, TOKEN, BED, EMERGENCY, DOCTOR, DEPARTMENT

    @Column(name = "entity_id", nullable = false, length = 100)
    private String entityId;

    @Column(name = "field_name", nullable = false, length = 100)
    private String fieldName;

    @Column(name = "previous_value", columnDefinition = "TEXT")
    private String previousValue;

    @Column(name = "proposed_value", nullable = false, columnDefinition = "TEXT")
    private String proposedValue;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "risk_level", length = 20)
    private String riskLevel = "MEDIUM"; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "status", length = 30)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, APPLIED

    @Column(name = "requested_by", nullable = false, length = 100)
    private String requestedBy;

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    @Column(name = "approval_timestamp")
    private LocalDateTime approvalTimestamp;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public DataCorrection() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCorrectionNumber() { return correctionNumber; }
    public void setCorrectionNumber(String correctionNumber) { this.correctionNumber = correctionNumber; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public String getFieldName() { return fieldName; }
    public void setFieldName(String fieldName) { this.fieldName = fieldName; }

    public String getPreviousValue() { return previousValue; }
    public void setPreviousValue(String previousValue) { this.previousValue = previousValue; }

    public String getProposedValue() { return proposedValue; }
    public void setProposedValue(String proposedValue) { this.proposedValue = proposedValue; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public LocalDateTime getApprovalTimestamp() { return approvalTimestamp; }
    public void setApprovalTimestamp(LocalDateTime approvalTimestamp) { this.approvalTimestamp = approvalTimestamp; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
