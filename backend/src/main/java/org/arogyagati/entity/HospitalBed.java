package org.arogyagati.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "hospital_beds", indexes = {
    @Index(name = "idx_beds_cat_stat", columnList = "bed_category, status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalBed {

    @Id
    @Column(name = "id", length = 50)
    private String id; // e.g. BED-ORTH-204

    @Column(name = "bed_number", nullable = false, length = 50)
    private String bedNumber;

    @Column(name = "ward_id", nullable = false, length = 50)
    private String wardId;

    @Column(name = "hospital_id", nullable = false, length = 50)
    private String hospitalId;

    @Enumerated(EnumType.STRING)
    @Column(name = "bed_category", nullable = false, length = 50)
    private BedCategory bedCategory; // GENERAL, ORTHOPAEDIC, ICU, EMERGENCY, PRIVATE, ISOLATION, PAEDIATRIC

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    private BedStatus status; // AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE, CLEANING

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
}
