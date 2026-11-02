import crypto from 'node:crypto';
import { ConsentToggles } from './index';

export interface ConsentReceipt {
  receipt_id: string;
  student_pseudo_id: string;
  consent_version: string;
  locale: string;
  timestamp: string;
  toggles: ConsentToggles;
  hmac_signature: string;
  signature_algorithm: string;
  verification_instructions: string;
}

/**
 * Computes canonical HMAC-SHA256 signature for a student consent receipt.
 */
export function signConsentReceipt(
  studentPseudoId: string,
  version: string,
  locale: string,
  timestamp: string,
  toggles: ConsentToggles,
  secretKey: string
): string {
  const canonicalString = JSON.stringify({
    student: studentPseudoId,
    version,
    locale,
    timestamp,
    toggles: {
      consent_surveys: toggles.consent_surveys,
      consent_academic: toggles.consent_academic,
      consent_help_seeking: toggles.consent_help_seeking,
      consent_counselor_triage: toggles.consent_counselor_triage,
      consent_journal_signals: toggles.consent_journal_signals,
      emergency_escalation_acknowledged: toggles.emergency_escalation_acknowledged,
    },
  });

  return crypto.createHmac('sha256', secretKey).update(canonicalString).digest('hex');
}

/**
 * Generates a signed, verifiable cryptographic consent receipt for the student to keep.
 */
export function generateConsentReceipt(
  studentPseudoId: string,
  locale: string,
  version: string,
  toggles: ConsentToggles,
  secretKey?: string
): ConsentReceipt {
  const timestamp = new Date().toISOString();
  const key =
    secretKey ||
    process.env.APP_MASTER_KEY ||
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  const signature = signConsentReceipt(studentPseudoId, version, locale, timestamp, toggles, key);

  return {
    receipt_id: 'rcpt_' + crypto.randomBytes(16).toString('hex'),
    student_pseudo_id: studentPseudoId,
    consent_version: version,
    locale,
    timestamp,
    toggles,
    hmac_signature: signature,
    signature_algorithm: 'HMAC-SHA256',
    verification_instructions:
      'This receipt mathematically proves your consent state at the recorded timestamp. It can be verified against the Sahayak cryptographic key.',
  };
}

/**
 * Verifies the integrity and authenticity of a consent receipt.
 */
export function verifyConsentReceipt(receipt: ConsentReceipt, secretKey?: string): boolean {
  const key =
    secretKey ||
    process.env.APP_MASTER_KEY ||
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  const expectedSignature = signConsentReceipt(
    receipt.student_pseudo_id,
    receipt.consent_version,
    receipt.locale,
    receipt.timestamp,
    receipt.toggles,
    key
  );

  const sigBuf = Buffer.from(receipt.hmac_signature, 'hex');
  const expectedBuf = Buffer.from(expectedSignature, 'hex');

  if (sigBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuf, expectedBuf);
}
