import { describe, it, expect, vi } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { isDomainAllowed, validateAgeGate } from "@/lib/auth/validators";
import { can, SessionActor, K_ANONYMITY_MIN_COHORT_SIZE } from "@/lib/auth/policy";
import { DataAccessLayer } from "@/lib/dal";
import { Role, RiskTier } from "@prisma/client";

describe("1. Password Security & Argon2id (src/lib/auth/password.ts)", () => {
  it("hashes passwords using Argon2id and verifies correctly", async () => {
    const raw = "SahayakSecure2026!";
    const hash = await hashPassword(raw);

    expect(hash).toContain("$argon2id$");
    expect(await verifyPassword(hash, raw)).toBe(true);
    expect(await verifyPassword(hash, "WrongPassword123!")).toBe(false);
  });

  it("rejects passwords shorter than 8 characters", async () => {
    await expect(hashPassword("short")).rejects.toThrow("Password must be at least 8 characters long.");
  });

  it("returns false for invalid or empty hash comparisons", async () => {
    expect(await verifyPassword("", "password123")).toBe(false);
    expect(await verifyPassword("invalid_hash", "")).toBe(false);
  });
});

describe("2. Domain Allowlist & Age Gate (src/lib/auth/validators.ts)", () => {
  const allowed = ["campus.edu", "student.campus.edu", "nitd.ac.in"];

  it("validates approved institutional domains and subdomains", () => {
    expect(isDomainAllowed("student@campus.edu", allowed)).toBe(true);
    expect(isDomainAllowed("faculty@student.campus.edu", allowed)).toBe(true);
    expect(isDomainAllowed("researcher@cs.campus.edu", allowed)).toBe(true);
    expect(isDomainAllowed("dean@nitd.ac.in", allowed)).toBe(true);

    expect(isDomainAllowed("intruder@external.com", allowed)).toBe(false);
    expect(isDomainAllowed("student@fakecampus.edu", allowed)).toBe(false);
    expect(isDomainAllowed("not-an-email", allowed)).toBe(false);
    expect(isDomainAllowed("", allowed)).toBe(false);
  });

  it("enforces DPDP Act 2023 age gate (18+ requirement)", () => {
    const adult = validateAgeGate(20);
    expect(adult.isAllowed).toBe(true);
    expect(adult.age).toBe(20);
    expect(adult.supportiveAction).toBe("PROCEED_TO_ONBOARDING");

    const minor = validateAgeGate(17);
    expect(minor.isAllowed).toBe(false);
    expect(minor.age).toBe(17);
    expect(minor.supportiveAction).toBe("DIRECT_CRISIS_SUPPORT_ONLY");
    expect(minor.legalReviewRequired).toBe(true);
    expect(minor.message).toContain("DPDP Act 2023");

    // Test with Date object
    const nineteenYearsAgo = new Date();
    nineteenYearsAgo.setFullYear(nineteenYearsAgo.getFullYear() - 19);
    expect(validateAgeGate(nineteenYearsAgo).isAllowed).toBe(true);
  });
});

