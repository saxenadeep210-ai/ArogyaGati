package org.arogyagati.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class Argon2PasswordServiceTest {

    private Argon2PasswordService passwordService;

    @BeforeEach
    void setUp() {
        passwordService = new Argon2PasswordService();
    }

    @Test
    @DisplayName("Should generate unique salts and successfully verify correct Argon2id password")
    void testHashAndVerifySuccess() {
        String password = "Doctor@Secure2026";
        Argon2PasswordService.HashResult res1 = passwordService.hashPassword(password);
        Argon2PasswordService.HashResult res2 = passwordService.hashPassword(password);

        assertNotNull(res1.hash());
        assertNotNull(res1.salt());
        assertNotNull(res2.hash());
        assertNotNull(res2.salt());

        // Unique salt verification
        assertNotEquals(res1.salt(), res2.salt());
        assertNotEquals(res1.hash(), res2.hash());

        // Verification success
        assertTrue(passwordService.verifyPassword(password, res1.hash(), res1.salt()));
        assertTrue(passwordService.verifyPassword(password, res2.hash(), res2.salt()));
    }

    @Test
    @DisplayName("Should reject invalid passwords")
    void testRejectInvalidPassword() {
        String password = "Admin@Secure99";
        Argon2PasswordService.HashResult res = passwordService.hashPassword(password);

        assertFalse(passwordService.verifyPassword("WrongPassword", res.hash(), res.salt()));
        assertFalse(passwordService.verifyPassword("", res.hash(), res.salt()));
    }
}
