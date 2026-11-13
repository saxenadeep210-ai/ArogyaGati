package org.arogyagati.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DataEncryptionServiceTest {

    private DataEncryptionService encryptionService;

    @BeforeEach
    void setUp() {
        encryptionService = new DataEncryptionService("arogya_gati_secure_test_key_at_least_32_bytes_long_here");
    }

    @Test
    @DisplayName("Should encrypt sensitive healthcare data and decrypt back to exact plaintext")
    void testEncryptDecryptRoundTrip() {
        String sensitiveAbha = "14-5544-7788-9922";
        String encrypted = encryptionService.encrypt(sensitiveAbha);

        assertNotNull(encrypted);
        assertNotEquals(sensitiveAbha, encrypted);

        String decrypted = encryptionService.decrypt(encrypted);
        assertEquals(sensitiveAbha, decrypted);
    }
}
