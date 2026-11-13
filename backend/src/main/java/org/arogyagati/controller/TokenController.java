package org.arogyagati.controller;

import org.arogyagati.entity.QueueToken;
import org.arogyagati.service.DoctorService;
import org.arogyagati.service.TokenService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/tokens", "/api/tokens"})
public class TokenController {

    private final TokenService tokenService;
    private final DoctorService doctorService;

    public TokenController(TokenService tokenService, DoctorService doctorService) {
        this.tokenService = tokenService;
        this.doctorService = doctorService;
    }

    @PostMapping("/generate")
    public ResponseEntity<QueueToken> generateToken(@RequestBody Map<String, Object> body, Authentication authentication) {
        String patientIdStr = (String) body.get("patientId");
        UUID patientId;
        try {
            patientId = (patientIdStr != null) ? UUID.fromString(patientIdStr) : UUID.randomUUID();
        } catch (Exception e) {
            patientId = UUID.randomUUID();
        }

        String deptId = (String) body.getOrDefault("departmentId", "DEPT-ORTHO");
        String doctorId = (String) body.get("doctorId");
        String cause = (String) body.get("causeOfVisit");
        String symptoms = (String) body.get("symptoms");
        String priorityStr = (String) body.getOrDefault("priority", "NORMAL");

        QueueToken.TokenPriority priority = "EMERGENCY".equalsIgnoreCase(priorityStr)
                ? QueueToken.TokenPriority.EMERGENCY
                : ("URGENT".equalsIgnoreCase(priorityStr) ? QueueToken.TokenPriority.URGENT : QueueToken.TokenPriority.NORMAL);

        QueueToken created = tokenService.generateToken(patientId, deptId, doctorId, cause, symptoms, priority);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/lookup/{tokenNumber}")
    public ResponseEntity<Map<String, Object>> lookupTokenPublic(@PathVariable String tokenNumber) {
        return ResponseEntity.ok(tokenService.lookupTokenPublic(tokenNumber));
    }

    @GetMapping("/my-active")
    public ResponseEntity<List<QueueToken>> getMyActiveTokens(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            UUID patientId = UUID.fromString(authentication.getName());
            return ResponseEntity.ok(tokenService.getTokensForPatient(patientId));
        } catch (Exception e) {
            // Demo fallback
            return ResponseEntity.ok(List.of());
        }
    }

    @PostMapping("/call-next")
    public ResponseEntity<QueueToken> callNext(@RequestParam(defaultValue = "DOC-ORTHO-1001") String doctorId) {
        QueueToken called = doctorService.callNextPatient(doctorId);
        if (called != null) {
            return ResponseEntity.ok(called);
        }
        return ResponseEntity.noContent().build();
    }
}
