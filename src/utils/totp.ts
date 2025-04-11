import { authenticator } from 'otplib';

// Configure TOTP (optional settings)
authenticator.options = {
    step: 30,          // Time-step (default: 30 seconds)
    window: 1,         // Allowed drift (for verification)
    digits: 6,         // OTP length (default: 6)
    HashAlgorithms: 'SHA1', // HMAC algorithm
};

/**
 * Generate a new TOTP secret for a user.
 * @returns {string} A base32-encoded secret key
 */
export function generateTotpSecret(): string {
    return authenticator.generateSecret(); // Generates a 32-char base32 secret
}

/**
 * Verify a TOTP code against a secret.
 * @param {string} secret - The user's TOTP secret (base32)
 * @param {string} token - The 6-digit code to verify
 * @returns {boolean} True if valid, false otherwise
 */
export function verifyTotpCode(secret: string, token: string): boolean {
    return authenticator.check(token, secret);
}


export function generateRandomCode(): string {
    const code = Math.floor(1000 + Math.random() * 9000);
    return code.toString();
}