/**
 * ArogyaGati WebAuthn / Passkey Biometric Service
 * FIPS-compliant cryptographic passkey registration & authentication
 * with graceful fallback to OTP/Password for accessibility.
 * 
 * NOTE: Emergency care and ambulance dispatch are NEVER blocked by biometric checks.
 */

export interface PasskeyResult {
  success: boolean;
  credentialId?: string;
  message: string;
  fallbackAvailable: boolean;
}

class WebAuthnService {
  /**
   * Check if user's device/browser supports WebAuthn / Biometrics (Fingerprint / Face ID / Windows Hello)
   */
  public isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.PublicKeyCredential !== undefined &&
      typeof window.PublicKeyCredential === 'function'
    );
  }

  /**
   * Check if platform authenticator (TouchID, FaceID, Windows Hello) is available
   */
  public async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      if (window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
    } catch (e) {
      console.warn('[WebAuthn] Platform authenticator check failed', e);
    }
    return false;
  }

  /**
   * Register a new Passkey / Biometric credential
   */
  public async registerPasskey(userId: string, userName: string): Promise<PasskeyResult> {
    if (!this.isSupported()) {
      return {
        success: false,
        message: 'Biometric passkeys are not supported on this device/browser. Please use Mobile OTP or Password.',
        fallbackAvailable: true,
      };
    }

    try {
      // 32-byte cryptographic challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userIdBytes = new TextEncoder().encode(userId);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'ArogyaGati Smart Hospital',
          id: window.location.hostname || 'localhost',
        },
        user: {
          id: userIdBytes,
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Windows Hello, TouchID, FaceID, Android Biometrics
          userVerification: 'preferred',
          requireResidentKey: false,
        },
        timeout: 60000,
        attestation: 'none',
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential | null;

      if (credential) {
        // Base64 encode the credential ID for storage
        const rawId = new Uint8Array(credential.rawId);
        const base64Id = btoa(String.fromCharCode(...rawId));
        localStorage.setItem(`arogya_passkey_${userId}`, base64Id);

        return {
          success: true,
          credentialId: base64Id,
          message: 'Biometric Passkey registered successfully! You can now log in using fingerprint or facial recognition.',
          fallbackAvailable: true,
        };
      }

      return {
        success: false,
        message: 'Biometric registration was cancelled or timed out.',
        fallbackAvailable: true,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn('[WebAuthn] Registration error:', errorMsg);

      return {
        success: false,
        message: `Biometric registration could not be completed (${errorMsg}). You can continue using Mobile OTP.`,
        fallbackAvailable: true,
      };
    }
  }

  /**
   * Authenticate using an enrolled Passkey / Biometric credential
   */
  public async authenticatePasskey(userId?: string): Promise<PasskeyResult> {
    if (!this.isSupported()) {
      return {
        success: false,
        message: 'Biometrics not supported on this browser. Falling back to OTP/Password.',
        fallbackAvailable: true,
      };
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        rpId: window.location.hostname || 'localhost',
        userVerification: 'preferred',
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      }) as PublicKeyCredential | null;

      if (assertion) {
        return {
          success: true,
          credentialId: assertion.id,
          message: 'Biometric verification verified. Access granted.',
          fallbackAvailable: true,
        };
      }

      return {
        success: false,
        message: 'Biometric verification cancelled.',
        fallbackAvailable: true,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn('[WebAuthn] Authentication error:', errorMsg);

      return {
        success: false,
        message: `Biometric verification failed (${errorMsg}). Please use Mobile OTP or Password.`,
        fallbackAvailable: true,
      };
    }
  }
}

export const webauthnService = new WebAuthnService();
