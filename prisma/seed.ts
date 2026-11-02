import {
  PrismaClient,
  Prisma,
  Role,
  RiskTier,
  HelpSeekingSignalType,
  CaseStatus,
  SupportCategory,
  VerificationStatus,
  UserStatus,
  ConsentToggleName,
  ConsentAction,
} from "@prisma/client";
import { hash } from "@node-rs/argon2";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { computeEmailLookupHash, encryptEmail } from "../src/lib/crypto/email";
import { computeCanonicalAuditHash, deriveActorPseudoId } from "../src/lib/audit";

// -----------------------------------------------------------------------------
// PRODUCTION REFUSAL GUARD
// -----------------------------------------------------------------------------
if (process.env.NODE_ENV === "production") {
  console.error("FATAL: Database seed script is strictly forbidden in production!");
  process.exit(1);
}

const prisma = new PrismaClient();

const EMAIL_LOOKUP_PEPPER =
  process.env.EMAIL_LOOKUP_PEPPER || "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const APP_MASTER_KEY =
  process.env.APP_MASTER_ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const PSEUDO_SALT =
  process.env.PSEUDO_SALT_SECRET || "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

function getStudentPseudoId(userId: string): string {
  return "ps_" + crypto.createHmac("sha256", PSEUDO_SALT).update(userId).digest("hex").slice(0, 16);
}

