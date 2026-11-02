// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient, Role, UserStatus } from '@prisma/client';
import { startEmbeddedPostgres } from '../../scripts/embedded-db';
import { cryptoShredStudentData } from '../../src/lib/consent';
import { encryptEmail, computeEmailLookupHash } from '../../src/lib/crypto/email';

describe('B6: Real PostgreSQL Cryptographic Shredding & Key Annihilation', () => {
  let dbUrl: string;
  let prisma: PrismaClient;
  let testUserId: string;
  let testPseudoId: string;

  const testMasterKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const testPepper = 'test_pepper_1234567890abcdef1234567890abcdef';

  beforeAll(async () => {
    dbUrl = await startEmbeddedPostgres();
    process.env.DATABASE_URL = dbUrl;
    process.env.APP_MASTER_KEY = testMasterKey;

    prisma = new PrismaClient({
      datasources: { db: { url: dbUrl } },
    });
    await prisma.$connect();

    // Fetch default institution
    const institution = await prisma.institution.findFirst();
    if (!institution) {
      throw new Error('Database not seeded; no institution found');
    }

    testPseudoId = 'pseudo_shred_test_' + Date.now();
    const testEmail = `shred_test_${Date.now()}@campus.edu`;

    // 1. Create a real user in the database
    const user = await prisma.user.create({
      data: {
        institution_id: institution.id,
        email_encrypted: JSON.stringify(encryptEmail(testEmail, testMasterKey)),
        email_lookup_hash: computeEmailLookupHash(testEmail, testPepper),
        password_hash: 'dummy_hash_for_test',
        full_name: 'Shred Test Student',
        role: Role.STUDENT,
        status: UserStatus.ACTIVE,
        adult_confirmed: true,
        is_synthetic: true,
      },
    });
    testUserId = user.id;

    // 2. Create student profile
    await prisma.studentProfile.create({
      data: {
        user_id: user.id,
        student_pseudo_id: testPseudoId,
        department: 'Biotechnology',
        cohort_year: '2026',
      },
    });

    // 3. Create envelope encryption keys for student (StudentKey)
    await prisma.studentKey.create({
      data: {
        user_id: user.id,
        encrypted_dek: Buffer.from('test_dek_key_32_bytes_12345678').toString('base64'),
        dek_iv: Buffer.from('test_iv_1234').toString('base64'),
        dek_auth_tag: Buffer.from('test_auth_tag_16').toString('base64'),
        kek_salt: Buffer.from('test_kek_salt_16').toString('base64'),
        key_version: 1,
      },
    });

    // 4. Create initial consent state
    await prisma.consentState.create({
      data: {
        student_pseudo_id: testPseudoId,
        consent_surveys: true,
        consent_academic: true,
        consent_help_seeking: true,
        consent_counselor_triage: true,
        consent_journal_signals: false,
        emergency_escalation_acknowledged: true,
      },
    });

    // 5. Create an encrypted journal entry using the DEK
    await prisma.journalEntry.create({
      data: {
        student_pseudo_id: testPseudoId,
        title_encrypted: 'Encrypted Title With DEK',
        content_encrypted: 'Confidential personal reflection',
        iv: 'dummy_iv_123',
        auth_tag: 'dummy_tag_123',
      },
    });
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      try {
        await prisma.journalEntry.deleteMany({ where: { student_pseudo_id: testPseudoId } });
        await prisma.studentProfile.deleteMany({ where: { user_id: testUserId } });
        await prisma.user.deleteMany({ where: { id: testUserId } });
      } catch {
        // Ignore cleanup errors
      }
      await prisma.$disconnect();
    }
  });

  it('proves that student keys exist prior to cryptographic shredding', async () => {
    const key = await prisma.studentKey.findUnique({
      where: { user_id: testUserId },
    });
    expect(key).not.toBeNull();
    expect(key?.encrypted_dek).toBeDefined();
  });

  it('permanently annihilates the StudentKey upon calling cryptoShredStudentData', async () => {
    const shredResult = await cryptoShredStudentData(
      testUserId,
      'Student invoked GDPR/DPDP Right to Erasure',
      prisma
    );

    expect(shredResult.success).toBe(true);
    expect(shredResult.keys_destroyed).toBe(true);
    expect(shredResult.journals_permanently_unrecoverable).toBe(true);

    // Assert that StudentKey row in identity.student_keys is permanently deleted
    const keyAfterShred = await prisma.studentKey.findUnique({
      where: { user_id: testUserId },
    });
    expect(keyAfterShred).toBeNull();

    // Verify all consent toggles are now revoked
    const consentAfter = await prisma.consentState.findUnique({
      where: { student_pseudo_id: testPseudoId },
    });
    expect(consentAfter?.consent_surveys).toBe(false);
    expect(consentAfter?.consent_counselor_triage).toBe(false);
  });

  it('verifies that an immutable audit log entry was created for the erasure', async () => {
    const auditEntry = await prisma.auditLogEntry.findFirst({
      where: {
        action_type: 'DATA_ERASURE_CRYPTO_SHRED',
        target_pseudo_id: testPseudoId,
      },
      orderBy: { sequence_number: 'desc' },
    });

    expect(auditEntry).not.toBeNull();
    expect(auditEntry?.actor_role).toBe(Role.STUDENT);
    expect(auditEntry?.current_hash).toHaveLength(64);
  });
});
