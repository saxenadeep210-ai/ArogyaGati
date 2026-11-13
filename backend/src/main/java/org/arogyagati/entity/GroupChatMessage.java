package org.arogyagati.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "group_chat_messages", indexes = {
    @Index(name = "idx_msgs_group_time", columnList = "case_group_id, created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "case_group_id", nullable = false, length = 50)
    private String caseGroupId;

    @Column(name = "sender_user_id", nullable = false)
    private UUID senderUserId;

    @Column(name = "sender_role", nullable = false, length = 50)
    private String senderRole; // PATIENT, DOCTOR, SYSTEM

    @Column(name = "sender_display_name", nullable = false, length = 150)
    private String senderDisplayName; // MASKED ID: DOC-CARDIO-8892 - Senior Resident

    @Column(name = "message_text", nullable = false, columnDefinition = "TEXT")
    private String messageText;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", length = 30)
    private MessageVisibility visibility; // PATIENT_VISIBLE or STAFF_INTERNAL

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum MessageVisibility {
        PATIENT_VISIBLE, STAFF_INTERNAL
    }
}
