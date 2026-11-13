package org.arogyagati.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Authenticated Encryption Service implementing AES-256-GCM
 * with random 96-bit IV per encryption for sensitive healthcare PII.
 */
@Service
public class DataEncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH_BITS = 128;
    private static final int IV_LENGTH_BYTES = 12;

    private final SecretKey secretKey;
    private final SecureRandom secureRandom = new SecureRandom();

    public DataEncryptionService(@Value("${jwt.secret:default_encryption_fallback_secret_key_minimum_length_required}") String secretSeed) {
        try {
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = sha.digest(secretSeed.getBytes(StandardCharsets.UTF_8));
            this.secretKey = new SecretKeySpec(keyBytes, "AES");
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize AES-256 encryption key", e);
        }
    }

    /**
     * Encrypts plaintext data using AES-256-GCM.
     * Returns Base64-encoded string: [IV:12 bytes] + [Ciphertext + AuthTag].
     */
    public String encrypt(String plaintext) {
        if (plaintext == null || plaintext.isEmpty()) return plaintext;
        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec);

            byte[] cipherText = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            byte[] combined = new byte[iv.length + cipherText.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(cipherText, 0, combined, iv.length, cipherText.length);

            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    /**
     * Decrypts AES-256-GCM Base64-encoded payload.
     */
    public String decrypt(String encryptedPayload) {
        if (encryptedPayload == null || encryptedPayload.isEmpty()) return encryptedPayload;
        try {
            byte[] combined = Base64.getDecoder().decode(encryptedPayload);
            if (combined.length < IV_LENGTH_BYTES) {
                return encryptedPayload; // Not encrypted
            }

            byte[] iv = new byte[IV_LENGTH_BYTES];
            System.arraycopy(combined, 0, iv, 0, IV_LENGTH_BYTES);

            int cipherLength = combined.length - IV_LENGTH_BYTES;
            byte[] cipherText = new byte[cipherLength];
            System.arraycopy(combined, IV_LENGTH_BYTES, cipherText, 0, cipherLength);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, spec);

            byte[] decrypted = cipher.doFinal(cipherText);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            // Graceful fallback for unencrypted legacy demo values
            return encryptedPayload;
        }
    }
}
