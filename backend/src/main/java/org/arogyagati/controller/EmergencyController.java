package org.arogyagati.controller;

import org.arogyagati.entity.EmergencyCase;
import org.arogyagati.service.EmergencyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/emergency", "/api/emergency"})
public class EmergencyController {

    private final EmergencyService emergencyService;

    public EmergencyController(EmergencyService emergencyService) {
        this.emergencyService = emergencyService;
    }

    @PostMapping("/register")
    public ResponseEntity<EmergencyCase> registerEmergency(@RequestBody Map<String, Object> body) {
        String ambulanceId = (String) body.get("ambulanceId");
        String patientName = (String) body.get("patientName");
        Integer patientAge = body.get("patientAge") != null ? ((Number) body.get("patientAge")).intValue() : null;
        String gender = (String) body.get("gender");
        String category = (String) body.getOrDefault("category", "TRAUMA");
        String severity = (String) body.getOrDefault("severity", "CRITICAL");
        String location = (String) body.get("incidentLocation");
        Integer eta = body.get("etaMinutes") != null ? ((Number) body.get("etaMinutes")).intValue() : 8;

        Integer pulse = body.get("pulseBpm") != null ? ((Number) body.get("pulseBpm")).intValue() : 88;
        String bp = (String) body.getOrDefault("bloodPressure", "120/80");
        Integer spo2 = body.get("oxygenSaturationPct") != null ? ((Number) body.get("oxygenSaturationPct")).intValue() : 98;
        Integer gcs = body.get("glasgowComaScale") != null ? ((Number) body.get("glasgowComaScale")).intValue() : 15;
        String photoData = (String) body.get("photoData");
        String biometricStatus = (String) body.get("biometricStatus");

        EmergencyCase created = emergencyService.registerEmergency(
                ambulanceId, patientName, patientAge, gender, category, severity,
                location, eta, pulse, bp, spo2, gcs, photoData, biometricStatus
        );
        return ResponseEntity.ok(created);
    }

    @GetMapping("/active")
    public ResponseEntity<List<EmergencyCase>> getActiveEmergencies() {
        return ResponseEntity.ok(emergencyService.getActiveEmergencies());
    }

    @PostMapping("/{id}/reconcile")
    public ResponseEntity<EmergencyCase> reconcileIdentity(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body
    ) {
        UUID verifiedPatientId = UUID.fromString(body.get("verifiedPatientId"));
        EmergencyCase reconciled = emergencyService.reconcileIdentity(id, verifiedPatientId);
        return ResponseEntity.ok(reconciled);
    }
}
