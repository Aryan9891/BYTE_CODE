# ADR 0006: Purpose-Based Authorization Policy and Data Access Layer (DAL)

## Status
Accepted

## Context
In a privacy-sensitive mental health platform, traditional Role-Based Access Control (RBAC) is insufficient. Access must also be gated by **Access Purpose**, student consent status, algorithmic risk tiers, and cohort size thresholds.

Key non-negotiable invariants:
1. Students may only access their own records under purpose `SELF_VIEW`.
2. Counselors may NEVER read student-private envelope-encrypted journal reflections.
3. Counselors can only unmask student real-world identity when:
   - The student has an active Tier 2 (Gentle Check-in) or Tier 3 (Priority Review) evaluation.
   - The student has not revoked counselor triage consent.
   - The counselor declares a clinical care purpose (`DIRECT_CARE_REVIEW`) and logs a clinical reason.
4. Administrators may NEVER read individual student telemetry or unmask identities.
5. Administrators accessing cohort analytics MUST satisfy $k$-anonymity ($k \ge 10$); cohorts with fewer than 10 students are suppressed to prevent re-identification.
6. All sensitive operations and unmasking actions must be permanently logged to a tamper-evident SHA-256 hash-chained audit ledger.

## Decision
1. **Central Policy Function:** Implement `can(actor, action, resource, purpose, context)` in `src/lib/auth/policy.ts` as the single authoritative decision point.
2. **Encapsulated Data Access Layer:** All database operations on sensitive telemetry must flow through the typed `DataAccessLayer` (`src/lib/dal/index.ts`). Direct Prisma calls from route handlers are disallowed.
3. **Cryptographic Immutability Trigger:** Enforce database-level immutability on `audit_log_entries` using a PostgreSQL `BEFORE UPDATE OR DELETE` trigger.

## Consequences
- No accidental data leakage between roles.
- Small cohort re-identification is prevented by construction.
- Clinical unmasking is fully audited and legally defensible.
- Unmasking attempts on Tier 0 or Tier 1 students fail deterministically.
