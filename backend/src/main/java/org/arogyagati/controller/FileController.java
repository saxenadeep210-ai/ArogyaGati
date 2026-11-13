package org.arogyagati.controller;

import org.arogyagati.entity.QuarantinedFile;
import org.arogyagati.service.FileSecurityScannerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/v1/files", "/api/files"})
public class FileController {

    private final FileSecurityScannerService scannerService;

    public FileController(FileSecurityScannerService scannerService) {
        this.scannerService = scannerService;
    }

    @PostMapping("/upload")
    public ResponseEntity<QuarantinedFile> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "MEDICAL_REPORT") String entityType,
            @RequestParam(required = false) String entityId,
            Authentication authentication
    ) {
        try {
            String uploader = (authentication != null) ? authentication.getName() : "PATIENT-USER";
            String role = (authentication != null && !authentication.getAuthorities().isEmpty())
                    ? authentication.getAuthorities().iterator().next().getAuthority()
                    : "ROLE_PATIENT";

            QuarantinedFile result = scannerService.scanAndQuarantine(
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getBytes(),
                    uploader,
                    role,
                    entityType,
                    entityId != null ? entityId : "GEN-REF"
            );
            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/quarantine")
    public ResponseEntity<List<QuarantinedFile>> getQuarantinedFiles() {
        return ResponseEntity.ok(scannerService.getAllQuarantinedFiles());
    }
}
