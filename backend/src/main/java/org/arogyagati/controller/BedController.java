package org.arogyagati.controller;

import org.arogyagati.entity.HospitalBed;
import org.arogyagati.service.BedService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/beds", "/api/beds"})
public class BedController {

    private final BedService bedService;

    public BedController(BedService bedService) {
        this.bedService = bedService;
    }

    @GetMapping
    public ResponseEntity<List<HospitalBed>> getAllBeds() {
        return ResponseEntity.ok(bedService.getAllBeds());
    }

    @GetMapping("/available")
    public ResponseEntity<List<HospitalBed>> getAvailableBeds(
            @RequestParam(required = false) HospitalBed.BedCategory category
    ) {
        return ResponseEntity.ok(bedService.getAvailableBeds(category));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<HospitalBed> updateBedStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        HospitalBed.BedStatus status = HospitalBed.BedStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(bedService.updateBedStatus(id, status));
    }
}
