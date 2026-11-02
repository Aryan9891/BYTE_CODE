import { hash, verify } from '@node-rs/argon2';

/**
 * Recommended Argon2id parameters for password hashing:
 * - memoryCost: 19456 KiB (19 MiB)
 * - timeCost: 2 iterations
 * - outputLen: 32 bytes
 * - parallelism: 1 thread
 */
const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

/**
 * Hashes a plaintext password using Argon2id.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }
  return hash(password, ARGON2_OPTIONS);
}

/**
 * Verifies a plaintext password against an Argon2id hash.
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
