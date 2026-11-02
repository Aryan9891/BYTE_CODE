import crypto from 'crypto';

/**
 * Generates an HMAC-SHA256 pseudonymous identifier for a student ID.
 * Decouples real student identity from telemetry and risk engine tables.
 *
 * @param userId - Real student UUID or institutional email
 * @param salt - Institutional secret salt (from server env)
 * @param version - Salt version for key rotation support (default: 'v1')
 * @returns Pseudonymous token (e.g. ps_7f9b8c2d1e0a4f5b)
 */
export function generatePseudoId(userId: string, salt: string, version: string = 'v1'): string {
  if (!userId || !salt) {
    throw new Error('Both userId and salt are required to derive a pseudonym');
  }

  const hmac = crypto.createHmac('sha256', salt);
  hmac.update(`${version}:${userId.trim().toLowerCase()}`);
  const hash = hmac.digest('hex').slice(0, 16);
  return `ps_${hash}`;
}

/**
 * Validates a candidate pseudoId against a known userId and salt in constant time.
 * Prevents timing side-channel attacks on pseudonym verification.
 */
export function verifyPseudoId(
  candidate: string,
  userId: string,
  salt: string,
  version: string = 'v1'
): boolean {
  if (!candidate || !userId || !salt) {
    return false;
  }

  const expected = generatePseudoId(userId, salt, version);
  const candidateBuf = Buffer.from(candidate, 'utf8');
  const expectedBuf = Buffer.from(expected, 'utf8');

  if (candidateBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(candidateBuf, expectedBuf);
}
