// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from 'pg';
import { startEmbeddedPostgres } from '../../scripts/embedded-db';

describe('B6: Real PostgreSQL Immutability Triggers (Port 5433)', () => {
  let dbUrl: string;
  let client: Client;

  beforeAll(async () => {
    dbUrl = await startEmbeddedPostgres();
    client = new Client({
      connectionString: dbUrl,
      ssl: false,
    });
    await client.connect();
  }, 30000);

  afterAll(async () => {
    if (client) {
      await client.end();
    }
  });

  describe('1. audit.audit_log_entries Trigger Immutability', () => {
    it('rejects UPDATE statements on audit_log_entries with trigger exception', async () => {
      let threwError = false;
      try {
        await client.query(`UPDATE audit.audit_log_entries SET action_type = 'TAMPERED_ACTION';`);
      } catch (err: unknown) {
        threwError = true;
        const msg = err instanceof Error ? err.message : String(err);
        expect(msg).toMatch(/Sahayak Security Invariant: Audit log entries are cryptographically chained and strictly immutable/i);
      }
      expect(threwError).toBe(true);
    });

    it('rejects DELETE statements on audit_log_entries with trigger exception', async () => {
      let threwError = false;
      try {
        await client.query(`DELETE FROM audit.audit_log_entries WHERE sequence_number > 0;`);
      } catch (err: unknown) {
        threwError = true;
        const msg = err instanceof Error ? err.message : String(err);
        expect(msg).toMatch(/Sahayak Security Invariant: Audit log entries are cryptographically chained and strictly immutable/i);
      }
      expect(threwError).toBe(true);
    });

    it('rejects TRUNCATE statements on audit_log_entries with trigger exception', async () => {
      let threwError = false;
      try {
        await client.query(`TRUNCATE TABLE audit.audit_log_entries;`);
      } catch (err: unknown) {
        threwError = true;
        const msg = err instanceof Error ? err.message : String(err);
        expect(msg).toMatch(/Sahayak Security Invariant: Audit log entries are cryptographically chained and strictly immutable/i);
      }
      expect(threwError).toBe(true);
    });
  });

  describe('2. identity.consent_records Trigger Immutability & Erasure Guard', () => {
    it('rejects UPDATE statements on consent_records with trigger exception', async () => {
      let threwError = false;
      try {
        await client.query(`UPDATE identity.consent_records SET action = 'REVOKED';`);
      } catch (err: unknown) {
        threwError = true;
        const msg = err instanceof Error ? err.message : String(err);
        expect(msg).toMatch(/Sahayak Security Invariant: ConsentRecord rows are append-only legal evidence/i);
      }
      expect(threwError).toBe(true);
    });

    it('rejects unauthorized DELETE statements on consent_records without session authorization flag', async () => {
      let threwError = false;
      try {
        await client.query(`DELETE FROM identity.consent_records WHERE consent_text_version = '1.0.0';`);
      } catch (err: unknown) {
        threwError = true;
        const msg = err instanceof Error ? err.message : String(err);
        expect(msg).toMatch(/Sahayak Security Invariant: Direct deletion of ConsentRecord rows is forbidden/i);
      }
      expect(threwError).toBe(true);
    });

    it('allows DELETE on consent_records when sahayak.authorized_erasure is set to true', async () => {
      // In a transaction, set the session local variable and verify deletion succeeds without error
      await client.query('BEGIN;');
      await client.query(`SET LOCAL sahayak.authorized_erasure = 'true';`);
      const deleteResult = await client.query(
        `DELETE FROM identity.consent_records WHERE student_pseudo_id = 'non_existent_dummy_student';`
      );
      expect(deleteResult.command).toBe('DELETE');
      await client.query('ROLLBACK;');
    });
  });
});
