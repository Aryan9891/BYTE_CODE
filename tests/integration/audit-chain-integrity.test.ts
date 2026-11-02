// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from 'pg';
import { PrismaClient, Role } from '@prisma/client';
import { startEmbeddedPostgres } from '../../scripts/embedded-db';
import { logAuditEvent, verifyAuditChain, computeCanonicalAuditHash } from '../../src/lib/audit';

describe('B6: Real PostgreSQL Audit Hash Chain Integrity & Tamper Detection', () => {
  let dbUrl: string;
  let pgClient: Client;
  let prisma: PrismaClient;

  beforeAll(async () => {
    dbUrl = await startEmbeddedPostgres();
    process.env.DATABASE_URL = dbUrl;

    pgClient = new Client({ connectionString: dbUrl, ssl: false });
    await pgClient.connect();

    prisma = new PrismaClient({
      datasources: {
        db: { url: dbUrl },
      },
    });
    await prisma.$connect();

    // Clean audit table to start with known pristine chain
    await pgClient.query(`ALTER TABLE audit.audit_log_entries DISABLE TRIGGER trg_audit_log_immutable;`);
    await pgClient.query(`TRUNCATE TABLE audit.audit_log_entries;`);
    await pgClient.query(`ALTER TABLE audit.audit_log_entries ENABLE TRIGGER trg_audit_log_immutable;`);

    // Insert pristine Genesis Block
    const genesisTimestamp = new Date();
    const adminPseudo = 'act_genesis_admin';
    const genesisDetails = {
      event_category: 'SYSTEM' as const,
      reason_code: 'SYSTEM_MAINTENANCE' as const,
    };
    const genesisHash = computeCanonicalAuditHash(
      '0'.repeat(64),
      1n,
      genesisTimestamp,
      adminPseudo,
      Role.ADMIN,
      'SYSTEM_INITIALIZATION',
      'DATABASE',
      null,
      genesisDetails
    );

    await prisma.auditLogEntry.create({
      data: {
        sequence_number: 1n,
        timestamp: genesisTimestamp,
        actor_pseudo_id: adminPseudo,
        actor_role: Role.ADMIN,
        action_type: 'SYSTEM_INITIALIZATION',
        resource_type: 'DATABASE',
        target_pseudo_id: null,
        details: genesisDetails,
        previous_entry_hash: '0'.repeat(64),
        current_hash: genesisHash,
      },
    });
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
    if (pgClient) {
      await pgClient.end();
    }
  });

  it('validates a pristine audit chain on the real PostgreSQL database', async () => {
    const result = await verifyAuditChain(prisma);
    expect(result.valid).toBe(true);
    expect(result.totalEntries).toBe(1);
    expect(result.error).toBeUndefined();
  });

  it('handles 10 concurrent audit writes under advisory lock without forks or sequence collisions', async () => {
    const concurrentWrites = Array.from({ length: 10 }, (_, i) =>
      logAuditEvent(
        `concurrent_counselor_${i}`,
        Role.COUNSELOR,
        'CONCURRENT_TRIAGE_READ',
        'STUDENT_PROFILE',
        `pseudo_concurrent_student_${i}`,
        {
          event_category: 'TRIAGE',
          reason_code: 'CARE_TRIAGE_UNMASK',
        },
        prisma
      )
    );

    const results = (await Promise.all(concurrentWrites)) as Array<{
      id: string;
      current_hash: string;
    }>;
    expect(results).toHaveLength(10);
    for (const r of results) {
      expect(r.id).toBeDefined();
      expect(r.current_hash).toHaveLength(64);
    }

    // Verify chain remains 100% mathematically valid after concurrency
    const verifyResult = await verifyAuditChain(prisma);
    expect(verifyResult.valid).toBe(true);
    expect(verifyResult.totalEntries).toBe(11);
  });

  it('detects tampering and accurately points to the altered block when a row is modified', async () => {
    // 1. Fetch the latest entry
    const latestEntryRes = await pgClient.query(
      `SELECT id, action_type, details FROM audit.audit_log_entries ORDER BY sequence_number DESC LIMIT 1;`
    );
    const target = latestEntryRes.rows[0];
    const originalAction = target.action_type;

    try {
      // 2. Temporarily disable trigger and tamper with the row's action_type directly
      await pgClient.query(`ALTER TABLE audit.audit_log_entries DISABLE TRIGGER trg_audit_log_immutable;`);
      await pgClient.query(
        `UPDATE audit.audit_log_entries SET action_type = 'UNAUTHORIZED_ALTERATION' WHERE id = $1;`,
        [target.id]
      );
      await pgClient.query(`ALTER TABLE audit.audit_log_entries ENABLE TRIGGER trg_audit_log_immutable;`);

      // 3. Chain verification MUST fail and identify the altered entry
      const tamperedVerification = await verifyAuditChain(prisma);
      expect(tamperedVerification.valid).toBe(false);
      expect(tamperedVerification.brokenEntryId).toBe(target.id);
      expect(tamperedVerification.error).toBeDefined();
    } finally {
      // 4. Restore original state so the audit chain remains pristine
      await pgClient.query(`ALTER TABLE audit.audit_log_entries DISABLE TRIGGER trg_audit_log_immutable;`);
      await pgClient.query(
        `UPDATE audit.audit_log_entries SET action_type = $1 WHERE id = $2;`,
        [originalAction, target.id]
      );
      await pgClient.query(`ALTER TABLE audit.audit_log_entries ENABLE TRIGGER trg_audit_log_immutable;`);

      // Confirm pristine restoration
      const restored = await verifyAuditChain(prisma);
      expect(restored.valid).toBe(true);
    }
  });
});
