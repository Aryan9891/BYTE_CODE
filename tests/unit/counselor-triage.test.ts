import { describe, it, expect, vi } from 'vitest';
import { DataAccessLayer, FeedbackRating, Role, RiskTier } from '@/lib/dal';
import { SessionActor } from '@/lib/auth/policy';
import { encryptEmail } from '@/lib/crypto/email';

describe('B5: Case Management & Counselor Triage Queue', () => {
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
    student_pseudo_id: 'pseudo_student_aarav_sharma',
  };

  const testMasterKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  describe('1. Zero-PII Triage Queue & Non-Diagnostic Plain Language', () => {
    it('returns only pseudonymous cases with zero student PII', async () => {
      const mockPrisma = {
        counselorCase: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: 'case_001',
              student_pseudo_id: 'pseudo_student_aarav_sharma',
              status: 'OPEN',
              opened_at: new Date('2026-11-02T10:00:00Z'),
              risk_evaluation: {
                id: 'eval_001',
                tier: RiskTier.TIER_3,
                confidence_score: 0.88,
                plain_language_reasons: [
                  'Survey vector: Self-reported exhaustion score elevated (+3.1sigma vs personal baseline).',
                  'Academic drift: 3 consecutive assignments submitted past deadline.',
                  'Help-seeking patterns: 2 abandoned counselor appointment booking attempts.',
                ],
                corroboration_details: {
                  survey_z_score: 3.1,
                  academic_drift_pct: -22,
                  abandoned_bookings: 2,
                },
              },
              assigned_counselor: {
                id: 'counselor_vikram',
                full_name: 'Dr. Vikram Malhotra',
              },
              feedback: null,
            },
          ]),
        },
      };

      const dal = new DataAccessLayer(mockPrisma as unknown as undefined);
      const cases = await dal.getActiveTriageCases(counselorActor);

      expect(cases).toHaveLength(1);
      const firstCase = cases[0];

      // Assert pseudonymous identification
      expect(firstCase.student_pseudo_id).toBe('pseudo_student_aarav_sharma');
      expect((firstCase as Record<string, unknown>).email).toBeUndefined();
      expect((firstCase as Record<string, unknown>).full_name).toBeUndefined();
      expect((firstCase as Record<string, unknown>).student_id).toBeUndefined();

      // Assert non-diagnostic language: no clinical terms
      const allReasons = (firstCase.risk_evaluation?.plain_language_reasons as string[]) || [];
      const forbiddenClinicalTerms = ['depressed', 'depression', 'bipolar', 'schizophrenia', 'disorder', 'pathology', 'clinical gad'];
      for (const reason of allReasons) {
        for (const term of forbiddenClinicalTerms) {
          expect(reason.toLowerCase()).not.toContain(term);
        }
      }
    });

    it('rejects student role from accessing the counselor triage queue', async () => {
      const dal = new DataAccessLayer({} as unknown as undefined);
      await expect(dal.getActiveTriageCases(studentActor)).rejects.toThrow(
        /Unauthorized triage access/i
      );
    });
  });

  describe('2. Identity Unmasking Ethical Guardrails', () => {
    it('rejects unmasking when clinical reason is less than 10 characters', async () => {
      const dal = new DataAccessLayer({} as unknown as undefined);
      await expect(
        dal.unmaskStudentIdentity(counselorActor, 'pseudo_student_01', 'too short')
      ).rejects.toThrow(/clinical justification of at least 10 characters is required/i);
    });

    it('rejects unmasking when student is Tier 0 or Tier 1', async () => {
      const mockPrisma = {
        riskEvaluation: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'eval_tier1',
            tier: RiskTier.TIER_1,
          }),
        },
        studentProfile: {
          findUnique: vi.fn().mockResolvedValue({
            department: 'Computer Science',
            cohort_year: '2026',
            user: {
              full_name: 'Ananya Sharma',
              email_encrypted: JSON.stringify(encryptEmail('ananya@campus.edu', testMasterKey)),
            },
          }),
        },
        consentState: {
          findUnique: vi.fn().mockResolvedValue({
            consent_counselor_triage: true,
          }),
        },
      };

      const dal = new DataAccessLayer(mockPrisma as unknown as undefined);
      await expect(
        dal.unmaskStudentIdentity(
          counselorActor,
          'pseudo_student_01',
          'Documented legitimate care outreach justification'
        )
      ).rejects.toThrow(/Student is not in Tier 2 .* or Tier 3/i);
    });

    it('rejects unmasking when student has NOT consented to counselor triage', async () => {
      const mockPrisma = {
        riskEvaluation: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'eval_tier3',
            tier: RiskTier.TIER_3,
          }),
        },
        studentProfile: {
          findUnique: vi.fn().mockResolvedValue({
            department: 'Computer Science',
            cohort_year: '2026',
            user: {
              full_name: 'Ananya Sharma',
              email_encrypted: JSON.stringify(encryptEmail('ananya@campus.edu', testMasterKey)),
            },
          }),
        },
        consentState: {
          findUnique: vi.fn().mockResolvedValue({
            consent_counselor_triage: false, // Student opted out
          }),
        },
      };

      const dal = new DataAccessLayer(mockPrisma as unknown as undefined);
      await expect(
        dal.unmaskStudentIdentity(
          counselorActor,
          'pseudo_student_01',
          'Documented legitimate care outreach justification'
        )
      ).rejects.toThrow(/revoked counselor triage consent|has not consented/i);
    });

    it('successfully unmasks student identity with audit record when all criteria are satisfied', async () => {
      const encrypted = encryptEmail('aarav.sharma@campus.edu', testMasterKey);

      const mockPrisma = {
        riskEvaluation: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'eval_tier3',
            tier: RiskTier.TIER_3,
          }),
        },
        studentProfile: {
          findUnique: vi.fn().mockResolvedValue({
            department: 'Electrical Engineering',
            cohort_year: '2025',
            user: {
              full_name: 'Aarav Sharma',
              email_encrypted: JSON.stringify(encrypted),
            },
          }),
        },
        consentState: {
          findUnique: vi.fn().mockResolvedValue({
            consent_counselor_triage: true,
          }),
        },
        auditLogEntry: {
          findFirst: vi.fn().mockResolvedValue({
            current_hash: 'prev_hash_123',
            sequence_number: 10n,
          }),
          create: vi.fn().mockResolvedValue({
            id: 'audit_unmask_8921',
            sequence_number: 11n,
          }),
        },
        $queryRaw: vi.fn().mockResolvedValue([{ pg_advisory_xact_lock: null }]),
        $transaction: vi.fn().mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) => {
          return callback(mockPrisma);
        }),
      };

      process.env.APP_MASTER_KEY = testMasterKey;

      const dal = new DataAccessLayer(mockPrisma as unknown as undefined);
      const result = await dal.unmaskStudentIdentity(
        counselorActor,
        'pseudo_student_aarav_sharma',
        'Student has 3 missed assignments and nocturnal stress signals; conducting supportive wellness outreach.'
      );

      expect(result.student_pseudo_id).toBe('pseudo_student_aarav_sharma');
      expect(result.full_name).toBe('Aarav Sharma');
      expect(result.email).toBe('aarav.sharma@campus.edu');
      expect(result.department).toBe('Electrical Engineering');
      expect(result.cohort_year).toBe('2025');
      expect(result.unmasked_by).toBe('counselor@campus.edu');
      expect(result.audit_entry_id).toBe('audit_unmask_8921');

      // Verify audit creation was called
      expect(mockPrisma.auditLogEntry.create).toHaveBeenCalled();
    });
  });

  describe('3. Alert-Quality Feedback & Case Lookup', () => {
    it('retrieves single triage case by ID', async () => {
      const mockPrisma = {
        counselorCase: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'case_123',
            student_pseudo_id: 'pseudo_01',
            status: 'OPEN',
            risk_evaluation: { tier: RiskTier.TIER_2 },
            assigned_counselor: { id: 'c_01', full_name: 'Dr. Rao' },
            feedback: null,
          }),
        },
      };

      const dal = new DataAccessLayer(mockPrisma as unknown as undefined);
      const res = await dal.getTriageCaseById(counselorActor, 'case_123');
      expect(res.id).toBe('case_123');
      expect(res.student_pseudo_id).toBe('pseudo_01');
    });

    it('records counselor feedback and logs an audit event', async () => {
      const mockPrisma = {
        counselorCase: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'case_123',
            student_pseudo_id: 'pseudo_student_01',
          }),
        },
        caseFeedback: {
          upsert: vi.fn().mockResolvedValue({
            id: 'feedback_001',
            counselor_case_id: 'case_123',
            feedback_rating: FeedbackRating.APPROPRIATE_TIMELY,
            notes: 'Timely catch during midterm crunch',
            submitted_at: new Date(),
          }),
        },
        auditLogEntry: {
          findFirst: vi.fn().mockResolvedValue({
            current_hash: 'hash_genesis',
            sequence_number: 1n,
          }),
          create: vi.fn().mockResolvedValue({
            id: 'audit_feedback_01',
            sequence_number: 2n,
          }),
        },
        $queryRaw: vi.fn().mockResolvedValue([{ pg_advisory_xact_lock: null }]),
        $transaction: vi.fn().mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) => {
          return callback(mockPrisma);
        }),
      };

      const dal = new DataAccessLayer(mockPrisma as unknown as undefined);
      const feedback = await dal.recordCaseFeedback(
        counselorActor,
        'case_123',
        FeedbackRating.APPROPRIATE_TIMELY,
        'Timely catch during midterm crunch'
      );

      expect(feedback.feedback_rating).toBe(FeedbackRating.APPROPRIATE_TIMELY);
      expect(mockPrisma.caseFeedback.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { counselor_case_id: 'case_123' },
        })
      );
      expect(mockPrisma.auditLogEntry.create).toHaveBeenCalled();
    });
  });
});
