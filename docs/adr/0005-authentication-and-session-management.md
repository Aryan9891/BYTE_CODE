# ADR 0005: Authentication and Session Management Architecture

## Status
Accepted

## Context
Sahayak requires robust authentication that accommodates three distinct user roles (Students, Counselors, Institutional Administrators) while enforcing strict privacy invariants under the Digital Personal Data Protection Act, 2023 (DPDP Act). 

Key architectural requirements:
1. High-entropy, memory-hard credential storage resistant to GPU/ASIC attacks.
2. Institutional domain allowlists to ensure accounts belong to enrolled campus members.
3. DPDP Act Section 9 compliance (age-gating 18+ for automated telemetry processing, with compassionate crisis routing for under-18 users).
4. Developer persona switching in non-production environments without security leakage into production builds.

## Decision
1. **Password Hashing:** Adopt Argon2id via `@node-rs/argon2` with parameters conforming to OWASP guidelines (19 MiB memory cost, 2 iterations, 1 parallelism thread).
2. **Institutional Domain Enforcement:** Validate all registrations against an institutional domain allowlist (e.g. `campus.edu`, subdomains allowed).
3. **Age Verification & Minor Protection:** Enforce an 18+ age gate. In accordance with DPDP Act Section 9 (prohibition on profiling of children without verifiable parental consent), students under 18 cannot enter automated telemetry tracking. However, they are immediately connected to verified crisis hotlines and campus counseling without friction or logging.
4. **Dev Role Switcher:** Provide a dev-only persona switcher (`POST /api/dev/demo-session`) returning HTTP 404 in production (`NODE_ENV === "production"`).

## Consequences
- Passwords are secure against offline dictionary attacks.
- Non-institutional emails are rejected at registration.
- Legal exposure under DPDP Act 2023 is mitigated.
- Developers can test multi-role workflows rapidly in development.

