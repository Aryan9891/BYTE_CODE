import { describe, it, expect, vi } from "vitest";
import {
  recordConsentChange,
  getConsentState,
  cryptoShredStudentData,
  exportStudentData,
  DEFAULT_CONSENT_STATE,
  hashIpSubnet,
} from "@/lib/consent";

describe("Granular Consent Engine & Crypto-Shredding (src/lib/consent/index.ts)", () => {
  it("anonymizes IP subnets with SHA-256 prefix", () => {
    const h1 = hashIpSubnet("192.168.1.100");
    const h2 = hashIpSubnet("192.168.1.100");
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(16);
    expect(hashIpSubnet(undefined)).toBe("0000000000000000");
  });

  it("returns default all-false consent state when no record exists", async () => {
    const mockPrisma = {
      consentState: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    } as any;

    const state = await getConsentState("user_new", mockPrisma);
    expect(state).toEqual(DEFAULT_CONSENT_STATE);
  });

  it("records consent change, appends to immutable ledger, and upserts state", async () => {
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
          return Promise.resolve({ id: "rec_1", ...data });
        }),
      },
      auditLogEntry: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(({ data }) => {
          auditEvents.push(data);
          return Promise.resolve({ id: "audit_1", ...data });
        }),
      },
    } as any;

    const updated = await recordConsentChange(
      "user_123",
      { consent_surveys: true, consent_academic: true },
      "ONBOARDING_CHOICE",
      "10.0.0.1",
      mockPrisma
    );

    expect(updated.consent_surveys).toBe(true);
    expect(updated.consent_academic).toBe(true);
    expect(updated.consent_help_seeking).toBe(false);
    expect(updated.consent_journal_signals).toBe(false);

    expect(createdRecords).toHaveLength(2);
    expect(createdRecords[0].user_id).toBe("user_123");
    expect(createdRecords[0].action).toBe("GRANTED");

    expect(auditEvents).toHaveLength(1);
    expect(auditEvents[0].action_type).toBe("CONSENT_UPDATE");
  });

  it("executes cryptographic shredding: destroys StudentKey and records audit event", async () => {
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
      pseudonymMap: {
        findUnique: vi.fn().mockResolvedValue({ student_pseudo_id: "pseudo_to_shred" }),
      },
      counselorCase: {
        deleteMany: vi.fn().mockImplementation(() => {
          casesDeleted = true;
          return Promise.resolve({ count: 1 });
        }),
      },
      consentState: {
        findUnique: vi.fn().mockResolvedValue({ user_id: "user_to_shred", consent_surveys: true }),
        upsert: vi.fn().mockResolvedValue({}),
      },
      consentRecord: {
        create: vi.fn().mockResolvedValue({}),
      },
      auditLogEntry: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(({ data }) => {
          auditEvents.push(data);
          return Promise.resolve({ id: "audit_shred", ...data });
        }),
      },
    } as any;

    const result = await cryptoShredStudentData("user_to_shred", "User requested account erasure", mockPrisma);

    expect(result.success).toBe(true);
    expect(result.keys_destroyed).toBe(true);
    expect(result.journals_permanently_unrecoverable).toBe(true);
    expect(keyDeleted).toBe(true);
    expect(casesDeleted).toBe(true);

    const shredAudit = auditEvents.find((e) => e.action_type === "DATA_ERASURE_CRYPTO_SHRED");
    expect(shredAudit).toBeDefined();
    expect(shredAudit.target_pseudo_id).toBe("pseudo_to_shred");
  });

  it("exports comprehensive, machine-readable student data archive with checksum", async () => {
    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: "usr_export_1",
          email: "student@campus.edu",
          full_name: "Aarav Sharma",
          department: "CSE",
          cohort_year: "2026",
          created_at: new Date("2026-09-01T00:00:00Z"),
          pseudonym_map: { student_pseudo_id: "pseudo_export_1" },
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
              id: "rec_1",
              change_reason: "ONBOARDING",
              created_at: new Date("2026-09-01T00:00:00Z"),
              consent_surveys: true,
              consent_academic: false,
              consent_help_seeking: true,
              consent_counselor_triage: true,
              consent_journal_signals: false,
              emergency_escalation_acknowledged: true,
            },
          ],
        }),
      },
      surveyResponse: {
        findMany: vi.fn().mockResolvedValue([{ id: "s1", instrument_type: "PHQ_STYLE", normalized_score: 0.2 }]),
      },
      academicSignal: {
        findMany: vi.fn().mockResolvedValue([{ id: "a1", attendance_percentage: 95.0 }]),
      },
      helpSeekingSignal: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      riskEvaluation: {
        findMany: vi.fn().mockResolvedValue([{ id: "r1", tier: "TIER_0", confidence_score: 0.95 }]),
      },
      journalEntry: {
        count: vi.fn().mockResolvedValue(3),
      },
    } as any;

    const exportData = await exportStudentData("usr_export_1", mockPrisma);

    expect(exportData.export_version).toBe("1.0.0");
    expect(exportData.user_id).toBe("usr_export_1");
    expect(exportData.student_pseudo_id).toBe("pseudo_export_1");
    expect(exportData.account.email).toBe("student@campus.edu");
    expect(exportData.consent.current_state.consent_surveys).toBe(true);
    expect(exportData.consent.audit_history).toHaveLength(1);
    expect(exportData.telemetry.survey_responses).toHaveLength(1);
    expect(exportData.telemetry.journal_entries_count).toBe(3);
    expect(exportData.export_checksum).toHaveLength(64);
  });
});
