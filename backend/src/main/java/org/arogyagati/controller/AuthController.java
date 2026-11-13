package org.arogyagati.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.arogyagati.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/v1/auth", "/api/auth"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login-password")
    public ResponseEntity<AuthService.AuthResponse> loginPassword(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String identifier = body.get("identifier");
        String password = body.get("password");
        String expectedRole = body.getOrDefault("role", "PATIENT");
        String ip = request.getRemoteAddr();

        AuthService.AuthResponse response = authService.authenticatePassword(identifier, password, expectedRole, ip);
        return ResponseEntity.ok(response);
    }

    @PostMapping({"/otp/send", "/{role}/send-otp"})
    public ResponseEntity<Map<String, Object>> sendOtp(
            @PathVariable(required = false) String role,
            @RequestBody Map<String, String> body,
            HttpServletRequest request
    ) {
        String identifier = body.getOrDefault("identifier", body.get("mobile"));
        String finalRole = (role != null) ? role : body.getOrDefault("role", "PATIENT");
        String ip = request.getRemoteAddr();

        Map<String, Object> response = authService.sendMobileOtp(identifier, finalRole, ip);
        return ResponseEntity.ok(response);
    }

    @PostMapping({"/otp/verify", "/{role}/verify-otp"})
    public ResponseEntity<AuthService.AuthResponse> verifyOtp(
            @PathVariable(required = false) String role,
            @RequestBody Map<String, String> body,
            HttpServletRequest request
    ) {
        String mobile = body.getOrDefault("identifier", body.get("mobile"));
        String otp = body.get("otp");
        String finalRole = (role != null) ? role : body.getOrDefault("role", "PATIENT");
        String name = body.get("name");
        String abhaId = body.get("abhaId");
        String ip = request.getRemoteAddr();

        AuthService.AuthResponse response = authService.verifyMobileOtp(mobile, otp, finalRole, name, abhaId, ip);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/passkey/challenge")
    public ResponseEntity<Map<String, Object>> getPasskeyChallenge(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "citizen");
        return ResponseEntity.ok(authService.generateWebAuthnChallenge(username));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        return ResponseEntity.ok(Map.of("success", true, "message", "User session securely terminated."));
    }
}
