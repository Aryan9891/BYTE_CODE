import crypto from 'crypto';

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard 96-bit IV for AES-GCM

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Used for student-private reflections and sensitive survey comments.
 *
 * @param plaintext - Text to encrypt
 * @param keyHex - 32-byte key formatted as a 64-character hex string
 * @returns EncryptedPayload with ciphertext, iv, and authTag in base64
 */
export function encryptField(plaintext: string, keyHex: string): EncryptedPayload {
  if (!plaintext) {
    throw new Error('Plaintext cannot be empty');
  }
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('Key must be a 64-character hex string (32 bytes)');
  }

  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  return {
    ciphertext,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

/**
 * Decrypts an EncryptedPayload using AES-256-GCM.
 * Throws if authentication tag verification fails (data tampering detected).
 *
 * @param payload - EncryptedPayload containing ciphertext, iv, and authTag
 * @param keyHex - 32-byte key formatted as a 64-character hex string
 * @returns Decrypted plaintext string
 */
export function decryptField(payload: EncryptedPayload, keyHex: string): string {
  if (!payload || !payload.ciphertext || !payload.iv || !payload.authTag) {
    throw new Error('Invalid encrypted payload');
  }
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('Key must be a 64-character hex string (32 bytes)');
  }

  const key = Buffer.from(keyHex, 'hex');
  const iv = Buffer.from(payload.iv, 'base64');
  const authTag = Buffer.from(payload.authTag, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(payload.ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
