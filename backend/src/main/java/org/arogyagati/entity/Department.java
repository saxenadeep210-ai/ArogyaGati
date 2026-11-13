package org.arogyagati.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "departments")
public class Department {

    @Id
    @Column(name = "id", length = 50)
    private String id; // e.g. DEPT-ORTHO

    @Column(name = "hospital_id", nullable = false, length = 50)
    private String hospitalId;

    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code; // ORTHO

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "hindi_name", length = 200)
    private String hindiName;

    @Column(name = "building_id", length = 50)
    private String buildingId;

    @Column(name = "floor_number")
    private Integer floorNumber;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Department() {}

    public Department(String id, String hospitalId, String code, String name, String hindiName, String buildingId, Integer floorNumber, String description) {
        this.id = id;
        this.hospitalId = hospitalId;
        this.code = code;
        this.name = name;
        this.hindiName = hindiName;
        this.buildingId = buildingId;
        this.floorNumber = floorNumber;
        this.description = description;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getHospitalId() { return hospitalId; }
    public void setHospitalId(String hospitalId) { this.hospitalId = hospitalId; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getHindiName() { return hindiName; }
    public void setHindiName(String hindiName) { this.hindiName = hindiName; }

    public String getBuildingId() { return buildingId; }
    public void setBuildingId(String buildingId) { this.buildingId = buildingId; }

    public Integer getFloorNumber() { return floorNumber; }
    public void setFloorNumber(Integer floorNumber) { this.floorNumber = floorNumber; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
