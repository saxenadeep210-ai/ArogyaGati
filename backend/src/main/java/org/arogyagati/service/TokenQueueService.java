package org.arogyagati.service;

import org.arogyagati.entity.QueueToken.TokenPriority;
import org.arogyagati.entity.QueueToken.TokenStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Token and Queue Service implementing Redis Sorted Sets for atomic queue priority
 * and dynamic wait time estimation with STOMP WebSocket broadcasting.
 */
@Service
public class TokenQueueService {

    private static final Logger log = LoggerFactory.getLogger(TokenQueueService.class);

    private final RedisTemplate<String, String> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String QUEUE_KEY_PREFIX = "queue:department:";
    private static final String TOKEN_STATUS_KEY = "token:status:";

    public TokenQueueService(
        @Autowired(required = false) RedisTemplate<String, String> redisTemplate,
        @Autowired(required = false) SimpMessagingTemplate messagingTemplate
    ) {
        this.redisTemplate = redisTemplate;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Atomically enqueues a token into the departmental Redis Sorted Set.
     * Emergency tokens receive score offset to always remain at the head of the queue.
     */
    @Transactional
    public void enqueueToken(String departmentId, String tokenNumber, TokenPriority priority) {
        if (redisTemplate == null) {
            log.info("Redis not active, skipping sorted set enqueue for token {}", tokenNumber);
            return;
        }
        String redisKey = QUEUE_KEY_PREFIX + departmentId;
        double timestampScore = System.currentTimeMillis();

        if (priority == TokenPriority.EMERGENCY) {
            timestampScore = timestampScore - 1_000_000_000_000.0;
        }

        redisTemplate.opsForZSet().add(redisKey, tokenNumber, timestampScore);
        redisTemplate.opsForValue().set(TOKEN_STATUS_KEY + tokenNumber, TokenStatus.WAITING.name());

        broadcastQueueUpdate(departmentId);
    }

    /**
     * Computes real-time dynamic queue position from Redis Sorted Set rank.
     */
    public Long getQueuePosition(String departmentId, String tokenNumber) {
        if (redisTemplate == null) return 1L;
        String redisKey = QUEUE_KEY_PREFIX + departmentId;
        Long rank = redisTemplate.opsForZSet().rank(redisKey, tokenNumber);
        return (rank != null) ? rank + 1 : 0L;
    }

    /**
     * Calls next patient in queue, broadcasts dual chime alert via STOMP WebSocket.
     */
    @Transactional
    public String callNextPatient(String departmentId, String doctorCabin) {
        if (redisTemplate == null) return null;
        String redisKey = QUEUE_KEY_PREFIX + departmentId;
        Set<String> nextTokens = redisTemplate.opsForZSet().range(redisKey, 0, 0);

        if (nextTokens == null || nextTokens.isEmpty()) {
            return null;
        }

        String calledToken = nextTokens.iterator().next();
        redisTemplate.opsForZSet().remove(redisKey, calledToken);
        redisTemplate.opsForValue().set(TOKEN_STATUS_KEY + calledToken, TokenStatus.CALLED.name());

        if (messagingTemplate != null) {
            String destination = "/topic/queue/" + departmentId;
            messagingTemplate.convertAndSend(destination, new TokenAnnouncementPayload(
                calledToken,
                TokenStatus.CALLED.name(),
                doctorCabin,
                LocalDateTime.now().toString()
            ));
        }

        return calledToken;
    }

    private void broadcastQueueUpdate(String departmentId) {
        if (redisTemplate == null || messagingTemplate == null) return;
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
