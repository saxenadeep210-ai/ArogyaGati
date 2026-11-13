package org.arogyagati.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "hospital_beds", indexes = {
    @Index(name = "idx_beds_cat_stat", columnList = "bed_category, status")
})
public class HospitalBed {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "bed_number", nullable = false, length = 50)
    private String bedNumber;

    @Column(name = "ward_id", nullable = false, length = 50)
    private String wardId;

    @Column(name = "hospital_id", nullable = false, length = 50)
    private String hospitalId;

    @Enumerated(EnumType.STRING)
    @Column(name = "bed_category", nullable = false, length = 50)
    private BedCategory bedCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    private BedStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @UpdateTimestamp
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    public enum BedCategory {
        GENERAL, ORTHOPAEDIC, ICU, EMERGENCY, PRIVATE, ISOLATION, PAEDIATRIC
    }

    public enum BedStatus {
        AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE, CLEANING
    }

    public HospitalBed() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBedNumber() { return bedNumber; }
    public void setBedNumber(String bedNumber) { this.bedNumber = bedNumber; }

    public String getWardId() { return wardId; }
    public void setWardId(String wardId) { this.wardId = wardId; }

    public String getHospitalId() { return hospitalId; }
    public void setHospitalId(String hospitalId) { this.hospitalId = hospitalId; }

    public BedCategory getBedCategory() { return bedCategory; }
    public void setBedCategory(BedCategory bedCategory) { this.bedCategory = bedCategory; }

    public BedStatus getStatus() { return status; }
    public void setStatus(BedStatus status) { this.status = status; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
