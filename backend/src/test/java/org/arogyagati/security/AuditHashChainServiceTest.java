package org.arogyagati.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AuditHashChainServiceTest {

    private AuditHashChainService hashChainService;

    @BeforeEach
    void setUp() {
        hashChainService = new AuditHashChainService();
    }

    @Test
    @DisplayName("Should build sequential hash chain and detect tamper modifications")
    void testHashChainTamperDetection() {
        String genesis = AuditHashChainService.GENESIS_HASH;
        String timestamp = "2026-11-13T10:00:00";

        // Event 1
        String hash1 = hashChainService.calculateHash(genesis, 1L, "DOC-1001", "DOCTOR", "CALL_PATIENT", "TOKEN", "OPD-001", "{\"status\":\"CALLED\"}", timestamp);
        assertNotNull(hash1);
        assertEquals(64, hash1.length());

        // Event 2 (chained to Event 1)
        String hash2 = hashChainService.calculateHash(hash1, 2L, "DOC-1001", "DOCTOR", "COMPLETE_CONSULTATION", "TOKEN", "OPD-001", "{\"status\":\"COMPLETED\"}", timestamp);
        assertNotNull(hash2);
        assertNotEquals(hash1, hash2);

        // Verification of intact entry
        assertTrue(hashChainService.verifyEntry(genesis, 1L, "DOC-1001", "DOCTOR", "CALL_PATIENT", "TOKEN", "OPD-001", "{\"status\":\"CALLED\"}", timestamp, hash1));

        // Detection of tampered payload
        assertFalse(hashChainService.verifyEntry(genesis, 1L, "DOC-1001", "DOCTOR", "CALL_PATIENT", "TOKEN", "OPD-001", "{\"status\":\"ALTERED_FRAUD\"}", timestamp, hash1));

        // Detection of tampered actor
        assertFalse(hashChainService.verifyEntry(genesis, 1L, "ATTACKER", "DOCTOR", "CALL_PATIENT", "TOKEN", "OPD-001", "{\"status\":\"CALLED\"}", timestamp, hash1));
    }
}
