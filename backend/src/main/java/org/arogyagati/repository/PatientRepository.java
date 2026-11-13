package org.arogyagati.repository;

import org.arogyagati.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    Optional<Patient> findByMobileNumber(String mobileNumber);
    Optional<Patient> findByAbhaNumber(String abhaNumber);
    Optional<Patient> findByAbhaAddress(String abhaAddress);
}
