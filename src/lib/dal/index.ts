import { PrismaClient, RiskTier, CaseStatus } from '@prisma/client';
import { can, SessionActor } from '@/lib/auth/policy';
import crypto from 'node:crypto';

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
    const latestEval = await this.prisma.riskEvaluation.findFirst({
      where: { student_pseudo_id: studentPseudoId },
      orderBy: { evaluated_at: 'desc' },
    });

    if (!latestEval) {
      throw new Error('No risk evaluation found for the specified student.');
    }

    const pseudoMap = await this.prisma.pseudonymMap.findUnique({
      where: { student_pseudo_id: studentPseudoId },
      include: {
        user: {
          include: {
            consent_state: true,
          },
        },
      },
    });

    if (!pseudoMap || !pseudoMap.user) {
      throw new Error('Student pseudonym mapping not found.');
    }

    const consentActive = pseudoMap.user.consent_state?.consent_counselor_triage ?? false;

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
    const lastAudit = await this.prisma.auditLogEntry.findFirst({
      orderBy: { timestamp: 'desc' },
    });
    const prevHash = lastAudit?.current_entry_hash || '0'.repeat(64);
    const timestamp = new Date();

    const auditPayload = JSON.stringify({
      actor_id: actor.id,
      action: 'UNMASK_STUDENT_IDENTITY',
      target_pseudo_id: studentPseudoId,
      timestamp: timestamp.toISOString(),
      reason: clinicalReason,
      prev_hash: prevHash,
    });
    const currentHash = crypto.createHash('sha256').update(auditPayload).digest('hex');

    const auditRecord = await this.prisma.auditLogEntry.create({
      data: {
        actor_id: actor.id,
        actor_role: actor.role,
        action_type: 'UNMASK_STUDENT_IDENTITY',
        target_pseudo_id: studentPseudoId,
        metadata: {
          clinical_reason: clinicalReason,
          risk_tier: latestEval.tier,
          confidence_score: latestEval.confidence_score,
        },
        previous_entry_hash: prevHash,
        current_entry_hash: currentHash,
        timestamp,
      },
    });

    return {
      student_pseudo_id: studentPseudoId,
      full_name: pseudoMap.user.full_name,
      email: pseudoMap.user.email,
      department: pseudoMap.user.department,
      cohort_year: pseudoMap.user.cohort_year,
      unmasked_at: timestamp.toISOString(),
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

    const profiles = await this.prisma.studentProfile.findMany({
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
    });

    const tierDistribution: Record<RiskTier, number> = {
      [RiskTier.TIER_0]: 0,
      [RiskTier.TIER_1]: 0,
      [RiskTier.TIER_2]: 0,
      [RiskTier.TIER_3]: 0,
    };

    let totalAttendance = 0;
    let attendanceCount = 0;

    for (const p of profiles) {
      const latestTier = p.risk_evaluations[0]?.tier || RiskTier.TIER_0;
      tierDistribution[latestTier]++;

      if (p.academic_signals[0]) {
        totalAttendance += p.academic_signals[0].attendance_percentage;
        attendanceCount++;
      }
    }

    return {
      suppressed: false,
      total_students: count,
      tier_distribution: tierDistribution,
      average_attendance_percentage:
        attendanceCount > 0 ? Number((totalAttendance / attendanceCount).toFixed(2)) : 0,
    };
  }

  /**
   * Retrieves open counselor triage cases (pseudonymized).
   */
  async getCounselorCases(actor: SessionActor) {
    const authResult = can(actor, 'READ', 'COUNSELOR_CASE', 'DIRECT_CARE_REVIEW');
    if (!authResult.granted) {
      throw new Error(`Unauthorized triage access: ${authResult.reason}`);
    }

    return this.prisma.counselorCase.findMany({
      where: {
        status: { in: [CaseStatus.OPEN, CaseStatus.REVIEWED] },
      },
      include: {
        risk_evaluation: true,
      },
      orderBy: {
        opened_at: 'desc',
      },
    });
  }
}
