import { Role, RiskTier } from '@prisma/client';

export type Action =
  'READ' | 'WRITE' | 'DELETE' | 'UNMASK' | 'EXPORT' | 'EVALUATE' | 'TRIGGER_AUDIT';

export type Resource =
  | 'STUDENT_PROFILE'
  | 'SURVEY_RESPONSE'
  | 'ACADEMIC_SIGNAL'
  | 'HELP_SEEKING_SIGNAL'
  | 'RISK_EVALUATION'
  | 'JOURNAL_ENTRY'
  | 'COUNSELOR_CASE'
  | 'AUDIT_LOG'
  | 'SUPPORT_RESOURCE'
  | 'AGGREGATE_METRICS';

export type AccessPurpose =
  | 'SELF_VIEW'
  | 'DIRECT_CARE_REVIEW'
  | 'ANALYTICS_AGGREGATE'
  | 'AUDIT_INSPECTION'
  | 'SYSTEM_BACKGROUND';

export interface SessionActor {
  id: string;
  role: Role;
  email: string;
  institution_id: string;
  student_pseudo_id?: string;
}

export interface AuthorizationContext {
  targetStudentPseudoId?: string;
  targetUserId?: string;
  currentTier?: RiskTier;
  counselorConsentActive?: boolean;
  emergencyOverrideActive?: boolean;
  cohortSize?: number;
}

export interface AuthorizationResult {
  granted: boolean;
  reason: string;
}

export const K_ANONYMITY_MIN_COHORT_SIZE = 10;

/**
 * Central Purpose-Based Authorization Policy Engine
 *
 * Implements strict principle of least privilege, purpose-based access control,
 * cryptographic boundaries, and cohort aggregation protection.
 *
 * Reference: docs/ARCHITECTURE.md & docs/PRIVACY_AND_ETHICS.md
 */
