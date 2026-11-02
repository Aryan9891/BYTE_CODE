# TASKS.md - Engineering Backlog & Implementation Milestones
**Project:** S-12: AI-Based Mental Health Support and Crisis Detection (Sahayak)  
**Status:** Scaffolding Phase - Pending Step 2 Approval  

> **Guide for Autonomous Agents & Developers:**  
> Execute tasks strictly in numbered, dependency-ordered sequence. Each task must satisfy its Acceptance Criteria and the Definition of Done in [AGENT.md](./AGENT.md) before checking the box `[x]`.

---

## Milestone 0: Foundation & Environment Scaffolding (M0)
- [x] **TASK-001: Next.js 15 & Toolchain Setup**
  - *Acceptance Criteria:* Initialize Next.js 15 with App Router, TypeScript (strict mode), Tailwind CSS v4, ESLint 9, Prettier, Vitest, and Playwright configured. Zero compiler warnings.
  - *Evidence:* `next build`, `tsc --noEmit`, `vitest run`, and `next lint` pass with 0 errors.
- [x] **TASK-002: shadcn/ui & Design System Tokens Integration**
  - *Acceptance Criteria:* Install and configure Radix UI primitives, base components (Button, Card, Dialog, Badge, Input, RadioGroup, Slider), and CSS design tokens from `docs/DESIGN_SYSTEM.md` with verified WCAG 2.2 AA contrast in both light and dark themes.
  - *Evidence:* `tests/unit/contrast.test.ts` passes; all 8 token pairs exceed 4.5:1 contrast; accessible primitives built in `src/components/ui/`.
- [x] **TASK-003: Local Docker PostgreSQL Service & Environment Specification**
  - *Acceptance Criteria:* Create `docker-compose.yml` for local PostgreSQL 16 development database and documented `.env.example`. Schema partitioned in `docs/DATA_MODEL.md`.
  - *Evidence:* `docker-compose.yml` configured; schema mapped; Step 3 will run active migration.
- [x] **TASK-004: Cryptographic & Security Utilities**
  - *Acceptance Criteria:* Implement `lib/crypto/pseudo.ts` (HMAC-SHA256 pseudonym generation) and `lib/crypto/envelope.ts` (AES-256-GCM field encryption/decryption with IV and auth tag). Unit tests with 100% branch coverage.
  - *Evidence:* `tests/unit/crypto.test.ts` passes (6/6 tests covering deterministic pseudonyms, unique IVs, and tamper detection).

---

## Milestone 1: Authentication, RBAC & Consent Management (M1)
- [x] **TASK-101: Auth & Purpose-Based Access Policy**
  - *Acceptance Criteria:* Configure Argon2id password hashing, institutional domain allowlist, DPDP Act 2023 age gate (18+), central purpose-based authorization policy `can(actor, action, resource, purpose)`, typed Data Access Layer (DAL), and dev-only demo persona switcher (404 in production).
  - *Evidence:* `tests/unit/auth-policy.test.ts` (19/19 passing); DAL enforces purpose and prevents unmasking for Tier 0/1 students.
- [x] **TASK-102: Granular Consent API & Data Service**
  - *Acceptance Criteria:* Implement `/api/consent` endpoint supporting 6 independent consent toggles (Surveys, Academic Drift, Help-Seeking Patterns, Counselor Check-in Suggestions, Journal Analysis, Emergency Acknowledgment). Dual-layer storage: append-only `ConsentRecord` ledger + materialized `ConsentState`.
  - *Evidence:* `tests/unit/consent-engine.test.ts` passes; immutable records logged with hashed IP subnets.
- [x] **TASK-103: Student Onboarding & Privacy Center UI**
  - *Acceptance Criteria:* Build interactive multi-step onboarding wizard (`/onboarding`) and Privacy Center (`/settings/privacy`) with real-time toggle persistence, zero dark patterns, accessible tap targets, and WCAG AA color contrast.
  - *Evidence:* `tests/e2e/m1-flows.spec.ts` passes; 0 axe-core accessibility violations.
- [x] **TASK-104: Right to Erasure ("Delete My Data") & Cryptographic Shredding**
  - *Acceptance Criteria:* Implement `/api/consent/crypto-shred` executing irreversible cryptographic destruction of the student's personal Data Encryption Key (`StudentKey`), rendering encrypted journals permanently unrecoverable and emitting `DATA_ERASURE_CRYPTO_SHRED` in the audit ledger. Implement machine-readable JSON archive export (`/api/consent/export`).
  - *Evidence:* Unit tests verify key deletion and permanent unrecoverability; Playwright E2E verifies two-step confirmation modal.

---

