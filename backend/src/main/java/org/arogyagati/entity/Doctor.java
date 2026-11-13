package org.arogyagati.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "doctor_id", nullable = false, unique = true, length = 50)
    private String doctorId; // e.g. DOC-ORTHO-1001

    @Column(name = "department_id", nullable = false, length = 50)
    private String departmentId;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "designation_code", nullable = false, length = 50)
    private String designationCode; // HOD, ASSOCIATE_PROFESSOR, ASSISTANT_PROFESSOR, JUNIOR_RESIDENT

    @Column(name = "qualification", length = 200)
    private String qualification;

    @Column(name = "specialization", length = 250)
    private String specialization;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "room_cabin", length = 50)
    private String roomCabin;

    @Column(name = "building_id", length = 50)
    private String buildingId;

    @Column(name = "floor_number")
    private Integer floorNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    private DoctorStatus status;

    @Column(name = "max_daily_patients")
    private Integer maxDailyPatients;

    @Column(name = "avg_consultation_minutes")
    private Integer avgConsultationMinutes;

    @Column(name = "is_administrative_only")
    private Boolean isAdministrativeOnly;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum DoctorStatus {
        AVAILABLE, IN_CONSULTATION, ON_ROUND, OFF_DUTY
    }
}
