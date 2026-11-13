package org.arogyagati.controller;

import org.arogyagati.entity.DataCorrection;
import org.arogyagati.service.BedService;
import org.arogyagati.service.DataCorrectionService;
import org.arogyagati.service.DataQualityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/admin", "/api/admin"})
public class AdminController {

    private final DataQualityService dataQualityService;
    private final DataCorrectionService dataCorrectionService;
    private final BedService bedService;

    public AdminController(
            DataQualityService dataQualityService,
            DataCorrectionService dataCorrectionService,
            BedService bedService
    ) {
        this.dataQualityService = dataQualityService;
        this.dataCorrectionService = dataCorrectionService;
        this.bedService = bedService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        Map<String, Object> bedMetrics = bedService.getAggregatedBedMetrics();
        return ResponseEntity.ok(Map.of(
                "hospitalName", "AIIMS New Delhi Central Hospital",
                "bedTelemetry", bedMetrics,
                "securityClearanceLevel", 4,
                "auditIntegrity", "TAMPER_FREE",
                "activeAmbulances", 16
        ));
    }

    @GetMapping("/data-quality")
    public ResponseEntity<List<DataQualityService.AnomalyAlert>> getDataQualityAlerts() {
        return ResponseEntity.ok(dataQualityService.runDataQualityScan());
    }

    @PostMapping("/corrections/propose")
    public ResponseEntity<DataCorrection> proposeCorrection(
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String entityType = body.get("entityType");
        String entityId = body.get("entityId");
        String fieldName = body.get("fieldName");
        String prevVal = body.get("previousValue");
        String proposedVal = body.get("proposedValue");
        String reason = body.get("reason");
        String riskLevel = body.getOrDefault("riskLevel", "MEDIUM");
        String actor = (authentication != null) ? authentication.getName() : "ADMIN-01";

        DataCorrection created = dataCorrectionService.submitCorrection(
                entityType, entityId, fieldName, prevVal, proposedVal, reason, riskLevel, actor
        );
        return ResponseEntity.ok(created);
    }

    @PostMapping("/corrections/{id}/approve")
    public ResponseEntity<DataCorrection> approveCorrection(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String approver = (authentication != null) ? authentication.getName() : "ADMIN-SUPERINTENDENT";
        return ResponseEntity.ok(dataCorrectionService.approveCorrection(id, approver));
    }

    @PostMapping("/corrections/{id}/reject")
    public ResponseEntity<DataCorrection> rejectCorrection(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String rejector = (authentication != null) ? authentication.getName() : "ADMIN-SUPERINTENDENT";
        String reason = body.getOrDefault("rejectionReason", "Not clinically or administratively justified.");
        return ResponseEntity.ok(dataCorrectionService.rejectCorrection(id, rejector, reason));
    }

    @GetMapping("/corrections")
    public ResponseEntity<List<DataCorrection>> getAllCorrections() {
        return ResponseEntity.ok(dataCorrectionService.getAllCorrections());
    }
}
