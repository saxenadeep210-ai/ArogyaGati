package org.arogyagati.service;

import org.arogyagati.entity.GroupChatMessage;
import org.arogyagati.repository.DoctorRepository;
import org.arogyagati.repository.GroupChatMessageRepository;
import org.arogyagati.repository.QueueTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class DoctorGuideBoxSecurityTest {

    private GroupChatMessageRepository chatRepository;
    private DoctorService doctorService;

    @BeforeEach
    void setUp() {
        DoctorRepository docRepo = Mockito.mock(DoctorRepository.class);
        QueueTokenRepository tokenRepo = Mockito.mock(QueueTokenRepository.class);
        chatRepository = Mockito.mock(GroupChatMessageRepository.class);

        doctorService = new DoctorService(docRepo, tokenRepo, chatRepository, null);
    }

    @Test
    @DisplayName("Patient must NEVER receive STAFF_INTERNAL confidential messages from Guide Box")
    void testPatientCannotAccessInternalStaffNotes() {
        String caseGroupId = "CASE-GRP-ORTHO-101";

        GroupChatMessage publicMsg = new GroupChatMessage();
        publicMsg.setId(UUID.randomUUID());
        publicMsg.setCaseGroupId(caseGroupId);
        publicMsg.setMessageText("Please fast for 4 hours before the blood investigation.");
        publicMsg.setVisibility(GroupChatMessage.MessageVisibility.PATIENT_VISIBLE);

        GroupChatMessage internalMsg = new GroupChatMessage();
        internalMsg.setId(UUID.randomUUID());
        internalMsg.setCaseGroupId(caseGroupId);
        internalMsg.setMessageText("Confidential: Differential diagnosis indicates possible Ewing Sarcoma. Discuss during evening oncology board.");
        internalMsg.setVisibility(GroupChatMessage.MessageVisibility.STAFF_INTERNAL);

        when(chatRepository.findByCaseGroupIdOrderByCreatedAtAsc(caseGroupId))
                .thenReturn(List.of(publicMsg, internalMsg));

        when(chatRepository.findByCaseGroupIdAndVisibilityOrderByCreatedAtAsc(caseGroupId, GroupChatMessage.MessageVisibility.PATIENT_VISIBLE))
                .thenReturn(List.of(publicMsg));

        // When a PATIENT queries the endpoint:
        List<GroupChatMessage> patientMessages = doctorService.getCaseGroupMessages(caseGroupId, "ROLE_PATIENT");
        assertEquals(1, patientMessages.size());
        assertEquals(GroupChatMessage.MessageVisibility.PATIENT_VISIBLE, patientMessages.get(0).getVisibility());
        assertFalse(patientMessages.stream().anyMatch(m -> m.getVisibility() == GroupChatMessage.MessageVisibility.STAFF_INTERNAL));

        // When a DOCTOR queries the endpoint:
        List<GroupChatMessage> doctorMessages = doctorService.getCaseGroupMessages(caseGroupId, "ROLE_DOCTOR");
        assertEquals(2, doctorMessages.size());
        assertTrue(doctorMessages.stream().anyMatch(m -> m.getVisibility() == GroupChatMessage.MessageVisibility.STAFF_INTERNAL));
    }
}
