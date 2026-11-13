package org.arogyagati.repository;

import org.arogyagati.entity.DataCorrection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DataCorrectionRepository extends JpaRepository<DataCorrection, UUID> {
    Optional<DataCorrection> findByCorrectionNumber(String correctionNumber);
    List<DataCorrection> findByStatus(String status);
    List<DataCorrection> findByEntityType(String entityType);
    List<DataCorrection> findTop30ByOrderByCreatedAtDesc();
}
