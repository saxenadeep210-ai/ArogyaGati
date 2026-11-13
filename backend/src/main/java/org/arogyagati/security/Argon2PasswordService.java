package org.arogyagati.security;

import org.bouncycastle.crypto.generators.Argon2BytesGenerator;
import org.bouncycastle.crypto.params.Argon2Parameters;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Enterprise Healthcare Password Hashing implementing Argon2id (RFC 9106)
 * using Bouncy Castle for resistance against GPU/ASIC brute-force attacks.
 */
@Service
public class Argon2PasswordService {

    private static final int SALT_LENGTH = 16;
    private static final int HASH_LENGTH = 32;
    private static final int ITERATIONS = 3;
    private static final int MEMORY_KB = 65536; // 64 MB
    private static final int PARALLELISM = 1;

    private final SecureRandom secureRandom = new SecureRandom();

    public record HashResult(String hash, String salt) {}

    /**
     * Hashes plaintext password with a fresh cryptographically secure salt.
     */
    public HashResult hashPassword(String plaintextPassword) {
        byte[] salt = new byte[SALT_LENGTH];
        secureRandom.nextBytes(salt);

        Argon2Parameters params = new Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
                .withSalt(salt)
                .withIterations(ITERATIONS)
                .withMemoryAsKB(MEMORY_KB)
                .withParallelism(PARALLELISM)
                .build();

        Argon2BytesGenerator generator = new Argon2BytesGenerator();
        generator.init(params);

        byte[] result = new byte[HASH_LENGTH];
        generator.generateBytes(plaintextPassword.getBytes(StandardCharsets.UTF_8), result);

        String hashBase64 = Base64.getEncoder().encodeToString(result);
        String saltBase64 = Base64.getEncoder().encodeToString(salt);

        return new HashResult(hashBase64, saltBase64);
    }

    /**
     * Verifies plaintext password against stored Argon2id hash and salt.
     * Uses constant-time comparison to prevent timing side-channel attacks.
     */
    public boolean verifyPassword(String plaintextPassword, String storedHashBase64, String storedSaltBase64) {
        try {
            byte[] salt = Base64.getDecoder().decode(storedSaltBase64);
            byte[] expectedHash = Base64.getDecoder().decode(storedHashBase64);

            Argon2Parameters params = new Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
                    .withSalt(salt)
                    .withIterations(ITERATIONS)
                    .withMemoryAsKB(MEMORY_KB)
                    .withParallelism(PARALLELISM)
                    .build();

            Argon2BytesGenerator generator = new Argon2BytesGenerator();
            generator.init(params);

            byte[] computedHash = new byte[HASH_LENGTH];
            generator.generateBytes(plaintextPassword.getBytes(StandardCharsets.UTF_8), computedHash);

            return MessageDigest.isEqual(expectedHash, computedHash);
        } catch (Exception e) {
            return false;
        }
    }
}
