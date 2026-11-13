package org.arogyagati.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "group_chat_messages", indexes = {
    @Index(name = "idx_msgs_group_time", columnList = "case_group_id, created_at")
})
public class GroupChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "case_group_id", nullable = false, length = 50)
    private String caseGroupId;

    @Column(name = "sender_user_id", nullable = false)
    private UUID senderUserId;

    @Column(name = "sender_role", nullable = false, length = 50)
    private String senderRole;

    @Column(name = "sender_display_name", nullable = false, length = 150)
    private String senderDisplayName;

    @Column(name = "message_text", nullable = false, columnDefinition = "TEXT")
    private String messageText;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", length = 30)
    private MessageVisibility visibility;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum MessageVisibility {
        PATIENT_VISIBLE, STAFF_INTERNAL
    }

    public GroupChatMessage() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCaseGroupId() { return caseGroupId; }
    public void setCaseGroupId(String caseGroupId) { this.caseGroupId = caseGroupId; }

    public UUID getSenderUserId() { return senderUserId; }
    public void setSenderUserId(UUID senderUserId) { this.senderUserId = senderUserId; }

    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }

    public String getSenderDisplayName() { return senderDisplayName; }
    public void setSenderDisplayName(String senderDisplayName) { this.senderDisplayName = senderDisplayName; }

    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }

    public MessageVisibility getVisibility() { return visibility; }
    public void setVisibility(MessageVisibility visibility) { this.visibility = visibility; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