describe("3. Purpose-Based Authorization Policy (src/lib/auth/policy.ts)", () => {
  const studentActor: SessionActor = {
    id: "usr_student_01",
    email: "student@campus.edu",
    role: Role.STUDENT,
    institution_id: "inst_01",
    student_pseudo_id: "pseudo_student_01",
  };

  const counselorActor: SessionActor = {
    id: "usr_counselor_01",
    email: "counselor@campus.edu",
    role: Role.COUNSELOR,
    institution_id: "inst_01",
  };

  const adminActor: SessionActor = {
    id: "usr_admin_01",
    email: "admin@campus.edu",
    role: Role.ADMIN,
    institution_id: "inst_01",
  };

  it("allows public access to support resources for all authenticated actors", () => {
    expect(can(studentActor, "READ", "SUPPORT_RESOURCE").granted).toBe(true);
    expect(can(counselorActor, "READ", "SUPPORT_RESOURCE").granted).toBe(true);
    expect(can(adminActor, "READ", "SUPPORT_RESOURCE").granted).toBe(true);
  });

  describe("Student Role Invariants", () => {
    it("allows student to read and export own telemetry under SELF_VIEW", () => {
      const res = can(studentActor, "READ", "SURVEY_RESPONSE", "SELF_VIEW", {
        targetStudentPseudoId: "pseudo_student_01",
      });
      expect(res.granted).toBe(true);
    });

    it("strictly blocks student from viewing another student's data", () => {
      const res = can(studentActor, "READ", "SURVEY_RESPONSE", "SELF_VIEW", {
        targetStudentPseudoId: "pseudo_student_OTHER",
      });
      expect(res.granted).toBe(false);
      expect(res.reason).toContain("Students may only access their own records");
    });

    it("blocks student from administrative resources or unmasking", () => {
      expect(can(studentActor, "READ", "AUDIT_LOG", "SELF_VIEW").granted).toBe(false);
      expect(can(studentActor, "READ", "AGGREGATE_METRICS", "SELF_VIEW").granted).toBe(false);
      expect(can(studentActor, "UNMASK", "STUDENT_PROFILE", "SELF_VIEW").granted).toBe(false);
    });
  });

  describe("Counselor Role & Unmasking Invariants", () => {
    it("NEVER allows counselor to read student personal journals", () => {
      const res = can(counselorActor, "READ", "JOURNAL_ENTRY", "DIRECT_CARE_REVIEW");
      expect(res.granted).toBe(false);
      expect(res.reason).toContain("student-private envelope-encrypted");
    });

    it("forbids unmasking for Tier 0 (Thriving) and Tier 1 (Watch) students", () => {
      const resTier0 = can(counselorActor, "UNMASK", "STUDENT_PROFILE", "DIRECT_CARE_REVIEW", {
        currentTier: RiskTier.TIER_0,
        counselorConsentActive: true,
      });
      expect(resTier0.granted).toBe(false);
      expect(resTier0.reason).toContain("Unmasking Tier 0 or Tier 1 students is strictly prohibited");

      const resTier1 = can(counselorActor, "UNMASK", "STUDENT_PROFILE", "DIRECT_CARE_REVIEW", {
        currentTier: RiskTier.TIER_1,
        counselorConsentActive: true,
      });
      expect(resTier1.granted).toBe(false);
    });

    it("forbids unmasking if student has revoked triage consent", () => {
      const res = can(counselorActor, "UNMASK", "STUDENT_PROFILE", "DIRECT_CARE_REVIEW", {
        currentTier: RiskTier.TIER_2,
        counselorConsentActive: false,
        emergencyOverrideActive: false,
      });
      expect(res.granted).toBe(false);
      expect(res.reason).toContain("Student has revoked counselor triage consent");
    });

    it("allows unmasking for Tier 2 and Tier 3 when consent is active and purpose is DIRECT_CARE_REVIEW", () => {
      const resTier2 = can(counselorActor, "UNMASK", "STUDENT_PROFILE", "DIRECT_CARE_REVIEW", {
        currentTier: RiskTier.TIER_2,
        counselorConsentActive: true,
      });
      expect(resTier2.granted).toBe(true);

      const resTier3 = can(counselorActor, "UNMASK", "STUDENT_PROFILE", "DIRECT_CARE_REVIEW", {
        currentTier: RiskTier.TIER_3,
        counselorConsentActive: true,
      });
      expect(resTier3.granted).toBe(true);
    });
  });

  describe("Admin Role & k-Anonymity Invariants", () => {
    it("NEVER allows admin to unmask student identities or read individual telemetry", () => {
      expect(can(adminActor, "UNMASK", "STUDENT_PROFILE", "ANALYTICS_AGGREGATE").granted).toBe(false);
      expect(can(adminActor, "READ", "SURVEY_RESPONSE", "ANALYTICS_AGGREGATE").granted).toBe(false);
      expect(can(adminActor, "READ", "JOURNAL_ENTRY", "ANALYTICS_AGGREGATE").granted).toBe(false);
    });

    it("enforces k-anonymity (k >= 10): suppresses cohorts smaller than 10", () => {
      const underK = can(adminActor, "READ", "AGGREGATE_METRICS", "ANALYTICS_AGGREGATE", {
        cohortSize: 9,
      });
      expect(underK.granted).toBe(false);
      expect(underK.reason).toContain(`below k-anonymity minimum (${K_ANONYMITY_MIN_COHORT_SIZE})`);

      const validK = can(adminActor, "READ", "AGGREGATE_METRICS", "ANALYTICS_AGGREGATE", {
        cohortSize: 12,
      });
      expect(validK.granted).toBe(true);
    });

    it("allows admin to inspect immutable audit trail under AUDIT_INSPECTION", () => {
      const res = can(adminActor, "READ", "AUDIT_LOG", "AUDIT_INSPECTION");
      expect(res.granted).toBe(true);
    });
  });
});

