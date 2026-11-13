package org.arogyagati.repository;

import org.arogyagati.entity.HospitalBed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HospitalBedRepository extends JpaRepository<HospitalBed, String> {
    List<HospitalBed> findByStatus(HospitalBed.BedStatus status);
    List<HospitalBed> findByBedCategory(HospitalBed.BedCategory category);
    long countByStatus(HospitalBed.BedStatus status);
    long countByBedCategoryAndStatus(HospitalBed.BedCategory category, HospitalBed.BedStatus status);
}
