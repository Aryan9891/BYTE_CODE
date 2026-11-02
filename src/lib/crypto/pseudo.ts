import crypto from 'crypto';

/**
 * Generates an HMAC-SHA256 pseudonymous identifier for a student ID.
 * Decouples real identity from telemetry records.
 *
 * @param userId - Real student UUID or institutional email
 * @param salt - Institutional secret salt (from server env)
 * @returns Pseudonymous token (e.g. ps_7f9b8c2d1e0a4f5b)
 */
export function generatePseudoId(userId: string, salt: string): string {
  if (!userId || !salt) {
    throw new Error('Both userId and salt are required to derive a pseudonym');
  }

  const hmac = crypto.createHmac('sha256', salt);
  hmac.update(userId.trim().toLowerCase());
  const hash = hmac.digest('hex').slice(0, 16);
  return `ps_${hash}`;
}
