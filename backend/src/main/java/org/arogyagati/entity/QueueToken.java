package org.arogyagati.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "queue_tokens", indexes = {
    @Index(name = "idx_tokens_dept_status", columnList = "department_id, status"),
    @Index(name = "idx_tokens_doc_date", columnList = "doctor_id, scheduled_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueueToken {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "token_number", nullable = false, unique = true, length = 50)
    private String tokenNumber; // e.g. OPD-ORTHO-042 or EMG-RED-008

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "department_id", nullable = false, length = 50)
    private String departmentId;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "appointment_time", length = 20)
    private String appointmentTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 20)
    private TokenPriority priority; // NORMAL, URGENT, EMERGENCY

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    private TokenStatus status; // REGISTERED, WAITING, CALLED, IN_CONSULTATION, COMPLETED, CANCELLED, NO_SHOW

    @Column(name = "queue_position")
    private Integer queuePosition;

    @Column(name = "estimated_wait_minutes")
    private Integer estimatedWaitMinutes;

    @Column(name = "cause_of_visit", columnDefinition = "TEXT")
    private String causeOfVisit;

    @Column(name = "symptoms", columnDefinition = "TEXT")
    private String symptoms;

    @Column(name = "visit_type", length = 20)
    private String visitType; // NEW, FOLLOW_UP

    @Column(name = "case_group_id", length = 50)
    private String caseGroupId;

    @Column(name = "clinical_notes", columnDefinition = "TEXT")
    private String clinicalNotes;

    @Column(name = "prescription", columnDefinition = "TEXT")
    private String prescription;

    @Column(name = "called_at")
    private LocalDateTime calledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum TokenPriority {
        NORMAL, URGENT, EMERGENCY
    }

    public enum TokenStatus {
        REGISTERED, WAITING, CALLED, IN_CONSULTATION, COMPLETED, CANCELLED, NO_SHOW
    }
}
