import { describe, it, expect, vi } from 'vitest';
import { DataAccessLayer } from '@/lib/dal';
import { Role, RiskTier } from '@prisma/client';
import { SessionActor } from '@/lib/auth/policy';
import fs from 'node:fs';
import path from 'node:path';

describe('B3: Authorization & DAL Invariants (src/lib/dal/index.ts)', () => {
  const counselorActor: SessionActor = {
    id: 'counselor_vikram',
    role: Role.COUNSELOR,
    email: 'counselor@campus.edu',
    institution_id: 'inst_nitd',
  };

  const studentActor: SessionActor = {
    id: 'student_aarav',
    role: Role.STUDENT,
    email: 'student@campus.edu',
    institution_id: 'inst_nitd',
    student_pseudo_id: 'ps_aarav_123',
  };

  const adminActor: SessionActor = {
    id: 'admin_anjali',
    role: Role.ADMIN,
    email: 'admin@campus.edu',
    institution_id: 'inst_nitd',
  };

  describe('1. Architectural Rule: No Direct PrismaClient Outside DAL', () => {
    function scanDirectoryForPrisma(dir: string): string[] {
      const violations: string[] = [];
      const files = fs.readdirSync(dir, { withFileTypes: true });

      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          violations.push(...scanDirectoryForPrisma(fullPath));
        } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('new PrismaClient(')) {
            violations.push(fullPath);
          }
        }
      }
      return violations;
    }

    it('ensures src/app and src/components do NOT instantiate PrismaClient directly', () => {
      const appViolations = scanDirectoryForPrisma(path.resolve(process.cwd(), 'src/app'));
      const componentViolations = scanDirectoryForPrisma(
        path.resolve(process.cwd(), 'src/components')
      );

      expect(appViolations).toEqual([]);
      expect(componentViolations).toEqual([]);
    });
  });

  describe('2. Staff Reads Audited With Declared Purpose', () => {
    it('audits staff telemetry read with declared DIRECT_CARE_REVIEW purpose and omits private journals', async () => {
      const auditEvents: unknown[] = [];
      const mockPrisma = {
        studentProfile: {
          findUnique: vi.fn().mockResolvedValue({
            student_pseudo_id: 'ps_student_01',
            risk_evaluations: [{ tier: RiskTier.TIER_2 }],
            academic_signals: [{ attendance_drift_detected: true }],
            help_seeking_signals: [{ action_type: 'VIEW_RESOURCES' }],
            // Note: journal_entries omitted
          }),
        },
        auditLogEntry: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockImplementation(({ data }) => {
            auditEvents.push(data);
            return Promise.resolve({ id: 'aud_read_1', ...data });
          }),
        },
      } as any;

      const dal = new DataAccessLayer(mockPrisma);
      const res = await dal.getStudentTelemetryForStaff(
        counselorActor,
        'ps_student_01',
        'DIRECT_CARE_REVIEW'
      );

      expect(res).toBeDefined();
      expect(res?.student_pseudo_id).toBe('ps_student_01');
      expect((res as any).journal_entries).toBeUndefined(); // Zero journal leakage

      // Confirms audit event emitted
      expect(auditEvents.length).toBeGreaterThan(0);
      expect((auditEvents[0] as any).action_type).toBe('STAFF_TELEMETRY_READ');
    });

    it('rejects staff reads without authorized purpose', async () => {
      const dal = new DataAccessLayer({} as any);
      await expect(
        dal.getStudentTelemetryForStaff(counselorActor, 'ps_student_01', 'SELF_VIEW')
      ).rejects.toThrow('Unauthorized staff telemetry read');
    });
  });

  describe("3. Student's Own Reads Not Audited Individually (Anti-Surveillance Chilling)", () => {
    it('allows student to view own telemetry under SELF_VIEW without generating staff audit log', async () => {
      let auditCalled = false;
      const mockPrisma = {
        studentProfile: {
          findUnique: vi.fn().mockResolvedValue({
            student_pseudo_id: 'ps_aarav_123',
            risk_evaluations: [{ tier: RiskTier.TIER_0 }],
            survey_responses: [{ instrument_type: 'PHQ_STYLE' }],
          }),
        },
        auditLogEntry: {
          create: vi.fn().mockImplementation(() => {
            auditCalled = true;
            return Promise.resolve({});
          }),
        },
      } as any;

      const dal = new DataAccessLayer(mockPrisma);
      const profile = await dal.getStudentOwnTelemetry(studentActor);

      expect(profile).toBeDefined();
      expect(profile?.student_pseudo_id).toBe('ps_aarav_123');
      // Invariant: Student reading their own profile must NOT trigger staff audit alert
      expect(auditCalled).toBe(false);
    });

    it('rejects student telemetry access if actor is not the student', async () => {
      const dal = new DataAccessLayer({} as any);
      await expect(dal.getStudentOwnTelemetry(counselorActor)).rejects.toThrow(
        'Only authenticated students can access their personal telemetry.'
      );
    });
  });

  describe('4. Identity Unmasking Invariants', () => {
    it('rejects unmasking when clinical reason is under 10 characters', async () => {
      const dal = new DataAccessLayer({} as any);
      await expect(
        dal.unmaskStudentIdentity(counselorActor, 'ps_student_01', 'too short')
      ).rejects.toThrow('A clinical justification of at least 10 characters is required');
    });

    it('rejects unmasking if student is in Tier 0 (Thriving) or Tier 1 (Watch)', async () => {
      const mockPrisma = {
        riskEvaluation: {
          findFirst: vi.fn().mockResolvedValue({ tier: RiskTier.TIER_1 }),
        },
        studentProfile: {
          findUnique: vi.fn().mockResolvedValue({
            student_pseudo_id: 'ps_student_01',
            user: { full_name: 'Test Student', email_encrypted: '{}' },
          }),
        },
        consentState: {
          findUnique: vi.fn().mockResolvedValue({ consent_counselor_triage: true }),
        },
      } as any;

      const dal = new DataAccessLayer(mockPrisma);
      await expect(
        dal.unmaskStudentIdentity(
          counselorActor,
          'ps_student_01',
          'Clinical outreach for academic drift observation'
        )
      ).rejects.toThrow('Unauthorized unmasking attempt');
    });

    it('rejects unmasking if student has revoked counselor triage consent', async () => {
      const mockPrisma = {
        riskEvaluation: {
          findFirst: vi.fn().mockResolvedValue({ tier: RiskTier.TIER_3 }),
        },
        studentProfile: {
          findUnique: vi.fn().mockResolvedValue({
            student_pseudo_id: 'ps_student_01',
            user: { full_name: 'Test Student', email_encrypted: '{}' },
          }),
        },
        consentState: {
          findUnique: vi.fn().mockResolvedValue({ consent_counselor_triage: false }), // REVOKED!
        },
      } as any;

      const dal = new DataAccessLayer(mockPrisma);
      await expect(
        dal.unmaskStudentIdentity(
          counselorActor,
          'ps_student_01',
          'Tier 3 high-priority clinical review required'
        )
      ).rejects.toThrow('Unauthorized unmasking attempt');
    });
  });

  describe('5. Administrator k >= 10 Anonymity Guard', () => {
    it('suppresses cohort metrics if cohort size is strictly less than 10', async () => {
      const mockPrisma = {
        studentProfile: {
          count: vi.fn().mockResolvedValue(9), // 9 < 10
        },
      } as any;

      const dal = new DataAccessLayer(mockPrisma);
      const metrics = await dal.getCohortMetrics(adminActor, 'Mechanical Engineering', '2026');

      expect(metrics.suppressed).toBe(true);
      expect(metrics.total_students).toBe(9);
      expect(metrics.suppression_reason).toContain('k-anonymity minimum');
      expect(metrics.tier_distribution).toBeUndefined();
    });

    it('returns aggregate metrics when cohort size is at least 10', async () => {
      const mockPrisma = {
        studentProfile: {
          count: vi.fn().mockResolvedValue(10), // exactly 10
          findMany: vi.fn().mockResolvedValue(
            Array.from({ length: 10 }, () => ({
              risk_evaluations: [{ tier: RiskTier.TIER_0 }],
              academic_signals: [{ attendance_percentage: 95.0 }],
            }))
          ),
        },
      } as any;

      const dal = new DataAccessLayer(mockPrisma);
      const metrics = await dal.getCohortMetrics(adminActor, 'Computer Science', '2026');

      expect(metrics.suppressed).toBe(false);
      expect(metrics.total_students).toBe(10);
      expect(metrics.tier_distribution?.[RiskTier.TIER_0]).toBe(10);
      expect(metrics.average_attendance_percentage).toBe(95.0);
    });
  });
});
