package org.arogyagati.repository;

import org.arogyagati.entity.GroupChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GroupChatMessageRepository extends JpaRepository<GroupChatMessage, UUID> {
    List<GroupChatMessage> findByCaseGroupIdOrderByCreatedAtAsc(String caseGroupId);
    List<GroupChatMessage> findByCaseGroupIdAndVisibilityOrderByCreatedAtAsc(String caseGroupId, GroupChatMessage.MessageVisibility visibility);
}
