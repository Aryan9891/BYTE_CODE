import { describe, it, expect, vi } from "vitest";
import { computeAuditEntryHash, verifyAuditChain } from "@/lib/audit";

describe("Tamper-Evident Hash-Chained Audit Ledger (src/lib/audit/index.ts)", () => {
  it("computes deterministic SHA-256 hash across canonical fields", () => {
    const prev = "0".repeat(64);
    const ts = "2026-11-02T12:00:00.000Z";
    const h1 = computeAuditEntryHash(prev, ts, "user_1", "ADMIN", "TEST_ACTION", "pseudo_1", { note: "test" });
    const h2 = computeAuditEntryHash(prev, ts, "user_1", "ADMIN", "TEST_ACTION", "pseudo_1", { note: "test" });

    expect(h1).toBe(h2);
    expect(h1).toHaveLength(64);
  });

  it("verifies a valid linear hash chain from genesis to head", async () => {
    const ts1 = new Date("2026-11-01T10:00:00Z");
    const prev0 = "0".repeat(64);
    const hash1 = computeAuditEntryHash(prev0, ts1, "admin_1", "ADMIN", "GENESIS", null, { block: 1 });

    const ts2 = new Date("2026-11-01T11:00:00Z");
    const hash2 = computeAuditEntryHash(hash1, ts2, "counselor_1", "COUNSELOR", "OUTREACH", "pseudo_student_1", {
      block: 2,
    });

    const ts3 = new Date("2026-11-01T12:00:00Z");
    const hash3 = computeAuditEntryHash(hash2, ts3, "student_1", "STUDENT", "CONSENT_UPDATE", null, { block: 3 });

    const mockPrisma = {
      auditLogEntry: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "entry_1",
            timestamp: ts1,
            actor_id: "admin_1",
            actor_role: "ADMIN",
            action_type: "GENESIS",
            target_pseudo_id: null,
            metadata: { block: 1 },
            previous_entry_hash: prev0,
            current_entry_hash: hash1,
          },
          {
            id: "entry_2",
            timestamp: ts2,
            actor_id: "counselor_1",
            actor_role: "COUNSELOR",
            action_type: "OUTREACH",
            target_pseudo_id: "pseudo_student_1",
            metadata: { block: 2 },
            previous_entry_hash: hash1,
            current_entry_hash: hash2,
          },
          {
            id: "entry_3",
            timestamp: ts3,
            actor_id: "student_1",
            actor_role: "STUDENT",
            action_type: "CONSENT_UPDATE",
            target_pseudo_id: null,
            metadata: { block: 3 },
            previous_entry_hash: hash2,
            current_entry_hash: hash3,
          },
        ]),
      },
    } as any;

    const result = await verifyAuditChain(mockPrisma);
    expect(result.valid).toBe(true);
    expect(result.totalEntries).toBe(3);
    expect(result.brokenAtIndex).toBeUndefined();
  });

  it("detects payload tampering in any block of the audit chain", async () => {
    const ts1 = new Date("2026-11-01T10:00:00Z");
    const prev0 = "0".repeat(64);
    const hash1 = computeAuditEntryHash(prev0, ts1, "admin_1", "ADMIN", "GENESIS", null, { block: 1 });

    const ts2 = new Date("2026-11-01T11:00:00Z");
    const hash2 = computeAuditEntryHash(hash1, ts2, "counselor_1", "COUNSELOR", "OUTREACH", "pseudo_student_1", {
      block: 2,
    });

    const mockPrisma = {
      auditLogEntry: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "entry_1",
            timestamp: ts1,
            actor_id: "admin_1",
            actor_role: "ADMIN",
            action_type: "GENESIS",
            target_pseudo_id: null,
            metadata: { block: 1 },
            previous_entry_hash: prev0,
            current_entry_hash: hash1,
          },
          {
            id: "entry_2",
            timestamp: ts2,
            actor_id: "counselor_1",
            actor_role: "COUNSELOR",
            action_type: "OUTREACH",
            target_pseudo_id: "pseudo_student_1",
            metadata: { block: 2, tampered: true }, // TAMPERED!
            previous_entry_hash: hash1,
            current_entry_hash: hash2,
          },
        ]),
      },
    } as any;

    const result = await verifyAuditChain(mockPrisma);
    expect(result.valid).toBe(false);
    expect(result.brokenAtIndex).toBe(1);
    expect(result.brokenEntryId).toBe("entry_2");
    expect(result.error).toContain("Payload tampering detected at block 1");
  });

  it("detects broken chain pointers (missing or reordered block)", async () => {
    const ts1 = new Date("2026-11-01T10:00:00Z");
    const prev0 = "0".repeat(64);
    const hash1 = computeAuditEntryHash(prev0, ts1, "admin_1", "ADMIN", "GENESIS", null, null);

    const ts2 = new Date("2026-11-01T11:00:00Z");
    const hash2 = computeAuditEntryHash(hash1, ts2, "counselor_1", "COUNSELOR", "ACTION", null, null);

    const mockPrisma = {
      auditLogEntry: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: "entry_1",
            timestamp: ts1,
            actor_id: "admin_1",
            actor_role: "ADMIN",
            action_type: "GENESIS",
            target_pseudo_id: null,
            metadata: null,
            previous_entry_hash: prev0,
            current_entry_hash: hash1,
          },
          {
            id: "entry_2",
            timestamp: ts2,
            actor_id: "counselor_1",
            actor_role: "COUNSELOR",
            action_type: "ACTION",
            target_pseudo_id: null,
            metadata: null,
            previous_entry_hash: "corrupted_or_different_hash".padEnd(64, "0"), // BROKEN POINTER
            current_entry_hash: hash2,
          },
        ]),
      },
    } as any;

    const result = await verifyAuditChain(mockPrisma);
    expect(result.valid).toBe(false);
    expect(result.brokenAtIndex).toBe(1);
    expect(result.error).toContain("Broken chain pointer at block 1");
  });
});
