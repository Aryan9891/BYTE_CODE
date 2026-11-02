import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12;

/**
 * Computes a keyed HMAC lookup hash for an institutional email.
 * Enables constant-time indexed lookup without storing plaintext email in the database.
 */
export function computeEmailLookupHash(email: string, pepper: string): string {
  if (!email || !pepper) {
    throw new Error('Both email and pepper are required for lookup hash');
  }
  const normalized = email.trim().toLowerCase();
  return crypto.createHmac('sha256', pepper).update(normalized).digest('hex');
}

/**
 * Encrypts an email address using AES-256-GCM.
 */
export function encryptEmail(
  email: string,
  keyHex: string
): { ciphertext: string; iv: string; authTag: string } {
  if (!email) {
    throw new Error('Email cannot be empty');
  }
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('Key must be a 64-character hex string (32 bytes)');
  }

  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  cipher.setAAD(Buffer.from('identity:user_email:v1', 'utf8'));

  let encrypted = cipher.update(email.trim().toLowerCase(), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

/**
 * Decrypts an encrypted email address using AES-256-GCM.
 */
export function decryptEmail(
  payload: { ciphertext: string; iv: string; authTag: string },
  keyHex: string
): string {
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('Key must be a 64-character hex string (32 bytes)');
  }

  const key = Buffer.from(keyHex, 'hex');
  const iv = Buffer.from(payload.iv, 'base64');
  const authTag = Buffer.from(payload.authTag, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAAD(Buffer.from('identity:user_email:v1', 'utf8'));
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(payload.ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Decrypts a stored JSON email payload with error safety.
 */
export function decryptStoredEmail(storedString: string, keyHex?: string): string {
  try {
    const key =
      keyHex ||
      process.env.APP_MASTER_KEY ||
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const payload = typeof storedString === 'string' ? JSON.parse(storedString) : storedString;
    return decryptEmail(payload, key);
  } catch {
    return storedString;
  }
}
