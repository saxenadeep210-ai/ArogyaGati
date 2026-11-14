package org.arogyagati.service;

import org.arogyagati.entity.Doctor;
import org.arogyagati.entity.GroupChatMessage;
import org.arogyagati.entity.QueueToken;
import org.arogyagati.repository.DoctorRepository;
import org.arogyagati.repository.GroupChatMessageRepository;
import org.arogyagati.repository.QueueTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DoctorService {

    private static final Logger log = LoggerFactory.getLogger(DoctorService.class);

    private final DoctorRepository doctorRepository;
    private final QueueTokenRepository tokenRepository;
    private final GroupChatMessageRepository chatRepository;
    private final TokenQueueService tokenQueueService;

    public DoctorService(
            DoctorRepository doctorRepository,
            QueueTokenRepository tokenRepository,
            GroupChatMessageRepository chatRepository,
            TokenQueueService tokenQueueService
    ) {
        this.doctorRepository = doctorRepository;
        this.tokenRepository = tokenRepository;
        this.chatRepository = chatRepository;
        this.tokenQueueService = tokenQueueService;
    }

    /**
     * Retrieves assigned queue for doctor.
     */
    public List<QueueToken> getDoctorQueue(String doctorId) {
        Optional<Doctor> docOpt = doctorRepository.findByDoctorId(doctorId);
        if (docOpt.isPresent()) {
            return tokenRepository.findByDoctorIdAndScheduledDate(docOpt.get().getId(), LocalDate.now());
        }
        // Fallback to department queue
        return tokenRepository.findByDepartmentIdAndScheduledDate("DEPT-ORTHO", LocalDate.now());
    }

    /**
     * Calls next patient, updates status, and broadcasts announcement.
     */
    @Transactional
    public QueueToken callNextPatient(String doctorId) {
        Optional<Doctor> docOpt = doctorRepository.findByDoctorId(doctorId);
        String cabin = docOpt.map(Doctor::getRoomCabin).orElse("Cabin 04");
        String deptId = docOpt.map(Doctor::getDepartmentId).orElse("DEPT-ORTHO");

        // Use Redis sorted set or database queue head
        String calledTokenNumber = tokenQueueService.callNextPatient(deptId, cabin);

        QueueToken token;
        if (calledTokenNumber != null) {
            token = tokenRepository.findByTokenNumber(calledTokenNumber).orElse(null);
        } else {
            List<QueueToken> waiting = tokenRepository.findByDepartmentIdAndStatus(deptId, QueueToken.TokenStatus.WAITING);
            token = waiting.isEmpty() ? null : waiting.get(0);
        }

        if (token != null) {
            token.setStatus(QueueToken.TokenStatus.CALLED);
            token.setCalledAt(LocalDateTime.now());
            return tokenRepository.save(token);
        }

        return null;
    }

    /**
     * Completes consultation and saves digital prescription.
     */
    @Transactional
    public QueueToken completeConsultation(String tokenNumber, String clinicalNotes, String prescription) {
        QueueToken token = tokenRepository.findByTokenNumber(tokenNumber)
                .orElseThrow(() -> new IllegalArgumentException("Token not found: " + tokenNumber));

        token.setStatus(QueueToken.TokenStatus.COMPLETED);
        token.setClinicalNotes(clinicalNotes);
        token.setPrescription(prescription);
        token.setCompletedAt(LocalDateTime.now());

        return tokenRepository.save(token);
    }

    /**
     * Strict Server-Side Access Control for Doctor Guide Box:
     * Patients MUST NEVER receive STAFF_INTERNAL confidential messages.
     */
    public List<GroupChatMessage> getCaseGroupMessages(String caseGroupId, String requesterRole) {
        String cleanRole = requesterRole != null ? requesterRole.toUpperCase().replace("ROLE_", "") : "";
        boolean isStaffOrDoctor = "DOCTOR".equals(cleanRole)
                || "MEDICAL_STAFF".equals(cleanRole)
                || "ADMIN".equals(cleanRole);

        if (isStaffOrDoctor) {
            // Staff can view both PATIENT_VISIBLE and STAFF_INTERNAL messages
            return chatRepository.findByCaseGroupIdOrderByCreatedAtAsc(caseGroupId);
        } else {
            // Patients only receive PATIENT_VISIBLE messages
            return chatRepository.findByCaseGroupIdAndVisibilityOrderByCreatedAtAsc(
                    caseGroupId,
                    GroupChatMessage.MessageVisibility.PATIENT_VISIBLE
            );
        }
    }

    /**
     * Sends message into Guide Box. Ensures strict role-based visibility control.
     */
    @Transactional
    public GroupChatMessage sendGuideBoxMessage(
            String caseGroupId,
            UUID senderUserId,
            String senderDisplayName,
            String senderRole,
            String messageText,
            GroupChatMessage.MessageVisibility requestedVisibility
    ) {
        String cleanRole = senderRole != null ? senderRole.toUpperCase().replace("ROLE_", "") : "PATIENT";
        boolean isStaffOrDoctor = "DOCTOR".equals(cleanRole) || "MEDICAL_STAFF".equals(cleanRole) || "ADMIN".equals(cleanRole);

        // Patients are strictly prohibited from creating STAFF_INTERNAL messages
        GroupChatMessage.MessageVisibility finalVisibility = requestedVisibility;
        if (!isStaffOrDoctor) {
            finalVisibility = GroupChatMessage.MessageVisibility.PATIENT_VISIBLE;
        }
        if (finalVisibility == null) {
            finalVisibility = GroupChatMessage.MessageVisibility.PATIENT_VISIBLE;
        }

        GroupChatMessage msg = new GroupChatMessage();
        msg.setCaseGroupId(caseGroupId);
        msg.setSenderUserId(senderUserId != null ? senderUserId : UUID.randomUUID());
        msg.setSenderDisplayName(senderDisplayName != null ? senderDisplayName : "Medical Care Team");
        msg.setSenderRole(cleanRole);
        msg.setMessageText(messageText);
        msg.setVisibility(finalVisibility);
        msg.setCreatedAt(LocalDateTime.now());

        return chatRepository.save(msg);
    }

    /**
     * Lists all doctors with optional department filter.
     */
    public List<Doctor> getAllDoctors(String departmentId) {
        if (departmentId != null && !departmentId.isBlank() && !"ALL".equalsIgnoreCase(departmentId)) {
            return doctorRepository.findByDepartmentId(departmentId);
        }
        return doctorRepository.findAll();
    }
}
