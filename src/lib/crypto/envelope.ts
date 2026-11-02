import crypto from 'crypto';

export interface EnvelopeMetadata {
  studentPseudoId: string;
  fieldName: string;
  keyVersion?: string;
}

export interface EncryptedPayload {
  keyVersion: string;
  iv: string; // Base64 encoded 96-bit IV
  authTag: string; // Base64 encoded 128-bit Auth Tag
  ciphertext: string; // Base64 encoded ciphertext
}

export type KeyRing = Record<string, string>;

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12; // 96-bit random IV (NIST SP 800-38D recommendation)
const DEFAULT_KEY_VERSION = 'v1';

/**
 * Builds canonical Additional Authenticated Data (AAD) string.
 * Cryptographically binds the ciphertext to the student pseudonym, field name, and key version.
 */
export function buildAAD(meta: EnvelopeMetadata): string {
  const version = meta.keyVersion || DEFAULT_KEY_VERSION;
  if (!meta.studentPseudoId || !meta.fieldName) {
    throw new Error('AAD requires studentPseudoId and fieldName for cryptographic binding');
  }
  return `${meta.studentPseudoId}:${meta.fieldName}:${version}`;
}

/**
 * Encrypts a plaintext string using AES-256-GCM with AAD binding.
 *
 * @param plaintext - Sensitive string to encrypt (e.g. student reflection journal)
 * @param keyHex - 32-byte key formatted as a 64-character hex string
 * @param meta - Binding metadata containing student pseudonym and field name
 * @returns EncryptedPayload with keyVersion, iv, authTag, and ciphertext
 */
export function encryptField(
  plaintext: string,
  keyHex: string,
  meta: EnvelopeMetadata
): EncryptedPayload {
  if (!plaintext) {
    throw new Error('Plaintext cannot be empty');
  }
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('Key must be a 64-character hex string (32 bytes)');
  }

  const keyVersion = meta.keyVersion || DEFAULT_KEY_VERSION;
  const aadString = buildAAD({ ...meta, keyVersion });

  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH_BYTES);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(Buffer.from(aadString, 'utf8'));

  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  return {
    keyVersion,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    ciphertext,
  };
}

/**
 * Decrypts an EncryptedPayload using AES-256-GCM, verifying AAD binding and auth tag.
 * Supports single key hex or a rotation-ready KeyRing mapping versions to keys.
 *
 * @param payload - EncryptedPayload containing keyVersion, iv, authTag, ciphertext
 * @param keyOrKeyRing - Single 64-char hex key OR a KeyRing map of versions to keys
 * @param meta - Binding metadata (must match encryption AAD exactly)
 * @returns Decrypted plaintext string
 */
export function decryptField(
  payload: EncryptedPayload,
  keyOrKeyRing: string | KeyRing,
  meta: EnvelopeMetadata
): string {
  if (!payload || !payload.ciphertext || !payload.iv || !payload.authTag) {
    throw new Error('Invalid encrypted payload');
  }

  const payloadVersion = payload.keyVersion || DEFAULT_KEY_VERSION;

  // Resolve key for the payload version
  let keyHex: string;
  if (typeof keyOrKeyRing === 'string') {
    keyHex = keyOrKeyRing;
  } else {
    keyHex = keyOrKeyRing[payloadVersion];
    if (!keyHex) {
      throw new Error(`Key version "${payloadVersion}" not found in provided KeyRing`);
    }
  }

  if (!keyHex || keyHex.length !== 64) {
    throw new Error('Key must be a 64-character hex string (32 bytes)');
  }

  const aadString = buildAAD({ ...meta, keyVersion: payloadVersion });

  const key = Buffer.from(keyHex, 'hex');
  const iv = Buffer.from(payload.iv, 'base64');
  const authTag = Buffer.from(payload.authTag, 'base64');

  if (iv.length !== IV_LENGTH_BYTES) {
    throw new Error(`Invalid IV length: expected ${IV_LENGTH_BYTES} bytes, got ${iv.length}`);
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAAD(Buffer.from(aadString, 'utf8'));
  decipher.setAuthTag(authTag);

  try {
    let decrypted = decipher.update(payload.ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    throw new Error(
      `Decryption failed: integrity or authenticity check failed (${(err as Error).message})`
    );
  }
}

/**
 * Serializes an EncryptedPayload to a compact string format: "v1:<iv>:<authTag>:<ciphertext>"
 */
export function serializePayload(payload: EncryptedPayload): string {
  return `${payload.keyVersion}:${payload.iv}:${payload.authTag}:${payload.ciphertext}`;
}

/**
 * Parses a serialized string into an EncryptedPayload.
 */
export function deserializePayload(serialized: string): EncryptedPayload {
  const parts = serialized.split(':');
  if (parts.length !== 4) {
    throw new Error(
      'Invalid serialized ciphertext format; expected "version:iv:authTag:ciphertext"'
    );
  }
  const [keyVersion, iv, authTag, ciphertext] = parts;
  return { keyVersion, iv, authTag, ciphertext };
}
