package org.arogyagati.repository;

import org.arogyagati.entity.QueueToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QueueTokenRepository extends JpaRepository<QueueToken, UUID> {
    Optional<QueueToken> findByTokenNumber(String tokenNumber);
    List<QueueToken> findByPatientId(UUID patientId);
    List<QueueToken> findByDepartmentIdAndScheduledDate(String departmentId, LocalDate scheduledDate);
    List<QueueToken> findByDoctorIdAndScheduledDate(UUID doctorId, LocalDate scheduledDate);
    List<QueueToken> findByDepartmentIdAndStatus(String departmentId, QueueToken.TokenStatus status);

    @Query("SELECT COUNT(t) FROM QueueToken t WHERE t.departmentId = :departmentId AND t.status IN ('REGISTERED', 'WAITING')")
    long countWaitingInDepartment(String departmentId);

    @Query("SELECT MAX(t.queuePosition) FROM QueueToken t WHERE t.departmentId = :departmentId AND t.scheduledDate = :date")
    Integer findMaxQueuePosition(String departmentId, LocalDate date);
}
