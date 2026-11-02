# ADR 0003: Crisis Page Static Snapshot Architecture
**Status:** Accepted  
**Date:** 2026-11-02  
**Context:** S-12: AI-Based Mental Health Support and Crisis Detection (Sahayak)

## Context & Problem Statement
When a student in severe distress or acute crisis accesses the emergency support screen (`/crisis`), the page must load instantly ($<100\text{ ms}$), have zero authentication barrier, and never fail due to database cold starts, connection pooling exhaustion, or backend downtime. Simultaneously, hardcoding phone numbers in source code violates governance and makes regional updates error-prone.

## Decision
1. **Verified Directory as Single Source of Truth:**
   All verified helplines, campus desks, and emergency services are maintained in `audit_realm.verified_support_resources` with strict verification metadata (`verified_by`, `verified_on`, `next_verification_due`).
2. **Build-Time Static Snapshot Pipeline:**
   An automated build script serializes verified listings into an immutable static JSON snapshot (`src/data/support-snapshot.json`).
3. **Zero-DB Static `/crisis` Page:**
   The public crisis route (`/crisis`) imports the static JSON snapshot directly at build time. It executes zero database queries and requires zero user authentication or cookies.
4. **CI Verification Gate:**
   A pre-build CI script (`npm run verify:support-snapshot`) asserts:
   - The snapshot is present and non-empty.
   - Every resource has a non-expired `verified_on` date.
   - No placeholder or invalid phone numbers are published to production without the `VERIFY BEFORE LAUNCH` warning banner.

## Consequences
- **Positive:** Unbreakable crisis screen reliability, guaranteed sub-100ms load times, zero phone numbers hardcoded in source components, auditable verification trail.
- **Negative:** Updates to the support directory in the administrative CMS require triggering a fast static rebuild/deployment to update the public crisis snapshot.
