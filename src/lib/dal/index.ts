import {
  PrismaClient,
  RiskTier,
  CaseStatus,
  FeedbackRating,
  Role,
  ConsentToggleName,
  ConsentAction,
} from '@prisma/client';
import { can, SessionActor, AccessPurpose } from '@/lib/auth/policy';
import { logAuditEvent } from '@/lib/audit';
import { decryptStoredEmail } from '@/lib/crypto/email';

export { RiskTier, CaseStatus, FeedbackRating, Role, ConsentToggleName, ConsentAction };

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

export interface UnmaskResult {
  student_pseudo_id: string;
  full_name: string;
  email: string;
  department: string | null;
  cohort_year: string | null;
  unmasked_at: string;
  unmasked_by: string;
  audit_entry_id: string;
}

export interface CohortMetricsResult {
  suppressed: boolean;
  suppression_reason?: string;
  total_students: number;
  tier_distribution?: Record<RiskTier, number>;
  average_attendance_percentage?: number;
}

/**
 * Data Access Layer (DAL)
 * Enforces policy gates, purpose declaration, k-anonymity, and audit logging.
 */
export class DataAccessLayer {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || getPrismaClient();
  }

  /**
   * Unmasks a student's real-world identity for authorized clinical outreach.
   * Gated by active Tier 2/Tier 3 evaluation, student consent, and mandatory audit logging.
   */
  async unmaskStudentIdentity(
    actor: SessionActor,
    studentPseudoId: string,
    clinicalReason: string
  ): Promise<UnmaskResult> {
    if (!clinicalReason || clinicalReason.trim().length < 10) {
      throw new Error(
        'A clinical justification of at least 10 characters is required for identity unmasking.'
      );
    }

    // 1. Fetch latest risk evaluation and consent status
    const latestEval = await this.prisma.riskEvaluation?.findFirst({
      where: { student_pseudo_id: studentPseudoId },
      orderBy: { evaluated_at: 'desc' },
    });

    if (!latestEval) {
      throw new Error('No risk evaluation found for the specified student.');
    }

    type StudentLookupResult = {
      department: string;
      cohort_year: string;
      user: {
        full_name: string;
        email_encrypted: string;
        department?: string | null;
        cohort_year?: string | null;
      };
    };

    const studentProfile =
      ((await this.prisma.studentProfile?.findUnique({
        where: { student_pseudo_id: studentPseudoId },
        include: {
          user: true,
        },
      })) as unknown as StudentLookupResult | null) ||
      ((await (
        this.prisma as unknown as {
          pseudonymMap?: {
            findUnique: (args: unknown) => Promise<StudentLookupResult | null>;
          };
        }
      ).pseudonymMap?.findUnique({
        where: { student_pseudo_id: studentPseudoId },
        include: {
          user: true,
        },
      })) as StudentLookupResult | null);

    if (!studentProfile || !studentProfile.user) {
      throw new Error('Student profile not found.');
    }

    const consentState = await this.prisma.consentState?.findUnique({
      where: { student_pseudo_id: studentPseudoId },
    });

    const consentActive =
      consentState?.consent_counselor_triage ??
      (
        studentProfile.user as unknown as {
          consent_state?: { consent_counselor_triage?: boolean };
        }
      ).consent_state?.consent_counselor_triage ??
      false;

    // 2. Authorize via central policy engine
    const authResult = can(actor, 'UNMASK', 'STUDENT_PROFILE', 'DIRECT_CARE_REVIEW', {
      targetStudentPseudoId: studentPseudoId,
      currentTier: latestEval.tier,
      counselorConsentActive: consentActive,
    });

    if (!authResult.granted) {
      throw new Error(`Unauthorized unmasking attempt: ${authResult.reason}`);
    }

    // 3. Append to cryptographically chained audit log
    const auditRecord = (await logAuditEvent(
      actor.id,
      actor.role,
      'UNMASK_STUDENT_IDENTITY',
      'STUDENT_PROFILE',
      studentPseudoId,
      {
        event_category: 'TRIAGE',
        reason_code: 'CARE_TRIAGE_UNMASK',
      },
      this.prisma
    )) as { id: string };

    const decryptedEmail = decryptStoredEmail(studentProfile.user.email_encrypted);

    return {
      student_pseudo_id: studentPseudoId,
      full_name: studentProfile.user.full_name,
      email: decryptedEmail,
      department: studentProfile.department,
      cohort_year: studentProfile.cohort_year,
      unmasked_at: new Date().toISOString(),
      unmasked_by: actor.email,
      audit_entry_id: auditRecord.id,
    };
  }

  /**
   * Retrieves aggregated cohort metrics for administrators.
   * Strictly enforces k >= 10 cohort minimum; suppresses output if cohort < 10.
   */
  async getCohortMetrics(
    actor: SessionActor,
    department?: string,
    cohortYear?: string
  ): Promise<CohortMetricsResult> {
    const whereClause: { department?: string; cohort_year?: string } = {};
    if (department) whereClause.department = department;
    if (cohortYear) whereClause.cohort_year = cohortYear;

    const count = await this.prisma.studentProfile.count({
      where: whereClause,
    });

    const authResult = can(actor, 'READ', 'AGGREGATE_METRICS', 'ANALYTICS_AGGREGATE', {
      cohortSize: count,
    });

    if (!authResult.granted) {
      return {
        suppressed: true,
        suppression_reason: authResult.reason,
        total_students: count,
      };
    }

    type ProfileWithSignals = {
      risk_evaluations?: Array<{ tier: RiskTier }>;
      academic_signals?: Array<{ attendance_percentage?: number }>;
    };

    const profiles =
      ((await this.prisma.studentProfile.findMany({
        where: whereClause,
        include: {
          risk_evaluations: {
            orderBy: { evaluated_at: 'desc' },
            take: 1,
          },
          academic_signals: {
            orderBy: { recorded_at: 'desc' },
            take: 1,
          },
        },
      })) as unknown as ProfileWithSignals[]) || [];

    const tierDistribution: Record<RiskTier, number> = {
      [RiskTier.TIER_0]: 0,
      [RiskTier.TIER_1]: 0,
      [RiskTier.TIER_2]: 0,
      [RiskTier.TIER_3]: 0,
    };

    let totalAttendance = 0;
    let attendanceCount = 0;

    for (const p of profiles) {
      const latestTier = p.risk_evaluations?.[0]?.tier || RiskTier.TIER_0;
      tierDistribution[latestTier] = (tierDistribution[latestTier] || 0) + 1;

      if (p.academic_signals?.[0]?.attendance_percentage !== undefined) {
        totalAttendance += p.academic_signals[0].attendance_percentage;
        attendanceCount++;
      }
    }

    return {
      suppressed: false,
      total_students: count,
      tier_distribution: tierDistribution,
      average_attendance_percentage:
        attendanceCount > 0
          ? parseFloat((totalAttendance / attendanceCount).toFixed(1))
          : undefined,
    };
  }

  /**
   * Retrieves active triage cases for counselor staff.
   * Only returns pseudonymous cases; zero plain email or PII is returned here.
   */
  async getActiveTriageCases(actor: SessionActor, status?: CaseStatus) {
    const authResult = can(actor, 'READ', 'COUNSELOR_CASE', 'DIRECT_CARE_REVIEW');
    if (!authResult.granted) {
      throw new Error(`Unauthorized triage access: ${authResult.reason}`);
    }

    return this.prisma.counselorCase.findMany({
      where: status ? { status } : undefined,
      include: {
        risk_evaluation: true,
        assigned_counselor: {
          select: { id: true, full_name: true },
        },
        feedback: true,
      },
      orderBy: { opened_at: 'desc' },
    });
  }

  /**
   * Retrieves a single triage case by ID for counselor review.
   * Strictly pseudonymous with plain-language signals; zero student PII.
   */
  async getTriageCaseById(actor: SessionActor, caseId: string) {
    const authResult = can(actor, 'READ', 'COUNSELOR_CASE', 'DIRECT_CARE_REVIEW');
    if (!authResult.granted) {
      throw new Error(`Unauthorized triage access: ${authResult.reason}`);
    }

    const triageCase = await this.prisma.counselorCase.findUnique({
      where: { id: caseId },
      include: {
        risk_evaluation: true,
        assigned_counselor: {
          select: { id: true, full_name: true },
        },
        feedback: true,
      },
    });

    if (!triageCase) {
      throw new Error(`Triage case not found: ${caseId}`);
    }

    return triageCase;
  }

  /**
   * Records counselor feedback on alert quality (e.g. Actionable vs False Alarm).
   * Fuels false-alarm minimization without compromising student privacy.
   */
  async recordCaseFeedback(
    actor: SessionActor,
    caseId: string,
    rating: FeedbackRating,
    notes?: string
  ) {
    const authResult = can(actor, 'WRITE', 'COUNSELOR_CASE', 'DIRECT_CARE_REVIEW');
    if (!authResult.granted) {
      throw new Error(`Unauthorized feedback write: ${authResult.reason}`);
    }

    const existingCase = await this.prisma.counselorCase.findUnique({
      where: { id: caseId },
    });
    if (!existingCase) {
      throw new Error(`Triage case not found: ${caseId}`);
    }

    const feedback = await this.prisma.caseFeedback.upsert({
      where: { counselor_case_id: caseId },
      create: {
        counselor_case_id: caseId,
        feedback_rating: rating,
        notes: notes ?? null,
      },
      update: {
        feedback_rating: rating,
        notes: notes ?? null,
        submitted_at: new Date(),
      },
    });

    await logAuditEvent(
      actor.id,
      actor.role,
      'UPDATE_CASE_FEEDBACK',
      'COUNSELOR_CASE',
      existingCase.student_pseudo_id,
      {
        event_category: 'TRIAGE',
        reason_code: 'TIER_CHANGE_REVIEW',
      },
      this.prisma
    );

    return feedback;
  }

  /**
   * Staff reads of student telemetry:
   * Strictly audited with declared purpose (DIRECT_CARE_REVIEW).
   * Personal journals are NEVER returned to staff under any circumstances.
   */
  async getStudentTelemetryForStaff(
    actor: SessionActor,
    studentPseudoId: string,
    purpose: AccessPurpose
  ) {
    const authResult = can(actor, 'READ', 'STUDENT_PROFILE', purpose, {
      targetStudentPseudoId: studentPseudoId,
    });
    if (!authResult.granted) {
      throw new Error(`Unauthorized staff telemetry read: ${authResult.reason}`);
    }

    // Mandatory audit logging for staff reads
    await logAuditEvent(
      actor.id,
      actor.role,
      'STAFF_TELEMETRY_READ',
      'STUDENT_PROFILE',
      studentPseudoId,
      {
        event_category: 'TRIAGE',
        reason_code: 'CARE_TRIAGE_UNMASK',
      },
      this.prisma
    );

    const profile = await this.prisma.studentProfile.findUnique({
      where: { student_pseudo_id: studentPseudoId },
      include: {
        risk_evaluations: { orderBy: { evaluated_at: 'desc' }, take: 10 },
        academic_signals: { orderBy: { recorded_at: 'desc' }, take: 10 },
        help_seeking_signals: { orderBy: { recorded_at: 'desc' }, take: 10 },
        // journal_entries is strictly omitted to preserve personal journal envelope privacy
      },
    });

    return profile;
  }

  /**
   * Student's own telemetry read:
   * Only accessible by the student themselves under SELF_VIEW.
   * NOT audited individually to preserve student privacy and prevent surveillance chilling effects.
   */
  async getStudentOwnTelemetry(actor: SessionActor) {
    if (actor.role !== Role.STUDENT || !actor.student_pseudo_id) {
      throw new Error('Only authenticated students can access their personal telemetry.');
    }

    const profile = await this.prisma.studentProfile.findUnique({
      where: { student_pseudo_id: actor.student_pseudo_id },
      include: {
        risk_evaluations: { orderBy: { evaluated_at: 'desc' }, take: 20 },
        academic_signals: { orderBy: { recorded_at: 'desc' }, take: 20 },
        help_seeking_signals: { orderBy: { recorded_at: 'desc' }, take: 20 },
        survey_responses: { orderBy: { submitted_at: 'desc' }, take: 20 },
      },
    });

    return profile;
  }
}
