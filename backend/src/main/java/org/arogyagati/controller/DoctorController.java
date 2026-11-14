package org.arogyagati.controller;

import org.arogyagati.entity.Doctor;
import org.arogyagati.entity.GroupChatMessage;
import org.arogyagati.entity.QueueToken;
import org.arogyagati.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/doctors", "/api/doctors"})
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors(@RequestParam(required = false) String departmentId) {
        return ResponseEntity.ok(doctorService.getAllDoctors(departmentId));
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

    @PostMapping("/guide-box/send")
    public ResponseEntity<GroupChatMessage> sendGuideBoxMessage(
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String caseGroupId = body.get("caseGroupId");
        String messageText = body.get("messageText");
        String requestedVisibilityStr = body.getOrDefault("visibility", "PATIENT_VISIBLE");

        GroupChatMessage.MessageVisibility visibility = "STAFF_INTERNAL".equalsIgnoreCase(requestedVisibilityStr)
                ? GroupChatMessage.MessageVisibility.STAFF_INTERNAL
                : GroupChatMessage.MessageVisibility.PATIENT_VISIBLE;

        String senderRole = "ROLE_PATIENT";
        String senderDisplayName = body.getOrDefault("senderDisplayName", "Citizen / Patient");
        UUID senderId = UUID.randomUUID();

        if (authentication != null) {
            senderRole = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("ROLE_PATIENT");
            try {
                senderId = UUID.fromString(authentication.getName());
            } catch (Exception ignored) {}
        }

        GroupChatMessage created = doctorService.sendGuideBoxMessage(
                caseGroupId, senderId, senderDisplayName, senderRole, messageText, visibility
        );
        return ResponseEntity.ok(created);
    }
}