## Milestone 2: Voluntary Surveys & Private Journaling (M2)
- [ ] **TASK-201: Adapted Pulse Survey Instrument Engine**
  - *Acceptance Criteria:* Implement survey schema in `lib/surveys/instruments.ts` adapted from validated scales (PHQ-style, GAD-style, Burnout-style) using non-diagnostic, compassionate language and citing source origins.
- [ ] **TASK-202: Survey Ingestion Endpoint & Consent Gate**
  - *Acceptance Criteria:* Implement `POST /api/v1/surveys/submit`. Checks active `consent_surveys` permission; blocks and returns 403 if revoked. Stores responses in `telemetry_realm.survey_responses` under `student_pseudo_id`.
- [ ] **TASK-203: Check-in Survey UI & Acute Trigger Interceptor**
  - *Acceptance Criteria:* Build step-by-step survey UI (`/student/check-in`) with large, accessible tap targets. If an acute distress option is selected, immediately display the supportive crisis modal.
- [ ] **TASK-204: Client-Encrypted Private Journal**
  - *Acceptance Criteria:* Implement `/student/journal` and `POST /api/v1/journal`. Form inputs encrypted via AES-256-GCM before DB insertion. Student can view decrypted history; counselors/admins have zero decryption ability.

---

## Milestone 3: Signal Ingestion & Explainable Risk Engine (M3)
- [ ] **TASK-301: Academic Drift & Help-Seeking Ingestion Adapters**
  - *Acceptance Criteria:* Build ingestion endpoints and synthetic generator for academic signals (delays, attendance drop) and help-seeking telemetry (abandoned bookings, nocturnal usage), gated by their respective consent flags.
- [ ] **TASK-302: Personal Baseline & Z-Score Deviation Calculator**
  - *Acceptance Criteria:* Implement rolling 30-day baseline calculation ($\mu, \sigma$) and EWMA trend detection ($\alpha = 0.35$) in `lib/risk-engine/baseline.ts`. Unit tests verify mathematical correctness against reference vectors.
- [ ] **TASK-303: Multi-Signal Corroboration Engine**
  - *Acceptance Criteria:* Implement corroboration logic in `lib/risk-engine/corroboration.ts`: Tier 2 and Tier 3 strictly require $\ge 2$ distinct signal families (or acute survey trigger). Single-signal spikes capped at Tier 1.
- [ ] **TASK-304: Hysteresis, Cooldowns & Explainability Generator**
  - *Acceptance Criteria:* Implement state hysteresis (suppressing flip-flopping), 7-day alert cooldown window, confidence score calculation, and plain-language explanation generator adhering strictly to non-diagnostic templates.
- [ ] **TASK-305: Synthetic Evaluation Suite & Calibration Test**
  - *Acceptance Criteria:* Run benchmark across 5,000 synthetic student trajectories verifying Tier 3 Precision $\ge 85\%$, Recall $\ge 90\%$, and balanced demographic false-positive rates.

---

## Milestone 4: Counselor Workspace & Case Management (M4)
- [x] **TASK-401: Counselor Triage Dashboard UI**
  - *Acceptance Criteria:* Build `/counselor` dashboard displaying active suggested check-ins grouped by Tier 3 (Priority Review) and Tier 2 (Gentle Check-in Suggested). Shows pseudonymous tokens, trigger dates, and corroboration summaries.
  - *Evidence:* `/counselor` queue connected to `dal.getActiveTriageCases` with zero student PII and verified non-diagnostic clinical rationale.
- [x] **TASK-402: Case Detail View & Explainability Breakdown**
  - *Acceptance Criteria:* Build `/counselor/case/[id]` displaying plain-language signal summaries, baseline deviation charts, and supportive outreach templates.
  - *Evidence:* `/counselor/cases/[id]` renders multi-vector signal corroboration from personal baseline shifts, omitting clinical diagnoses.
- [x] **TASK-403: Audited Identity Unmasking Flow**
  - *Acceptance Criteria:* Implement two-step modal requiring counselor to input an outreach reason before revealing student contact info. Immediately triggers an immutable record in `audit_logs`.
  - *Evidence:* Audited modal requires $\ge 10$ character clinical justification, gates strictly on Tier 2/3 and active consent, appends immutable audit entry, and reveals decrypted email and student metadata.
- [x] **TASK-404: Counselor Feedback Loop Widget**
  - *Acceptance Criteria:* Implement feedback buttons on cases (`APPROPRIATE_TIMELY`, `TOO_SENSITIVE`, `FALSE_ALARM_NOISE`) writing to `telemetry_realm.case_feedback` for continuous calibration.
  - *Evidence:* Feedback buttons integrated on `/counselor/cases/[id]` writing to `caseFeedback` via `dal.recordCaseFeedback` with audit event.