export function can(
  actor: SessionActor,
  action: Action,
  resource: Resource,
  purpose?: AccessPurpose,
  context: AuthorizationContext = {}
): AuthorizationResult {
  // Public directory resources are readable by all authenticated actors
  if (resource === 'SUPPORT_RESOURCE' && action === 'READ') {
    return { granted: true, reason: 'Verified support directory is open to all users.' };
  }

  // ---------------------------------------------------------------------------
  // 1. STUDENT ROLE POLICY
  // ---------------------------------------------------------------------------
  if (actor.role === Role.STUDENT) {
    // Audit logs are institution/admin only
    if (
      resource === 'AUDIT_LOG' ||
      resource === 'AGGREGATE_METRICS' ||
      resource === 'COUNSELOR_CASE'
    ) {
      return {
        granted: false,
        reason: 'Students do not have permission to access administrative or triage resources.',
      };
    }

    // Unmasking is an exclusively clinical operation
    if (action === 'UNMASK') {
      return {
        granted: false,
        reason: 'Unmasking is strictly restricted to authorized care personnel.',
      };
    }

    // Students may access their own telemetry and private journals under SELF_VIEW
    if (purpose !== 'SELF_VIEW') {
      return {
        granted: false,
        reason: 'Student data access must be declared with purpose SELF_VIEW.',
      };
    }

    const isOwnData =
      (context.targetStudentPseudoId &&
        context.targetStudentPseudoId === actor.student_pseudo_id) ||
      (context.targetUserId && context.targetUserId === actor.id);

    if (!isOwnData) {
      return {
        granted: false,
        reason: 'Access denied: Students may only access their own records.',
      };
    }

    if (['READ', 'WRITE', 'EXPORT', 'DELETE'].includes(action)) {
      return { granted: true, reason: 'Student granted access to personal record.' };
    }

    return {
      granted: false,
      reason: `Action ${action} is not permitted for students on ${resource}.`,
    };
  }

  // ---------------------------------------------------------------------------
  // 2. COUNSELOR ROLE POLICY
  // ---------------------------------------------------------------------------
  if (actor.role === Role.COUNSELOR) {
    // Absolute Invariant: Private journals are encrypted with student DEK and never accessible to counselors
    if (resource === 'JOURNAL_ENTRY') {
      return {
        granted: false,
        reason:
          'Access denied: Student personal journals are student-private envelope-encrypted and strictly inaccessible to staff.',
      };
    }

    // Counselors do not administer aggregate metrics or system audit chains
    if (resource === 'AGGREGATE_METRICS') {
      return {
        granted: false,
        reason: 'Institutional cohort analytics are restricted to administrative roles.',
      };
    }

    // Care access must declare purpose DIRECT_CARE_REVIEW
    if (purpose !== 'DIRECT_CARE_REVIEW') {
      return {
        granted: false,
        reason: 'Counselor telemetry access must declare purpose DIRECT_CARE_REVIEW.',
      };
    }

    // Unmasking Policy: Gated by active Tier 2/Tier 3 AND active triage consent (or institutional emergency override)
    if (action === 'UNMASK') {
      if (context.currentTier !== RiskTier.TIER_2 && context.currentTier !== RiskTier.TIER_3) {
        return {
          granted: false,
          reason:
            'Unmasking denied: Student is not in Tier 2 (Gentle Check-in) or Tier 3 (Priority Review). Unmasking Tier 0 or Tier 1 students is strictly prohibited.',
        };
      }

      if (!context.counselorConsentActive && !context.emergencyOverrideActive) {
        return {
          granted: false,
          reason:
            'Unmasking denied: Student has revoked counselor triage consent and emergency override is not active.',
        };
      }

      return {
        granted: true,
        reason: 'Unmasking permitted for active Tier 2/Tier 3 case with verified consent.',
      };
    }

    // Reading pseudonymized cases and evaluations
    if (
      action === 'READ' &&
      [
        'COUNSELOR_CASE',
        'RISK_EVALUATION',
        'SURVEY_RESPONSE',
        'ACADEMIC_SIGNAL',
        'HELP_SEEKING_SIGNAL',
      ].includes(resource)
    ) {
      return {
        granted: true,
        reason: 'Counselor permitted to review pseudonymized triage telemetry.',
      };
    }

    // Writing triage feedback and status updates
    if (action === 'WRITE' && resource === 'COUNSELOR_CASE') {
      return {
        granted: true,
        reason: 'Counselor permitted to update case status and log outreach.',
      };
    }

    return {
      granted: false,
      reason: `Action ${action} on ${resource} is not authorized for counselors.`,
    };
  }

  // ---------------------------------------------------------------------------
  // 3. ADMIN ROLE POLICY
  // ---------------------------------------------------------------------------
  if (actor.role === Role.ADMIN || actor.role === Role.SUPER_ADMIN) {
    // Absolute Invariant: Admins NEVER view individual student telemetry or unmask identities
    if (
      [
        'SURVEY_RESPONSE',
        'ACADEMIC_SIGNAL',
        'HELP_SEEKING_SIGNAL',
        'JOURNAL_ENTRY',
        'STUDENT_PROFILE',
      ].includes(resource)
    ) {
      return {
        granted: false,
        reason:
          'Access denied: Administrative accounts are strictly prohibited from viewing individual student telemetry or journals.',
      };
    }

    if (action === 'UNMASK') {
      return {
        granted: false,
        reason:
          'Access denied: Administrative accounts cannot unmask student identities under any circumstances.',
      };
    }

    // Aggregate Analytics with k-anonymity cohort size enforcement
    if (resource === 'AGGREGATE_METRICS') {
      if (purpose !== 'ANALYTICS_AGGREGATE') {
        return {
          granted: false,
          reason: 'Cohort analytics must declare purpose ANALYTICS_AGGREGATE.',
        };
      }

      if (context.cohortSize !== undefined && context.cohortSize < K_ANONYMITY_MIN_COHORT_SIZE) {
        return {
          granted: false,
          reason: `Privacy invariant: Cohort size (${context.cohortSize}) is below k-anonymity minimum (${K_ANONYMITY_MIN_COHORT_SIZE}). Results suppressed to prevent re-identification.`,
        };
      }

      return { granted: true, reason: 'Admin permitted to view aggregate cohort statistics.' };
    }

    // Audit Log Inspection
    if (resource === 'AUDIT_LOG') {
      if (action === 'READ' && purpose === 'AUDIT_INSPECTION') {
        return {
          granted: true,
          reason: 'Admin permitted to inspect immutable audit trail for compliance.',
        };
      }
      return { granted: false, reason: 'Audit inspection requires purpose AUDIT_INSPECTION.' };
    }

    // Managing Verified Support Directory
    if (resource === 'SUPPORT_RESOURCE' && ['READ', 'WRITE', 'DELETE'].includes(action)) {
      return { granted: true, reason: 'Admin permitted to manage verified support resources.' };
    }

    return {
      granted: false,
      reason: `Action ${action} on ${resource} is not permitted for administrators.`,
    };
  }

  return { granted: false, reason: 'Unknown role or unhandled authorization policy boundary.' };
}
