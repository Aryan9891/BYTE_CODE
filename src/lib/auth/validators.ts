/**
 * Institutional Validation and Age Gate (DPDP Act 2023 & Ethics Framework)
 * Reference: docs/PRIVACY_AND_ETHICS.md & docs/PRD.md
 */

/**
 * Validates whether an email belongs to an approved institutional domain.
 * Supports exact domain matching or institutional subdomains.
 */
export function isDomainAllowed(email: string, allowedDomains: string[]): boolean {
  if (!email || !allowedDomains || allowedDomains.length === 0) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const atIndex = normalizedEmail.lastIndexOf('@');
  if (atIndex === -1 || atIndex === normalizedEmail.length - 1) {
    return false;
  }

  const domain = normalizedEmail.slice(atIndex + 1);

  return allowedDomains.some((allowed) => {
    const normalizedAllowed = allowed.trim().toLowerCase().replace(/^@/, '');
    return domain === normalizedAllowed || domain.endsWith(`.${normalizedAllowed}`);
  });
}

export interface AgeGateResult {
  isAllowed: boolean;
  age: number;
  message?: string;
  supportiveAction?: 'PROCEED_TO_ONBOARDING' | 'DIRECT_CRISIS_SUPPORT_ONLY';
  legalReviewRequired?: boolean;
}

/**
 * Enforces the age gate (18+ requirement).
 *
 * Legal context: Under the Digital Personal Data Protection Act, 2023 (DPDP Act) Section 9,
 * processing data of individuals under 18 ("children") requires verifiable parental consent
 * and imposes strict restrictions against behavioral tracking and profiling.
 *
 * For the pilot, individuals under 18 cannot be onboarded to automated telemetry tracking.
 * However, they must NEVER be turned away without immediate, compassionate, stigma-free access
 * to verified crisis and campus support.
 */
export function validateAgeGate(input: number | Date): AgeGateResult {
  let calculatedAge: number;

  if (input instanceof Date) {
    const today = new Date();
    let age = today.getFullYear() - input.getFullYear();
    const m = today.getMonth() - input.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < input.getDate())) {
      age--;
    }
    calculatedAge = age;
  } else if (typeof input === 'number') {
    calculatedAge = Math.floor(input);
  } else {
    return {
      isAllowed: false,
      age: 0,
      message: 'Please enter a valid age or date of birth.',
      supportiveAction: 'DIRECT_CRISIS_SUPPORT_ONLY',
      legalReviewRequired: true,
    };
  }

  if (calculatedAge >= 18) {
    return {
      isAllowed: true,
      age: calculatedAge,
      supportiveAction: 'PROCEED_TO_ONBOARDING',
      legalReviewRequired: false,
    };
  }

  // Under-18 supportive path
  return {
    isAllowed: false,
    age: calculatedAge,
    message:
      'Sahayak currently provides algorithmic wellness telemetry only for adult students (18+) in accordance with privacy laws (DPDP Act 2023). However, our verified crisis resources and professional campus counseling are immediately available to every student without restriction.',
    supportiveAction: 'DIRECT_CRISIS_SUPPORT_ONLY',
    legalReviewRequired: true,
  };
}