describe("4. Data Access Layer (src/lib/dal/index.ts)", () => {
  const counselorActor: SessionActor = {
    id: "usr_counselor_01",
    email: "counselor@campus.edu",
    role: Role.COUNSELOR,
    institution_id: "inst_01",
  };

  const adminActor: SessionActor = {
    id: "usr_admin_01",
    email: "admin@campus.edu",
    role: Role.ADMIN,
    institution_id: "inst_01",
  };

  it("DAL unmasking enforces clinical reason and policy checks", async () => {
    const mockPrisma = {
      riskEvaluation: {
        findFirst: vi.fn().mockResolvedValue({ tier: RiskTier.TIER_0, confidence_score: 0.9 }),
      },
      pseudonymMap: {
        findUnique: vi.fn().mockResolvedValue({
          user: {
            full_name: "Test Student",
            email: "student@campus.edu",
            department: "CSE",
            cohort_year: "2026",
            consent_state: { consent_counselor_triage: true },
          },
        }),
      },
      auditLogEntry: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "audit_123" }),
      },
    } as any;

    const dal = new DataAccessLayer(mockPrisma);

    // Reason too short
    await expect(dal.unmaskStudentIdentity(counselorActor, "pseudo_01", "short")).rejects.toThrow(
      "A clinical justification of at least 10 characters is required"
    );

    // Tier 0 is blocked
    await expect(
      dal.unmaskStudentIdentity(counselorActor, "pseudo_01", "Student needs general check-in check")
    ).rejects.toThrow("Unauthorized unmasking attempt");
  });

  it("DAL cohort metrics suppresses output when cohort size is below k=10", async () => {
    const mockPrisma = {
      studentProfile: {
        count: vi.fn().mockResolvedValue(7), // 7 < 10
      },
    } as any;

    const dal = new DataAccessLayer(mockPrisma);
    const res = await dal.getCohortMetrics(adminActor, "Biotech", "2026");

    expect(res.suppressed).toBe(true);
    expect(res.total_students).toBe(7);
    expect(res.suppression_reason).toContain("k-anonymity minimum");
    expect(res.tier_distribution).toBeUndefined();
  });

  it("DAL cohort metrics aggregates successfully when cohort size is >= 10", async () => {
    const mockPrisma = {
      studentProfile: {
        count: vi.fn().mockResolvedValue(15),
        findMany: vi.fn().mockResolvedValue(
          Array.from({ length: 15 }, (_, i) => ({
            risk_evaluations: [{ tier: i < 10 ? RiskTier.TIER_0 : RiskTier.TIER_1 }],
            academic_signals: [{ attendance_percentage: 90.0 }],
          }))
        ),
      },
    } as any;

    const dal = new DataAccessLayer(mockPrisma);
    const res = await dal.getCohortMetrics(adminActor, "CSE", "2026");

    expect(res.suppressed).toBe(false);
    expect(res.total_students).toBe(15);
    expect(res.tier_distribution?.[RiskTier.TIER_0]).toBe(10);
    expect(res.tier_distribution?.[RiskTier.TIER_1]).toBe(5);
    expect(res.average_attendance_percentage).toBe(90.0);
  });
});
