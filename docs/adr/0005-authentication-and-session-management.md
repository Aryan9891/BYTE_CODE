# ADR 0005: Authentication and Session Management Architecture

## Status

Accepted

## Context

Sahayak requires robust authentication that accommodates three distinct user roles (Students, Counselors, Institutional Administrators) while enforcing strict privacy invariants under the Digital Personal Data Protection Act, 2023 (DPDP Act).

Key architectural requirements:

1. High-entropy, memory-hard credential storage resistant to offline GPU/ASIC attacks.
2. Protection against brute-force credential stuffing and session fixation attacks.
3. Strict session lifetime boundaries based on privilege level (staff vs student).
4. Institutional domain allowlists to ensure accounts belong to enrolled campus members.
5. DPDP Act Section 9 compliance (age-gating 18+ for automated telemetry processing, with compassionate crisis routing for under-18 users).
6. Nonce-based CSP enforcement across all dynamic and authenticated routes.

## Decision

1. **Password Hashing (Argon2id):**
   - Adopt OWASP-compliant Argon2id parameters via `@node-rs/argon2`:
     - Memory cost: 65,536 KiB (64 MiB)
     - Time cost: 3 iterations
     - Parallelism: 4 threads
   - Re-hashes legacy hashes automatically upon successful login if configuration upgrades.

2. **Account Lockout & Rate Limiting:**
   - Sliding-window rate limiter per email lookup hash and IP address.
   - 5 failed attempts within a 15-minute window triggers an automatic 15-minute lockout.
   - Generic timing-safe error message (`Invalid credentials`) returned on all failures to prevent account enumeration.

3. **Session Management & Session Fixation Defense:**
   - High-entropy 256-bit cryptographically random tokens (`crypto.randomBytes(32)`).
   - Session rotation upon every login/credential change: old session tokens are purged immediately.
   - Role-based idle timeouts:
     - **Staff (Counselors / Admins):** 30 minutes of inactivity destroys session to prevent unattended terminal hijack.
     - **Students:** 7 days rolling timeout with active touch sliding.
   - "Log out everywhere" functionality (`revokeAllUserSessions`) allowing revocation across all devices.

4. **Staff Invite Tokens:**
   - Single-use cryptographic invite tokens with strict 48-hour expiration.
   - Role binding and pre-verified institutional email ensure only authorized clinicians are onboarded.

5. **Institutional Domain Enforcement & Age Gate:**
   - Email domain verified against campus allowlist (e.g. `campus.edu`).
   - 18+ age verification required. Minors are prohibited from telemetry ingestion (DPDP Act Sec. 9) and are immediately redirected to compassionate crisis paths without logging.

6. **Nonce-Based CSP Middleware:**
   - Enforce cryptographic `nonce-<base64>` header with `strict-dynamic` in `src/middleware.ts`.
   - Dynamic and authenticated routes disallow `'unsafe-inline'` and `'unsafe-eval'`.
   - `/crisis` remains the sole documented static exception in ADR 0004, operating with zero DB, zero auth, and offline resilience.

## Consequences

- Passwords and sessions meet modern OWASP and DPDP Act standards.
- Unattended counselor consoles automatically expire after 30 minutes.
- Credential stuffing and brute-force attacks are thwarted by sliding window lockout.
