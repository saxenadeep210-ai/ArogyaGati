package org.arogyagati.repository;

import org.arogyagati.entity.QuarantinedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuarantinedFileRepository extends JpaRepository<QuarantinedFile, UUID> {
    Optional<QuarantinedFile> findBySha256Checksum(String sha256Checksum);
    List<QuarantinedFile> findByScanStatus(String scanStatus);
    List<QuarantinedFile> findByUploaderId(String uploaderId);
}
