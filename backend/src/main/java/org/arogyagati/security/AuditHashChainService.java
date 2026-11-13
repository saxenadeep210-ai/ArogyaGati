package org.arogyagati.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

/**
 * Cryptographic Hash Chain Audit Engine
 * Guarantees tamper-evidence and forward integrity by binding each audit entry
 * to the cryptographic hash of the preceding entry:
 * Current Hash = SHA-256(Previous Hash + Canonical Event Data)
 */
@Service
public class AuditHashChainService {

    private static final Logger log = LoggerFactory.getLogger(AuditHashChainService.class);
    public static final String GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

    /**
     * Computes the canonical SHA-256 hash for an audit entry.
     */
    public String calculateHash(
            String previousHash,
            long sequenceNumber,
            String actorId,
            String actorRole,
            String action,
            String entityType,
            String entityId,
            String canonicalPayload,
            String timestamp
    ) {
        try {
            String safePrev = (previousHash == null || previousHash.isEmpty()) ? GENESIS_HASH : previousHash;
            String data = safePrev + "|" + sequenceNumber + "|" + actorId + "|" + actorRole + "|"
                    + action + "|" + entityType + "|" + entityId + "|" + canonicalPayload + "|" + timestamp;

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (Exception e) {
            log.error("Failed to compute audit hash chain entry", e);
            throw new RuntimeException("Audit hash computation failed", e);
        }
    }

    /**
     * Validates whether an event's hash matches recomputed canonical data.
     */
    public boolean verifyEntry(
            String previousHash,
            long sequenceNumber,
            String actorId,
            String actorRole,
            String action,
            String entityType,
            String entityId,
            String canonicalPayload,
            String timestamp,
            String expectedCurrentHash
    ) {
        String computed = calculateHash(previousHash, sequenceNumber, actorId, actorRole, action, entityType, entityId, canonicalPayload, timestamp);
        return computed.equalsIgnoreCase(expectedCurrentHash);
    }
}