async function main() {
  console.log("Starting Sahayak seed with multiSchema, encrypted emails, and synthetic cohorts...");

  // 1. Clean existing records in reverse dependency order
  await prisma.caseFeedback.deleteMany();
  await prisma.counselorCase.deleteMany();
  await prisma.riskEvaluation.deleteMany();
  await prisma.helpSeekingSignal.deleteMany();
  await prisma.academicSignal.deleteMany();
  await prisma.surveyResponse.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.revocationDeletionJob.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.studentKey.deleteMany();
  await prisma.consentState.deleteMany();
  await prisma.consentRecord.deleteMany();
  await prisma.auditLogEntry.deleteMany();
  await prisma.verifiedSupportResource.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  // 2. Seed Demo Institution
  const institution = await prisma.institution.create({
    data: {
      name: "National Institute of Technology, Delhi (Demo)",
      slug: "nit-delhi",
      domain_allowlist: ["campus.edu", "student.campus.edu", "nitd.ac.in"],
      emergency_auto_dispatch: false, // Strictly OFF by default
      data_retention_days: 365,
    },
  });

  const defaultPasswordHash = await hash("SahayakSecure2026!");

  // 3. Seed 1 Admin & 2 Counselors
  const adminEmail = "admin@campus.edu";
  const adminUser = await prisma.user.create({
    data: {
      institution_id: institution.id,
      email_encrypted: JSON.stringify(encryptEmail(adminEmail, APP_MASTER_KEY)),
      email_lookup_hash: computeEmailLookupHash(adminEmail, EMAIL_LOOKUP_PEPPER),
      password_hash: defaultPasswordHash,
      full_name: "Dean Anjali Sengupta",
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      adult_confirmed: true,
      department: "Office of Student Affairs",
      is_synthetic: true,
    },
  });

  const counselor1Email = "counselor@campus.edu";
  const counselor1 = await prisma.user.create({
    data: {
      institution_id: institution.id,
      email_encrypted: JSON.stringify(encryptEmail(counselor1Email, APP_MASTER_KEY)),
      email_lookup_hash: computeEmailLookupHash(counselor1Email, EMAIL_LOOKUP_PEPPER),
      password_hash: defaultPasswordHash,
      full_name: "Dr. Vikram Malhotra",
      role: Role.COUNSELOR,
      status: UserStatus.ACTIVE,
      adult_confirmed: true,
      department: "Campus Wellness Center",
      is_synthetic: true,
    },
  });

  const counselor2Email = "lead_counselor@campus.edu";
  await prisma.user.create({
    data: {
      institution_id: institution.id,
      email_encrypted: JSON.stringify(encryptEmail(counselor2Email, APP_MASTER_KEY)),
      email_lookup_hash: computeEmailLookupHash(counselor2Email, EMAIL_LOOKUP_PEPPER),
      password_hash: defaultPasswordHash,
      full_name: "Dr. Sunita Rao",
      role: Role.COUNSELOR,
      status: UserStatus.ACTIVE,
      adult_confirmed: true,
      department: "Mental Health Directorate",
      is_synthetic: true,
    },
  });

  // 4. Seed Support Resources
  const snapshotPath = path.resolve(process.cwd(), "src/data/support-snapshot.json");
  if (fs.existsSync(snapshotPath)) {
    const raw = fs.readFileSync(snapshotPath, "utf-8");
    const snapshot = JSON.parse(raw);
    for (const item of snapshot) {
      await prisma.verifiedSupportResource.create({
        data: {
          institution_id: institution.id,
          name: item.name,
          category: item.category as SupportCategory,
          description: item.description,
          phone: item.phone,
          sms_or_whatsapp: item.sms_or_whatsapp || null,
          web_url: item.web_url,
          source_url: item.source_url || item.web_url,
          operating_hours: item.operating_hours,
          languages_supported: item.languages_supported,
          region_code: item.region_code,
          is_free_toll_free: item.is_free_toll_free,
          is_crisis_priority: item.is_crisis_priority,
          verification_status: VerificationStatus.VERIFIED,
          verified_by: item.verified_by,
          verified_on: new Date(item.verified_on),
          next_verification_due: new Date(item.next_verification_due),
          verification_notes: item.verification_notes,
        },
      });
    }
  }

  // 5. Seed 20 Synthetic Students Across All 4 Consent Profiles
  // Profiles:
  // - Students 1-5: All Granted
  // - Students 6-10: Partially Granted
  // - Students 11-15: All Revoked
  // - Students 16-20: Never Consented
  const departments = ["Computer Science", "Electronics", "Mechanical", "Civil", "Biotechnology"];

  for (let i = 1; i <= 20; i++) {
    const studentEmail = `student_${i}@campus.edu`;
    const user = await prisma.user.create({
      data: {
        institution_id: institution.id,
        email_encrypted: JSON.stringify(encryptEmail(studentEmail, APP_MASTER_KEY)),
        email_lookup_hash: computeEmailLookupHash(studentEmail, EMAIL_LOOKUP_PEPPER),
        password_hash: defaultPasswordHash,
        full_name: `Synthetic Student ${i}`,
        role: Role.STUDENT,
        status: UserStatus.ACTIVE,
        adult_confirmed: true,
        department: departments[(i - 1) % departments.length],
        cohort_year: "2026",
        is_synthetic: true,
      },
    });

    const pseudoId = getStudentPseudoId(user.id);

    // Profile in telemetry schema
    await prisma.studentProfile.create({
      data: {
        student_pseudo_id: pseudoId,
        user_id: user.id,
        department: departments[(i - 1) % departments.length],
        cohort_year: "2026",
        locale: i % 3 === 0 ? "hi" : i % 5 === 0 ? "bn" : "en",
        key_version: 1,
        is_synthetic: true,
      },
    });

    // Student Key
    await prisma.studentKey.create({
      data: {
        user_id: user.id,
        encrypted_dek: "dGVzdC1lbmNyeXB0ZWQtZGVrLXN5bnRoZXRpYw==",
        dek_iv: "dGVzdC1pdi0xMg==",
        dek_auth_tag: "dGVzdC10YWctMTY=",
        kek_salt: "dGVzdC1zYWx0LTE2",
        key_version: 1,
      },
    });

    // Configure Consent State & Records per cohort type
    if (i <= 5) {
      // 1-5: All Granted
      await prisma.consentState.create({
        data: {
          student_pseudo_id: pseudoId,
          consent_surveys: true,
          consent_academic: true,
          consent_help_seeking: true,
          consent_counselor_triage: true,
          consent_journal_signals: false, // Default FALSE preserved
          emergency_escalation_acknowledged: true,
        },
      });

      const toggles: ConsentToggleName[] = [
        ConsentToggleName.consent_surveys,
        ConsentToggleName.consent_academic,
        ConsentToggleName.consent_help_seeking,
        ConsentToggleName.consent_counselor_triage,
        ConsentToggleName.emergency_escalation_acknowledged,
      ];
      for (const t of toggles) {
        await prisma.consentRecord.create({
          data: {
            student_pseudo_id: pseudoId,
            user_id: user.id,
            toggle: t,
            action: ConsentAction.GRANTED,
            consent_text_version: "1.0.0",
            locale: "en",
          },
        });
      }

      // Add baseline signals for active students
      await prisma.surveyResponse.create({
        data: {
          student_pseudo_id: pseudoId,
          instrument_type: "PHQ_STYLE",
          answers: { q1: 1, q2: 1, q3: 1 },
          normalized_score: 0.15,
          acute_flag_raised: false,
        },
      });

      await prisma.academicSignal.create({
        data: {
          student_pseudo_id: pseudoId,
          submission_delay_hours: 0.5,
          attendance_percentage: 95.0,
          active_assignments_count: 2,
        },
      });

      let studentTier: RiskTier = RiskTier.TIER_0;
      let studentReasons = ["Steady assignment pace and stable attendance consistent with baseline."];
      let studentDetails: Prisma.InputJsonValue = { stable: true };
      let studentConf = 0.94;

      if (i === 1) {
        studentTier = RiskTier.TIER_3;
        studentConf = 0.88;
        studentReasons = [
          "Survey vector: Self-reported exhaustion score elevated (+3.1sigma vs personal 30-day baseline).",
          "Academic drift: 3 consecutive assignments submitted past deadline; attendance dropped 22% in last 10 days.",
          "Help-seeking patterns: 2 abandoned counselor appointment booking attempts and repeated midnight resource views.",
        ];
        studentDetails = {
          survey_z_score: 3.1,
          academic_drift_pct: -22,
          abandoned_bookings: 2,
        };
      } else if (i === 2) {
        studentTier = RiskTier.TIER_2;
        studentConf = 0.76;
        studentReasons = [
          "Survey vector: Self-reported fatigue score elevated (+2.2sigma vs personal baseline).",
          "Help-seeking patterns: Abandoned counselor booking attempts.",
        ];
        studentDetails = {
          survey_z_score: 2.2,
          abandoned_bookings: 1,
        };
      }

      const riskEval = await prisma.riskEvaluation.create({
        data: {
          student_pseudo_id: pseudoId,
          tier: studentTier,
          confidence_score: studentConf,
          corroboration_details: studentDetails,
          plain_language_reasons: studentReasons,
        },
      });

      if (i === 1 || i === 2) {
        // Create an open case for student 1 and 2 for counselor workflow testing
        await prisma.counselorCase.create({
          data: {
            risk_evaluation_id: riskEval.id,
            student_pseudo_id: pseudoId,
            status: CaseStatus.OPEN,
            assigned_counselor_id: counselor1.id,
          },
        });
      }
    } else if (i <= 10) {
      // 6-10: Partially Granted (Surveys only)
      await prisma.consentState.create({
        data: {
          student_pseudo_id: pseudoId,
          consent_surveys: true,
          consent_academic: false,
          consent_help_seeking: false,
          consent_counselor_triage: false,
          consent_journal_signals: false,
          emergency_escalation_acknowledged: true,
        },
      });

      await prisma.consentRecord.create({
        data: {
          student_pseudo_id: pseudoId,
          user_id: user.id,
          toggle: ConsentToggleName.consent_surveys,
          action: ConsentAction.GRANTED,
          consent_text_version: "1.0.0",
          locale: "en",
        },
      });

      if (i === 6) {
        // Seed an unconsented Tier 2 case to verify that unmasking is rejected by ethical policy
        const unconsentedEval = await prisma.riskEvaluation.create({
          data: {
            student_pseudo_id: pseudoId,
            tier: RiskTier.TIER_2,
            confidence_score: 0.72,
            corroboration_details: { survey_z_score: 2.4 },
            plain_language_reasons: [
              "Survey vector: Elevated stress scores across consecutive weekly check-ins.",
            ],
          },
        });

        await prisma.counselorCase.create({
          data: {
            risk_evaluation_id: unconsentedEval.id,
            student_pseudo_id: pseudoId,
            status: CaseStatus.OPEN,
            assigned_counselor_id: counselor1.id,
          },
        });
      }
    } else if (i <= 15) {
      // 11-15: All Revoked (Recorded GRANTED then REVOKED)
      await prisma.consentState.create({
        data: {
          student_pseudo_id: pseudoId,
          consent_surveys: false,
          consent_academic: false,
          consent_help_seeking: false,
          consent_counselor_triage: false,
          consent_journal_signals: false,
          emergency_escalation_acknowledged: true,
        },
      });

      await prisma.consentRecord.create({
        data: {
          student_pseudo_id: pseudoId,
          user_id: user.id,
          toggle: ConsentToggleName.consent_surveys,
          action: ConsentAction.GRANTED,
          consent_text_version: "1.0.0",
          locale: "en",
        },
      });

      await prisma.consentRecord.create({
        data: {
          student_pseudo_id: pseudoId,
          user_id: user.id,
          toggle: ConsentToggleName.consent_surveys,
          action: ConsentAction.REVOKED,
          consent_text_version: "1.0.0",
          locale: "en",
        },
      });
    } else {
      // 16-20: Never Consented
      await prisma.consentState.create({
        data: {
          student_pseudo_id: pseudoId,
          consent_surveys: false,
          consent_academic: false,
          consent_help_seeking: false,
          consent_counselor_triage: false,
          consent_journal_signals: false,
          emergency_escalation_acknowledged: false,
        },
      });
    }
  }

  // 6. Genesis Block for Audit Log
  const genesisTimestamp = new Date();
  const adminPseudo = deriveActorPseudoId(adminUser.id, PSEUDO_SALT);
  const genesisDetails = {
    event_category: "SYSTEM" as const,
    item_count: 20,
    reason_code: "SYSTEM_MAINTENANCE" as const,
  };

  const genesisHash = computeCanonicalAuditHash(
    "0".repeat(64),
    1n,
    genesisTimestamp,
    adminPseudo,
    Role.ADMIN,
    "SYSTEM_INITIALIZATION",
    "DATABASE",
    null,
    genesisDetails
  );

  await prisma.auditLogEntry.create({
    data: {
      sequence_number: 1n,
      timestamp: genesisTimestamp,
      actor_pseudo_id: adminPseudo,
      actor_role: Role.ADMIN,
      action_type: "SYSTEM_INITIALIZATION",
      resource_type: "DATABASE",
      target_pseudo_id: null,
      details: genesisDetails,
      previous_entry_hash: "0".repeat(64),
      current_hash: genesisHash,
    },
  });

  console.log("Seeded institution, admin, 2 counselors, and 20 students across 4 consent profiles.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
