# ADR 0006: Purpose-Based Authorization Policy and Data Access Layer (DAL)

## Status

Accepted

## Context

In a privacy-sensitive mental health platform, traditional Role-Based Access Control (RBAC) is insufficient. Access must also be gated by **Access Purpose**, student consent status, algorithmic risk tiers, and cohort size thresholds.

Key non-negotiable invariants:

1. Students may only access their own records under purpose `SELF_VIEW`. Student self-views are NOT audited individually to eliminate surveillance chilling effects.
2. Counselors may NEVER read student-private envelope-encrypted journal reflections under any circumstances.
3. Counselors can only unmask student real-world identity when:
   - The student has an active Tier 2 (Gentle Check-in Suggested) or Tier 3 (Priority Human Review) evaluation.
   - The student has explicit affirmative consent for counselor triage (`consent_counselor_triage = true`).
   - The counselor documents a supportive clinical justification ($\ge 10$ characters).
4. Unmasking attempts on Tier 0 (Thriving) or Tier 1 (Watch) students are strictly prohibited and fail deterministically.
5. Institutional administrators only view aggregated analytics with a strict $k$-anonymity threshold ($k \ge 10$). Cohorts with fewer than 10 students are completely suppressed.
6. All sensitive staff reads, triage accesses, and unmasking actions must be permanently logged to a tamper-evident SHA-256 hash-chained audit ledger.

## Decision

1. **Central Policy Engine:** Implement `can(actor, action, resource, purpose, context)` in `src/lib/auth/policy.ts` as the single authoritative decision point.
2. **Architecture Boundary via ESLint:** Enforce an ESLint rule prohibiting `@prisma/client` instantiation in `src/app/**` and `src/components/**`. All database queries must flow through `DataAccessLayer` (`src/lib/dal/index.ts`).
3. **Audit Logging Differentiation:**
   - **Staff Operations (`DIRECT_CARE_REVIEW`):** Every telemetry read and identity unmasking action appends an immutable audit log entry.
   - **Student Operations (`SELF_VIEW`):** Read-only inspection by students of their own telemetry is exempt from per-read audit logging to preserve student autonomy and privacy.
4. **$k$-Anonymity Cohort Guard:** `dal.getCohortMetrics` queries the database count and mathematically suppresses output if $n < 10$.
5. **Decoupled Identity and Telemetry:** Real student identity is stored in `identity.users` with AES-256-GCM encrypted email and HMAC lookup hash. Telemetry is linked exclusively via `student_pseudo_id`.

## Consequences

- Accidental data leakage between roles is prevented at compile time and runtime.
- Small cohort re-identification is mathematically impossible.
- Clinical unmasking is fully audited, transparent, and legally defensible under DPDP Act 2023.
- Personal journals remain cryptographically inaccessible to all non-student actors.
