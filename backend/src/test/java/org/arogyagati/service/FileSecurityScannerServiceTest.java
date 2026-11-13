package org.arogyagati.service;

import org.arogyagati.entity.QuarantinedFile;
import org.arogyagati.repository.QuarantinedFileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class FileSecurityScannerServiceTest {

    private QuarantinedFileRepository fileRepository;
    private FileSecurityScannerService scannerService;

    @BeforeEach
    void setUp() {
        fileRepository = Mockito.mock(QuarantinedFileRepository.class);
        scannerService = new FileSecurityScannerService(fileRepository);
        when(fileRepository.save(any(QuarantinedFile.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    @DisplayName("Should approve valid PDF file matching header magic bytes")
    void testApproveValidPdf() {
        byte[] validPdfBytes = "%PDF-1.7 clinical report content".getBytes(StandardCharsets.UTF_8);

        QuarantinedFile result = scannerService.scanAndQuarantine(
                "blood_test_report.pdf",
                "application/pdf",
                validPdfBytes,
                "DOC-1001",
                "ROLE_DOCTOR",
                "MEDICAL_REPORT",
                "REPORT-001"
        );

        assertEquals("CLEAN", result.getScanStatus());
        assertNotNull(result.getSha256Checksum());
        assertTrue(result.getScanReport().contains("Zero malicious payload signatures"));
    }

    @Test
    @DisplayName("Should reject file when magic bytes do not match declared extension")
    void testRejectMismatchedMagicBytes() {
        // An executable or script disguised as a PDF
        byte[] fakePdfBytes = new byte[] { 0x4D, 0x5A, (byte) 0x90, 0x00, 0x03, 0x00, 0x00, 0x00 };

        QuarantinedFile result = scannerService.scanAndQuarantine(
                "malicious_disguised.pdf",
                "application/pdf",
                fakePdfBytes,
                "ATTACKER",
                "ROLE_PATIENT",
                "ATTACHMENT",
                "ATT-001"
        );

        assertEquals("REJECTED", result.getScanStatus());
        assertTrue(result.getScanReport().contains("CRITICAL: File header magic bytes do not match"));
    }

    @Test
    @DisplayName("Should block forbidden executable file extensions")
    void testBlockExecutableExtensions() {
        byte[] exeBytes = "echo 'hack'".getBytes(StandardCharsets.UTF_8);

        assertThrows(SecurityException.class, () -> {
            scannerService.scanAndQuarantine(
                    "payload.exe",
                    "application/octet-stream",
                    exeBytes,
                    "ATTACKER",
                    "ROLE_PATIENT",
                    "ATTACHMENT",
                    "ATT-002"
            );
        });
    }
}