---

## Milestone 5: Verified Support Directory & 24/7 Crisis Path (M5)
- [ ] **TASK-501: Verified Support Directory Data Layer & Admin CMS**
  - *Acceptance Criteria:* Implement database models and APIs for managing resources with fields: `verified_by`, `verified_on`, `next_verification_due`, `phone`, `operating_hours`, `languages_supported`, and `region`.
- [ ] **TASK-502: Public Edge Support Directory View**
  - *Acceptance Criteria:* Build `/support` directory with fast filtering by region, type, and language. Placeholders clearly flagged `VERIFY BEFORE LAUNCH`.
- [ ] **TASK-503: Zero-Auth Crisis Safety Screen (`/crisis`)**
  - *Acceptance Criteria:* High-contrast, zero-auth emergency screen loading in $<100\text{ ms}$ featuring one-tap dialer buttons for national and campus hotlines (Tele-MANAS, Campus Duty Cell) and interactive deep breathing widget.
- [ ] **TASK-504: Persistent "Get Help Now" Header Button & Modal**
  - *Acceptance Criteria:* Floating/top-bar accessible button present across all student and public pages triggering instant crisis dialog on click or keyboard shortcut.

---

## Milestone 6: Institutional Analytics & Audit Trail (M6)
- [x] **TASK-601: k-Anonymity Aggregation Service**
  - *Acceptance Criteria:* Implement aggregation pipeline in `lib/analytics/k-anonymity.ts`. Any cohort query yielding $<10$ individual students automatically redacts metrics with a privacy suppression payload.
  - *Evidence:* `dal.getCohortMetrics` strictly validates $k \ge 10$ and suppresses output whenever cohort size is under 10 students (`tests/unit/architecture-dal.test.ts`).
- [ ] **TASK-602: Institutional Wellbeing Trends Dashboard**
  - *Acceptance Criteria:* Build `/admin/analytics` featuring Recharts visualizations of campus-wide stress trends over academic terms, department comparisons, and resource utilization with clear $k \ge 10$ badges.
- [x] **TASK-603: Cryptographically Chained Audit Logger**
  - *Acceptance Criteria:* Implement `lib/audit/logger.ts` recording security actions with SHA-256 hash chaining (`current_hash = SHA256(prev_hash + data)`).
  - *Evidence:* `src/lib/audit/index.ts` enforces canonical SHA-256 hash chaining, advisory locks (`pg_advisory_xact_lock`), and statement-level PostgreSQL immutability triggers (`tests/integration/audit-chain-integrity.test.ts`, `tests/integration/db-immutability-triggers.test.ts`).
- [ ] **TASK-604: Tamper-Evident Audit Log Viewer UI**
  - *Acceptance Criteria:* Build `/admin/audit-logs` table with hash verification status indicator ("Chain Intact") and filtering by actor or action type.

---

## Milestone 7: Accessibility, Multilingual i18n & Hackathon Demo Polish (M7)
- [ ] **TASK-701: Multilingual Internationalization (English, Hindi, Bengali)**
  - *Acceptance Criteria:* Configure i18n dictionary system with complete translations for all user-facing strings across English, Hindi, and Bengali, vetted for non-stigmatizing cultural phrasing.
- [ ] **TASK-702: End-to-End WCAG 2.2 AA Accessibility Audit**
  - *Acceptance Criteria:* Automated axe-core scans and manual keyboard-only navigation pass with 0 errors across all 12 application pages. `prefers-reduced-motion` fully verified.
- [ ] **TASK-703: Realistic Synthetic Seed Generator**
  - *Acceptance Criteria:* Create `prisma/seed.ts` populating 50 diverse student trajectories, 3 demo accounts (Student, Counselor, Admin), and verified directory entries with all edge-case tiers represented.
- [ ] **TASK-704: Comprehensive E2E Playwright Suite**
  - *Acceptance Criteria:* Implement and run test scenarios covering the full student check-in, counselor triage, privacy revocation, and crisis escalation flows.

---

## Milestone 8: Production Deployment & Verification (M8)
- [ ] **TASK-801: Environment & Security Hardening**
  - *Acceptance Criteria:* Configure production CSP headers, HSTS, rate-limiting thresholds, and environment variable audits in `.env.example`.
- [ ] **TASK-802: Free-Tier Deployment Configuration**
  - *Acceptance Criteria:* Document and configure Vercel + Neon/Supabase deployment scripts with automated database migration hooks.
- [ ] **TASK-803: Final Verification & Handover Documentation**
  - *Acceptance Criteria:* Verify production build passes with zero errors, update README with quickstart instructions, and document hackathon demo walkthrough.

