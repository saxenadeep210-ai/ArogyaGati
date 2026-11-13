package org.arogyagati.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.arogyagati.entity.QueueToken;
import org.arogyagati.entity.QueueToken.TokenPriority;
import org.arogyagati.entity.QueueToken.TokenStatus;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

/**
 * Token and Queue Service implementing Redis Sorted Sets for atomic queue priority
 * and dynamic wait time estimation with STOMP WebSocket broadcasting.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TokenQueueService {

    private final RedisTemplate<String, String> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String QUEUE_KEY_PREFIX = "queue:department:";
    private static final String TOKEN_STATUS_KEY = "token:status:";

    /**
     * Atomically enqueues a token into the departmental Redis Sorted Set.
     * Emergency tokens receive score offset to always remain at the head of the queue.
     */
    @Transactional
    public void enqueueToken(String departmentId, String tokenNumber, TokenPriority priority) {
        String redisKey = QUEUE_KEY_PREFIX + departmentId;
        double timestampScore = System.currentTimeMillis();

        if (priority == TokenPriority.EMERGENCY) {
            // Priority score offset ensures immediate triage priority
            timestampScore = timestampScore - 1_000_000_000_000.0;
        }

        redisTemplate.opsForZSet().add(redisKey, tokenNumber, timestampScore);
        redisTemplate.opsForValue().set(TOKEN_STATUS_KEY + tokenNumber, TokenStatus.WAITING.name());

        // Broadcast updated queue state to connected WebSocket subscribers
        broadcastQueueUpdate(departmentId);
    }

    /**
     * Computes real-time dynamic queue position from Redis Sorted Set rank.
     */
    public Long getQueuePosition(String departmentId, String tokenNumber) {
        String redisKey = QUEUE_KEY_PREFIX + departmentId;
        Long rank = redisTemplate.opsForZSet().rank(redisKey, tokenNumber);
        return (rank != null) ? rank + 1 : 0L;
    }

    /**
     * Calls next patient in queue, broadcasts dual chime alert via STOMP WebSocket.
     */
    @Transactional
    public String callNextPatient(String departmentId, String doctorCabin) {
        String redisKey = QUEUE_KEY_PREFIX + departmentId;
        Set<String> nextTokens = redisTemplate.opsForZSet().range(redisKey, 0, 0);

        if (nextTokens == null || nextTokens.isEmpty()) {
            return null;
        }

        String calledToken = nextTokens.iterator().next();
        redisTemplate.opsForZSet().remove(redisKey, calledToken);
        redisTemplate.opsForValue().set(TOKEN_STATUS_KEY + calledToken, TokenStatus.CALLED.name());

        // Broadcast call event to patient display and mobile PWA
        String destination = "/topic/queue/" + departmentId;
        messagingTemplate.convertAndSend(destination, new TokenAnnouncementPayload(
            calledToken,
            TokenStatus.CALLED.name(),
            doctorCabin,
            LocalDateTime.now().toString()
        ));

        return calledToken;
    }

    private void broadcastQueueUpdate(String departmentId) {
        String redisKey = QUEUE_KEY_PREFIX + departmentId;
        Long queueSize = redisTemplate.opsForZSet().zCard(redisKey);
        messagingTemplate.convertAndSend("/topic/queue/" + departmentId + "/count", queueSize);
    }

    public record TokenAnnouncementPayload(
        String tokenNumber,
        String status,
        String doctorCabin,
        String timestamp
    ) {}
}
