package org.arogyagati.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "quarantined_files", indexes = {
    @Index(name = "idx_quarantine_checksum", columnList = "sha256_checksum"),
    @Index(name = "idx_quarantine_status", columnList = "scan_status")
})
public class QuarantinedFile {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    @Column(name = "stored_filename", nullable = false)
    private String storedFilename;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Column(name = "sha256_checksum", nullable = false, length = 64)
    private String sha256Checksum;

    @Column(name = "scan_status", length = 30)
    private String scanStatus = "PENDING_SCAN"; // UPLOADED, PENDING_SCAN, CLEAN, QUARANTINED, REJECTED

    @Column(name = "scan_engine", length = 50)
    private String scanEngine = "HEURISTIC_MAGIC_CLAMAV";

    @Column(name = "scan_report", columnDefinition = "TEXT")
    private String scanReport;

    @Column(name = "uploader_id", length = 100)
    private String uploaderId;

    @Column(name = "uploader_role", length = 50)
    private String uploaderRole;

    @Column(name = "entity_reference_type", length = 50)
    private String entityReferenceType; // MEDICAL_REPORT, PRESCRIPTION_SCAN, LAB_ATTACHMENT

    @Column(name = "entity_reference_id", length = 100)
    private String entityReferenceId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "scanned_at")
    private LocalDateTime scannedAt;

    public QuarantinedFile() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }

    public String getStoredFilename() { return storedFilename; }
    public void setStoredFilename(String storedFilename) { this.storedFilename = storedFilename; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public String getSha256Checksum() { return sha256Checksum; }
    public void setSha256Checksum(String sha256Checksum) { this.sha256Checksum = sha256Checksum; }

    public String getScanStatus() { return scanStatus; }
    public void setScanStatus(String scanStatus) { this.scanStatus = scanStatus; }

    public String getScanEngine() { return scanEngine; }
    public void setScanEngine(String scanEngine) { this.scanEngine = scanEngine; }

    public String getScanReport() { return scanReport; }
    public void setScanReport(String scanReport) { this.scanReport = scanReport; }

    public String getUploaderId() { return uploaderId; }
    public void setUploaderId(String uploaderId) { this.uploaderId = uploaderId; }

    public String getUploaderRole() { return uploaderRole; }
    public void setUploaderRole(String uploaderRole) { this.uploaderRole = uploaderRole; }

    public String getEntityReferenceType() { return entityReferenceType; }
    public void setEntityReferenceType(String entityReferenceType) { this.entityReferenceType = entityReferenceType; }

    public String getEntityReferenceId() { return entityReferenceId; }
    public void setEntityReferenceId(String entityReferenceId) { this.entityReferenceId = entityReferenceId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getScannedAt() { return scannedAt; }
    public void setScannedAt(LocalDateTime scannedAt) { this.scannedAt = scannedAt; }
}
