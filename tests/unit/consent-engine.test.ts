import { describe, it, expect, vi } from 'vitest';
import {
  recordConsentChange,
  getConsentState,
  cryptoShredStudentData,
  exportStudentData,
  DEFAULT_CONSENT_STATE,
  hashIpSubnet,
  CURRENT_CONSENT_VERSION,
  CONSENT_TEXT_MANIFEST,
  generateConsentReceipt,
  verifyConsentReceipt,
  processRevocationDeletionJobs,
} from '@/lib/consent';
import { ConsentToggleName, JobStatus } from '@prisma/client';
import { can, SessionActor } from '@/lib/auth/policy';
import supportSnapshot from '@/data/support-snapshot.json';

describe('B4: Granular Consent Engine, Receipts & Crypto-Shredding (src/lib/consent)', () => {
  it('anonymizes IP subnets with SHA-256 prefix', () => {
    const h1 = hashIpSubnet('192.168.1.100');
    const h2 = hashIpSubnet('192.168.1.100');
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
    expect(hashIpSubnet(undefined)).toBe('0000000000000000');
  });

  it('returns default all-false consent state when no record exists', async () => {
    const mockPrisma = {
      consentState: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    } as any;

    const state = await getConsentState('user_new', mockPrisma);
    expect(state).toEqual(DEFAULT_CONSENT_STATE);
  });

  it('records consent change, appends to immutable ledger, and upserts state', async () => {
    const createdRecords: any[] = [];
    let stateHolder: any = null;
    const auditEvents: any[] = [];

    const mockPrisma = {
      consentState: {
        findUnique: vi.fn().mockImplementation(() => Promise.resolve(stateHolder)),
        upsert: vi.fn().mockImplementation(({ create, update }) => {
          stateHolder = stateHolder ? { ...stateHolder, ...update } : { ...create };
          return Promise.resolve(stateHolder);
        }),
      },
      consentRecord: {
        create: vi.fn().mockImplementation(({ data }) => {
          createdRecords.push(data);
          return Promise.resolve({ id: 'rec_1', ...data });
        }),
      },
      auditLogEntry: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(({ data }) => {
          auditEvents.push(data);
          return Promise.resolve({ id: 'audit_1', ...data });
        }),
      },
    } as any;

    const updated = await recordConsentChange(
      'user_123',
      { consent_surveys: true, consent_academic: true },
      'ONBOARDING_CHOICE',
      '10.0.0.1',
      mockPrisma
    );

    expect(updated.consent_surveys).toBe(true);
    expect(updated.consent_academic).toBe(true);
    expect(updated.consent_help_seeking).toBe(false);
    expect(updated.consent_journal_signals).toBe(false);

    expect(createdRecords).toHaveLength(2);
    expect(createdRecords[0].user_id).toBe('user_123');
    expect(createdRecords[0].action).toBe('GRANTED');

    expect(auditEvents).toHaveLength(1);
    expect(auditEvents[0].action_type).toBe('CONSENT_UPDATE');
  });

  it('executes cryptographic shredding: destroys StudentKey and records audit event', async () => {
    let keyDeleted = false;
    let casesDeleted = false;
    const auditEvents: any[] = [];

    const mockPrisma = {
      studentKey: {
        deleteMany: vi.fn().mockImplementation(() => {
          keyDeleted = true;
          return Promise.resolve({ count: 1 });
        }),
      },
      studentProfile: {
        findUnique: vi.fn().mockResolvedValue({ student_pseudo_id: 'pseudo_to_shred' }),
      },
      counselorCase: {
        deleteMany: vi.fn().mockImplementation(() => {
          casesDeleted = true;
          return Promise.resolve({ count: 1 });
        }),
      },
      consentState: {
        findUnique: vi.fn().mockResolvedValue({ user_id: 'user_to_shred', consent_surveys: true }),
        upsert: vi.fn().mockResolvedValue({}),
      },
      consentRecord: {
        create: vi.fn().mockResolvedValue({}),
      },
      auditLogEntry: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(({ data }) => {
          auditEvents.push(data);
          return Promise.resolve({ id: 'audit_shred', ...data });
        }),
      },
    } as any;

    const result = await cryptoShredStudentData(
      'user_to_shred',
      'User requested account erasure',
      mockPrisma
    );

    expect(result.success).toBe(true);
    expect(result.keys_destroyed).toBe(true);
    expect(result.journals_permanently_unrecoverable).toBe(true);
    expect(keyDeleted).toBe(true);
    expect(casesDeleted).toBe(true);

    const shredAudit = auditEvents.find((e) => e.action_type === 'DATA_ERASURE_CRYPTO_SHRED');
    expect(shredAudit).toBeDefined();
    expect(shredAudit.target_pseudo_id).toBe('pseudo_to_shred');
  });

  it('exports comprehensive, machine-readable student data archive with checksum', async () => {
    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'usr_export_1',
          email: 'student@campus.edu',
          full_name: 'Aarav Sharma',
          department: 'CSE',
          cohort_year: '2026',
          created_at: new Date('2026-09-01T00:00:00Z'),
          student_profile: { student_pseudo_id: 'pseudo_export_1' },
          consent_state: {
            consent_surveys: true,
            consent_academic: false,
            consent_help_seeking: true,
            consent_counselor_triage: true,
            consent_journal_signals: false,
            emergency_escalation_acknowledged: true,
          },
          consent_records: [
            {
              id: 'rec_1',
              toggle: 'consent_surveys',
              action: 'GRANTED',
              consent_text_version: '1.0.0',
              locale: 'en',
              created_at: new Date('2026-09-01T00:00:00Z'),
            },
          ],
        }),
      },
      surveyResponse: {
        findMany: vi
          .fn()
          .mockResolvedValue([
            { id: 's1', instrument_type: 'PHQ_STYLE', normalized_score: 0.2 },
          ]),
      },
      academicSignal: {
        findMany: vi.fn().mockResolvedValue([{ id: 'a1', attendance_percentage: 95.0 }]),
      },
      helpSeekingSignal: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      riskEvaluation: {
        findMany: vi
          .fn()
          .mockResolvedValue([{ id: 'r1', tier: 'TIER_0', confidence_score: 0.95 }]),
      },
      journalEntry: {
        count: vi.fn().mockResolvedValue(3),
      },
    } as any;

    const exportData = await exportStudentData('usr_export_1', mockPrisma);

    expect(exportData.export_version).toBe('1.0.0');
    expect(exportData.user_id).toBe('usr_export_1');
    expect(exportData.student_pseudo_id).toBe('pseudo_export_1');
    expect(exportData.account.email).toBe('student@campus.edu');
    expect(exportData.consent.current_state.consent_surveys).toBe(true);
    expect(exportData.consent.audit_history).toHaveLength(1);
    expect(exportData.telemetry.survey_responses).toHaveLength(1);
    expect(exportData.telemetry.journal_entries_count).toBe(3);
    expect(exportData.export_checksum).toHaveLength(64);
  });

  describe('Versioned Consent Text & Multilingual Manifests', () => {
    it('verifies versioned consent text manifest across English, Hindi, and Bengali', () => {
      expect(CURRENT_CONSENT_VERSION).toBe('1.0.0');
      expect(CONSENT_TEXT_MANIFEST.version).toBe('1.0.0');

      // English is authoritatively verified
      expect(CONSENT_TEXT_MANIFEST.locales.en.needsHumanReview).toBe(false);

      // Hindi and Bengali translations MUST be flagged NEEDS HUMAN REVIEW
      expect(CONSENT_TEXT_MANIFEST.locales.hi.needsHumanReview).toBe(true);
      expect(CONSENT_TEXT_MANIFEST.locales.bn.needsHumanReview).toBe(true);

      // Verify all 6 granular toggles exist in all locales
      for (const loc of ['en', 'hi', 'bn']) {
        const toggles = CONSENT_TEXT_MANIFEST.locales[loc].toggles;
        expect(toggles.consent_surveys).toBeDefined();
        expect(toggles.consent_academic).toBeDefined();
        expect(toggles.consent_help_seeking).toBeDefined();
        expect(toggles.consent_counselor_triage).toBeDefined();
        expect(toggles.consent_journal_signals).toBeDefined();
        expect(toggles.emergency_escalation_acknowledged).toBeDefined();
      }
    });
  });

  describe('Cryptographically Signed Consent Receipts', () => {
    it('generates a signed receipt and successfully verifies authenticity', () => {
      const receipt = generateConsentReceipt(
        'ps_student_01',
        'en',
        '1.0.0',
        {
          consent_surveys: true,
          consent_academic: false,
          consent_help_seeking: true,
          consent_counselor_triage: false,
          consent_journal_signals: false,
          emergency_escalation_acknowledged: true,
        },
        'test_secret_key_1234567890abcdef1234567890abcdef'
      );

      expect(receipt.receipt_id).toContain('rcpt_');
      expect(receipt.signature_algorithm).toBe('HMAC-SHA256');
      expect(receipt.hmac_signature).toHaveLength(64);

      // Authenticity verification passes
      expect(
        verifyConsentReceipt(receipt, 'test_secret_key_1234567890abcdef1234567890abcdef')
      ).toBe(true);

      // Tampered toggles fail verification
      const tampered = {
        ...receipt,
        toggles: { ...receipt.toggles, consent_academic: true },
      };
      expect(
        verifyConsentReceipt(tampered, 'test_secret_key_1234567890abcdef1234567890abcdef')
      ).toBe(false);
    });
  });

  describe('Revocation Deletion Jobs Runner', () => {
    it('purges matching passive telemetry when deletion job executes', async () => {
      let surveysDeleted = false;
      let academicDeleted = false;

      const mockPrisma = {
        revocationDeletionJob: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: 'job_01',
              student_pseudo_id: 'ps_student_01',
              toggle: ConsentToggleName.consent_surveys,
              status: JobStatus.PENDING,
            },
            {
              id: 'job_02',
              student_pseudo_id: 'ps_student_01',
              toggle: ConsentToggleName.consent_academic,
              status: JobStatus.PENDING,
            },
          ]),
          update: vi.fn().mockImplementation(({ where, data }) =>
            Promise.resolve({
              id: where.id,
              student_pseudo_id: 'ps_student_01',
              toggle:
                where.id === 'job_01'
                  ? ConsentToggleName.consent_surveys
                  : ConsentToggleName.consent_academic,
              ...data,
            })
          ),
        },
        surveyResponse: {
          deleteMany: vi.fn().mockImplementation(() => {
            surveysDeleted = true;
            return Promise.resolve({ count: 5 });
          }),
        },
        academicSignal: {
          deleteMany: vi.fn().mockImplementation(() => {
            academicDeleted = true;
            return Promise.resolve({ count: 12 });
          }),
        },
        helpSeekingSignal: {
          deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
        counselorCase: {
          deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
      } as any;

      const results = await processRevocationDeletionJobs(mockPrisma);

      expect(results).toHaveLength(2);
      expect(surveysDeleted).toBe(true);
      expect(academicDeleted).toBe(true);
      expect(results[0].status).toBe(JobStatus.COMPLETED);
      expect(results[0].recordsPurged).toBe(5);
      expect(results[1].recordsPurged).toBe(12);
    });
  });

  describe('Declining Everything Invariant', () => {
    it('verifies that declining all toggles leaves student with full access to crisis help and support directory', () => {
      const studentActorDeclinedAll: SessionActor = {
        id: 'usr_declined_all',
        role: 'STUDENT',
        email: 'declined@campus.edu',
        institution_id: 'inst_1',
        student_pseudo_id: 'ps_declined_all',
      };

      // 1. Support directory is unconditionally permitted
      const supportAuth = can(
        studentActorDeclinedAll,
        'READ',
        'SUPPORT_RESOURCE',
        'SELF_VIEW'
      );
      expect(supportAuth.granted).toBe(true);

      // 2. Snapshot crisis resources are unconditionally accessible
      expect(supportSnapshot.length).toBeGreaterThan(0);
      const emergencyResources = supportSnapshot.filter((r) => r.is_crisis_priority);
      expect(emergencyResources.length).toBeGreaterThan(0);

      // 3. Automated unmasking by counselor is blocked due to revoked consent
      const unmaskAuth = can(
        { id: 'c1', role: 'COUNSELOR', email: 'c@campus.edu', institution_id: 'i1' },
        'UNMASK',
        'STUDENT_PROFILE',
        'DIRECT_CARE_REVIEW',
        { currentTier: 'TIER_3', counselorConsentActive: false }
      );
      expect(unmaskAuth.granted).toBe(false);
      expect(unmaskAuth.reason).toContain('revoked counselor triage consent');
    });
  });
});
