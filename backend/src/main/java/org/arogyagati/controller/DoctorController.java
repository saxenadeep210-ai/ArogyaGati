package org.arogyagati.controller;

import org.arogyagati.entity.GroupChatMessage;
import org.arogyagati.entity.QueueToken;
import org.arogyagati.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/doctors", "/api/doctors"})
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping("/{doctorId}/queue")
    public ResponseEntity<List<QueueToken>> getDoctorQueue(@PathVariable String doctorId) {
        return ResponseEntity.ok(doctorService.getDoctorQueue(doctorId));
    }

    @PostMapping("/complete-consultation")
    public ResponseEntity<QueueToken> completeConsultation(@RequestBody Map<String, String> body) {
        String tokenNumber = body.get("tokenNumber");
        String clinicalNotes = body.get("clinicalNotes");
        String prescription = body.get("prescription");

        QueueToken updated = doctorService.completeConsultation(tokenNumber, clinicalNotes, prescription);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/guide-box/{caseGroupId}")
    public ResponseEntity<List<GroupChatMessage>> getGuideBoxMessages(
            @PathVariable String caseGroupId,
            Authentication authentication
    ) {
        String role = "PATIENT";
        if (authentication != null) {
            role = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("PATIENT");
        }
        return ResponseEntity.ok(doctorService.getCaseGroupMessages(caseGroupId, role));
    }
}
