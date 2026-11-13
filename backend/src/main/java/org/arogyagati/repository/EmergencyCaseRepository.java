package org.arogyagati.repository;

import org.arogyagati.entity.EmergencyCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmergencyCaseRepository extends JpaRepository<EmergencyCase, UUID> {
    Optional<EmergencyCase> findByEmergencyToken(String emergencyToken);
    List<EmergencyCase> findByStatus(String status);
    List<EmergencyCase> findByIdentityState(EmergencyCase.IdentityState identityState);
    List<EmergencyCase> findTop20ByOrderByCreatedAtDesc();
}
