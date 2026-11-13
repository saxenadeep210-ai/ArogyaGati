package org.arogyagati.service;

import org.arogyagati.entity.DataCorrection;
import org.arogyagati.repository.AuditHashChainRepository;
import org.arogyagati.repository.DataCorrectionRepository;
import org.arogyagati.security.AuditHashChainService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class DataCorrectionServiceTest {

    private DataCorrectionRepository correctionRepository;
    private AuditHashChainRepository auditRepository;
    private AuditHashChainService auditHashChainService;
    private DataCorrectionService correctionService;

    @BeforeEach
    void setUp() {
        correctionRepository = Mockito.mock(DataCorrectionRepository.class);
        auditRepository = Mockito.mock(AuditHashChainRepository.class);
        auditHashChainService = new AuditHashChainService();
        correctionService = new DataCorrectionService(correctionRepository, auditRepository, auditHashChainService);
    }

    @Test
    @DisplayName("Should prohibit user from approving their own high-risk correction (separation of duties)")
    void testProhibitSelfApprovalOnHighRisk() {
        UUID corrId = UUID.randomUUID();
        DataCorrection correction = new DataCorrection();
        correction.setId(corrId);
        correction.setCorrectionNumber("CORR-2026-0001");
        correction.setEntityType("PATIENT");
        correction.setEntityId("PAT-1001");
        correction.setFieldName("abha_number");
        correction.setPreviousValue("14-0000-0000-0000");
        correction.setProposedValue("14-1111-2222-3333");
        correction.setReason("Correction of erroneous ABHA digit as per manual national verification");
        correction.setRiskLevel("HIGH");
        correction.setStatus("PENDING");
        correction.setRequestedBy("ADMIN-RAJESH");

        when(correctionRepository.findById(corrId)).thenReturn(Optional.of(correction));

        // Attempt self-approval by same user "ADMIN-RAJESH"
        assertThrows(SecurityException.class, () -> {
            correctionService.approveCorrection(corrId, "ADMIN-RAJESH");
        });
    }

    @Test
    @DisplayName("Should permit independent second administrator to approve high-risk correction")
    void testPermitSecondPartyApproval() {
        UUID corrId = UUID.randomUUID();
        DataCorrection correction = new DataCorrection();
        correction.setId(corrId);
        correction.setCorrectionNumber("CORR-2026-0002");
        correction.setEntityType("BED");
        correction.setEntityId("BED-ICU-04");
        correction.setFieldName("status");
        correction.setPreviousValue("MAINTENANCE");
        correction.setProposedValue("AVAILABLE");
        correction.setReason("Bio-medical engineering maintenance verified and certified");
        correction.setRiskLevel("HIGH");
        correction.setStatus("PENDING");
        correction.setRequestedBy("ADMIN-RAJESH");

        when(correctionRepository.findById(corrId)).thenReturn(Optional.of(correction));
        when(correctionRepository.save(any(DataCorrection.class))).thenAnswer(i -> i.getArgument(0));

        DataCorrection approved = correctionService.approveCorrection(corrId, "ADMIN-SUPERINTENDENT");
        assertEquals("APPROVED", approved.getStatus());
        assertEquals("ADMIN-SUPERINTENDENT", approved.getApprovedBy());
        assertNotNull(approved.getApprovalTimestamp());
    }
}
