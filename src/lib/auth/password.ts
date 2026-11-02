import { hash, verify } from '@node-rs/argon2';

/**
 * OWASP Recommended Argon2id parameters for high-security password hashing:
 * - memoryCost: 65536 KiB (64 MiB)
 * - timeCost: 3 iterations
 * - outputLen: 32 bytes
 * - parallelism: 4 threads
 */
export const OWASP_ARGON2_OPTIONS = {
  memoryCost: 65536,
  timeCost: 3,
  outputLen: 32,
  parallelism: 4,
};

/**
 * Hashes a plaintext password using Argon2id with strict OWASP parameters.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }
  return hash(password, OWASP_ARGON2_OPTIONS);
}

/**
 * Verifies a plaintext password against an Argon2id hash in constant time.
 */
export async function verifyPassword(hashStr: string, password: string): Promise<boolean> {
  if (!hashStr || !password) {
    return false;
  }
  try {
    return await verify(hashStr, password);
  } catch {
    return false;
  }
}
