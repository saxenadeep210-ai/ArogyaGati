package org.arogyagati.repository;

import org.arogyagati.entity.AuditHashChainEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuditHashChainRepository extends JpaRepository<AuditHashChainEntry, UUID> {
    Optional<AuditHashChainEntry> findTopByOrderBySequenceNumberDesc();
    List<AuditHashChainEntry> findAllByOrderBySequenceNumberAsc();
    Page<AuditHashChainEntry> findByActorId(String actorId, Pageable pageable);
    Page<AuditHashChainEntry> findByEntityType(String entityType, Pageable pageable);
    Page<AuditHashChainEntry> findByAction(String action, Pageable pageable);

    @Query("SELECT a FROM AuditHashChainEntry a WHERE (:actor IS NULL OR a.actorId = :actor) " +
           "AND (:entityType IS NULL OR a.entityType = :entityType) " +
           "AND (:action IS NULL OR a.action = :action) ORDER BY a.sequenceNumber DESC")
    Page<AuditHashChainEntry> searchAuditLogs(String actor, String entityType, String action, Pageable pageable);
}
