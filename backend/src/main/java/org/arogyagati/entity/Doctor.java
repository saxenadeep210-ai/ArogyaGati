package org.arogyagati.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "doctor_id", nullable = false, unique = true, length = 50)
    private String doctorId;

    @Column(name = "department_id", nullable = false, length = 50)
    private String departmentId;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "designation_code", nullable = false, length = 50)
    private String designationCode;

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

    public Doctor() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDesignationCode() { return designationCode; }
    public void setDesignationCode(String designationCode) { this.designationCode = designationCode; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }

    public String getRoomCabin() { return roomCabin; }
    public void setRoomCabin(String roomCabin) { this.roomCabin = roomCabin; }

    public String getBuildingId() { return buildingId; }
    public void setBuildingId(String buildingId) { this.buildingId = buildingId; }

    public Integer getFloorNumber() { return floorNumber; }
    public void setFloorNumber(Integer floorNumber) { this.floorNumber = floorNumber; }

    public DoctorStatus getStatus() { return status; }
    public void setStatus(DoctorStatus status) { this.status = status; }

    public Integer getMaxDailyPatients() { return maxDailyPatients; }
    public void setMaxDailyPatients(Integer maxDailyPatients) { this.maxDailyPatients = maxDailyPatients; }

    public Integer getAvgConsultationMinutes() { return avgConsultationMinutes; }
    public void setAvgConsultationMinutes(Integer avgConsultationMinutes) { this.avgConsultationMinutes = avgConsultationMinutes; }

    public Boolean getIsAdministrativeOnly() { return isAdministrativeOnly; }
    public void setIsAdministrativeOnly(Boolean isAdministrativeOnly) { this.isAdministrativeOnly = isAdministrativeOnly; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
