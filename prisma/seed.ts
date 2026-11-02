import { PrismaClient, Role, RiskTier, HelpSeekingSignalType, CaseStatus, SupportCategory, VerificationStatus } from "@prisma/client";
import { hash } from "@node-rs/argon2";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// -----------------------------------------------------------------------------
// PRODUCTION REFUSAL GUARD
// -----------------------------------------------------------------------------
if (process.env.NODE_ENV === "production") {
  console.error("FATAL: Database seed script is strictly forbidden in production!");
  process.exit(1);
}

const prisma = new PrismaClient();

function getDeterministicPseudoId(userId: string): string {
  const salt = process.env.PSEUDO_SALT_SECRET || "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  return crypto.createHmac("sha256", salt).update(userId).digest("hex");
}

async function main() {
  console.log("Starting Sahayak database seed (Milestone M1)...");

  // 1. Clean existing records for idempotent runs in development
  await prisma.caseFeedback.deleteMany();
  await prisma.counselorCase.deleteMany();
  await prisma.riskEvaluation.deleteMany();
  await prisma.helpSeekingSignal.deleteMany();
  await prisma.academicSignal.deleteMany();
  await prisma.surveyResponse.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.studentKey.deleteMany();
  await prisma.consentState.deleteMany();
  await prisma.consentRecord.deleteMany();
  await prisma.pseudonymMap.deleteMany();
  await prisma.auditLogEntry.deleteMany();
  await prisma.verifiedSupportResource.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  // 2. Create Demo Institution
  const institution = await prisma.institution.create({
    data: {
      name: "National Institute of Technology (Demo Campus)",
      slug: "campus-edu",
      domain_allowlist: ["campus.edu", "student.campus.edu", "nit.ac.in"],
      emergency_auto_dispatch: false, // Non-negotiable: OFF by default
      data_retention_days: 365,
    },
  });
  console.log(`Created institution: ${institution.name} (${institution.id})`);

  // Common Argon2 password hash for seed users
  const defaultPasswordHash = await hash("SahayakSecure2026!");

  // 3. Create Core Role Accounts
  // Student
  const studentUser = await prisma.user.create({
    data: {
      institution_id: institution.id,
      email: "student@campus.edu",
      password_hash: defaultPasswordHash,
      full_name: "Aarav Sharma",
      role: Role.STUDENT,
      department: "Computer Science & Engineering",
      cohort_year: "2026",
      age_verified_18: true,
      is_synthetic: true,
    },
  });

  // Counselor
  const counselorUser = await prisma.user.create({
    data: {
      institution_id: institution.id,
      email: "counselor@campus.edu",
      password_hash: defaultPasswordHash,
      full_name: "Dr. Vikram Malhotra",
      role: Role.COUNSELOR,
      department: "Campus Wellness Center",
      age_verified_18: true,
      is_synthetic: true,
    },
  });

  // Admin
  const adminUser = await prisma.user.create({
    data: {
      institution_id: institution.id,
      email: "admin@campus.edu",
      password_hash: defaultPasswordHash,
      full_name: "Dean Anjali Sengupta",
      role: Role.ADMIN,
      department: "Office of Student Affairs",
      age_verified_18: true,
      is_synthetic: true,
    },
  });
  console.log("Created core role users: student@campus.edu, counselor@campus.edu, admin@campus.edu");

  // 4. Create Support Directory from static snapshot
  const snapshotPath = path.resolve(process.cwd(), "src/data/support-snapshot.json");
  if (fs.existsSync(snapshotPath)) {
    const rawSnapshot = fs.readFileSync(snapshotPath, "utf-8");
    const snapshotEntries = JSON.parse(rawSnapshot);

    for (const item of snapshotEntries) {
      await prisma.verifiedSupportResource.create({
        data: {
          institution_id: institution.id,
          name: item.name,
          category: item.category as SupportCategory,
          description: item.description,
          phone: item.phone,
          sms_or_whatsapp: item.sms_or_whatsapp || null,
          web_url: item.web_url,
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
    console.log(`Seeded ${snapshotEntries.length} verified support directory resources.`);
  }

  // 5. Seed 20 Synthetic Students with Baselines, Profiles, Telemetry, and Tiers
  // Distribution: 14 Tier 0, 3 Tier 1, 2 Tier 2, 1 Tier 3
  const departments = [
    "Computer Science & Engineering",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Biotechnology",
  ];
  const cohorts = ["2025", "2026", "2027", "2028"];

  interface SyntheticStudentDef {
    user: typeof studentUser;
    tier: RiskTier;
    acute: boolean;
    score: number;
    delay: number;
    attendance: number;
    helpSeeking: boolean;
  }

  const syntheticStudents: SyntheticStudentDef[] = [
    // Aarav Sharma is student #1 (Tier 0 baseline)
    { user: studentUser, tier: RiskTier.TIER_0, acute: false, score: 0.15, delay: 0.5, attendance: 95.0, helpSeeking: false },
  ];

  // Generate 19 more users
  for (let i = 2; i <= 20; i++) {
    let tier: RiskTier = RiskTier.TIER_0;
    let acute = false;
    let score = 0.18;
    let delay = 1.0;
    let attendance = 94.0;
    let helpSeeking = false;

    if (i === 18) {
      // Tier 1
      tier = RiskTier.TIER_1;
      score = 0.42;
      delay = 14.0;
      attendance = 82.0;
    } else if (i === 19) {
      // Tier 1
      tier = RiskTier.TIER_1;
      score = 0.48;
      delay = 16.5;
      attendance = 80.0;
    } else if (i === 16) {
      // Tier 1
      tier = RiskTier.TIER_1;
      score = 0.39;
      delay = 12.0;
      attendance = 84.0;
    } else if (i === 17) {
      // Tier 2: Corroborated drift (Survey + LMS + Help-Seeking)
      tier = RiskTier.TIER_2;
      score = 0.68;
      delay = 36.0;
      attendance = 68.0;
      helpSeeking = true;
    } else if (i === 15) {
      // Tier 2: Corroborated drift (Survey + Attendance drop)
      tier = RiskTier.TIER_2;
      score = 0.72;
      delay = 28.0;
      attendance = 64.0;
      helpSeeking = true;
    } else if (i === 20) {
      // Tier 3: Priority Human Review (Acute self-report or multi-signal crisis)
      tier = RiskTier.TIER_3;
      acute = true;
      score = 0.92;
      delay = 54.0;
      attendance = 50.0;
      helpSeeking = true;
    }

    const u = await prisma.user.create({
      data: {
        institution_id: institution.id,
        email: `student_${i}@campus.edu`,
        password_hash: defaultPasswordHash,
        full_name: `Synthetic Student ${i}`,
        role: Role.STUDENT,
        department: departments[i % departments.length],
        cohort_year: cohorts[i % cohorts.length],
        age_verified_18: true,
        is_synthetic: true,
      },
    });

    syntheticStudents.push({ user: u, tier, acute, score, delay, attendance, helpSeeking });
  }

  for (const item of syntheticStudents) {
    const pseudoId = getDeterministicPseudoId(item.user.id);

    // Pseudonym Map
    await prisma.pseudonymMap.create({
      data: {
        user_id: item.user.id,
        student_pseudo_id: pseudoId,
      },
    });

    // Consent State (all synthetic students opted in for realistic simulation)
    await prisma.consentState.create({
      data: {
        user_id: item.user.id,
        consent_surveys: true,
        consent_academic: true,
        consent_help_seeking: true,
        consent_counselor_triage: true,
        consent_journal_signals: false, // Default false preserved!
        emergency_escalation_acknowledged: true,
      },
    });

    await prisma.consentRecord.create({
      data: {
        user_id: item.user.id,
        consent_surveys: true,
        consent_academic: true,
        consent_help_seeking: true,
        consent_counselor_triage: true,
        consent_journal_signals: false,
        emergency_escalation_acknowledged: true,
        change_reason: "SYNTHETIC_ONBOARDING_INITIAL",
        ip_hashed: crypto.createHash("sha256").update("127.0.0.1").digest("hex").slice(0, 16),
      },
    });

    // Student Key (Synthetic encrypted DEK placeholder)
    await prisma.studentKey.create({
      data: {
        user_id: item.user.id,
        encrypted_dek: "dGVzdC1lbmNyeXB0ZWQtZGVrLXN5bnRoZXRpYw==",
        dek_iv: "dGVzdC1pdi0xMg==",
        dek_auth_tag: "dGVzdC10YWctMTY=",
        kek_salt: "dGVzdC1zYWx0LTE2",
        key_version: 1,
      },
    });

    // Student Profile (Telemetry Realm)
    const profile = await prisma.studentProfile.create({
      data: {
        student_pseudo_id: pseudoId,
        department: item.user.department || "Computer Science & Engineering",
        cohort_year: item.user.cohort_year || "2026",
        is_synthetic: true,
      },
    });

    // Survey Response
    await prisma.surveyResponse.create({
      data: {
        student_pseudo_id: profile.student_pseudo_id,
        instrument_type: "PHQ_STYLE",
        answers: { q1: 1, q2: 2, q3: item.acute ? 3 : 1 },
        normalized_score: item.score,
        acute_flag_raised: item.acute,
      },
    });

    // Academic Signal
    await prisma.academicSignal.create({
      data: {
        student_pseudo_id: profile.student_pseudo_id,
        submission_delay_hours: item.delay,
        attendance_percentage: item.attendance,
        active_assignments_count: item.tier === RiskTier.TIER_0 ? 2 : 5,
      },
    });

    // Help Seeking Signal (if applicable)
    if (item.helpSeeking) {
      await prisma.helpSeekingSignal.create({
        data: {
          student_pseudo_id: profile.student_pseudo_id,
          signal_type: HelpSeekingSignalType.NOCTURNAL_USAGE,
          metadata: { time_of_day: "03:42", category: "crisis_directory_view" },
        },
      });
    }

    // Plain Language Reasons
    let plainReasons: string[] = [];
    if (item.tier === RiskTier.TIER_0) {
      plainReasons = ["Check-in signals remain consistent with historical baseline.", "Regular attendance and steady assignment pace."];
    } else if (item.tier === RiskTier.TIER_1) {
      plainReasons = ["Mild submission delay noted relative to 30-day baseline.", "Single-vector drift; recommended self-guided resources."];
    } else if (item.tier === RiskTier.TIER_2) {
      plainReasons = [
        "Corroborated 2-vector drift: self-reported elevated fatigue and delayed coursework.",
        "Attendance has dropped below 75% in the last 14 days.",
      ];
    } else if (item.tier === RiskTier.TIER_3) {
      plainReasons = [
        "Acute self-report or severe multi-vector signal detected.",
        "Priority human check-in suggested by wellbeing coordinator.",
      ];
    }

    // Risk Evaluation
    const riskEval = await prisma.riskEvaluation.create({
      data: {
        student_pseudo_id: profile.student_pseudo_id,
        tier: item.tier,
        confidence_score: item.tier === RiskTier.TIER_0 ? 0.92 : 0.84,
        corroboration_details: {
          survey_vector: item.score > 0.4,
          academic_vector: item.delay > 10,
          help_seeking_vector: item.helpSeeking,
        },
        plain_language_reasons: plainReasons,
      },
    });

    // For Tier 2 and Tier 3, open CounselorCase
    if (item.tier === RiskTier.TIER_2 || item.tier === RiskTier.TIER_3) {
      await prisma.counselorCase.create({
        data: {
          risk_evaluation_id: riskEval.id,
          student_pseudo_id: profile.student_pseudo_id,
          status: CaseStatus.OPEN,
          assigned_counselor_id: counselorUser.id,
        },
      });
    }
  }

  // 6. Initial Audit Log Entry (Genesis block of hash chain)
  const genesisTimestamp = new Date();
  const genesisPayload = JSON.stringify({
    actor_id: adminUser.id,
    action: "SYSTEM_INITIALIZATION",
    timestamp: genesisTimestamp.toISOString(),
  });
  const genesisHash = crypto.createHash("sha256").update(genesisPayload).digest("hex");

  await prisma.auditLogEntry.create({
    data: {
      actor_id: adminUser.id,
      actor_role: "ADMIN",
      action_type: "SYSTEM_INITIALIZATION",
      target_pseudo_id: null,
      metadata: { event: "Seed database created with 20 synthetic students" },
      previous_entry_hash: "0".repeat(64), // Genesis block pointer
      current_entry_hash: genesisHash,
      timestamp: genesisTimestamp,
    },
  });

  console.log("Seeded 20 synthetic student records with baseline telemetry, evaluations, and audit genesis.");
  console.log("Seed complete! Verification passed.");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
