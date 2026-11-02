# ADR 0008: Consent Ledger, Cryptographic Receipts, and Data Shredding

## Status

Accepted

## Context

Under the Digital Personal Data Protection Act, 2023 (DPDP Act) and GDPR, consent must be freely given, specific, informed, unconditional, and unambiguously expressed through an affirmative action. Users must have the right to withdraw consent as easily as giving it, and exercise their Right to Erasure / Right to be Forgotten.

## Decision

1. **Versioned Multilingual Consent Text:**
   - Consent agreements are maintained in versioned text manifests (`src/lib/consent/consent-text.ts`) with semantic versioning (`1.0.0`).
   - Supported languages: English (`en`), Hindi (`hi`), Bengali (`bn`).
   - Non-English translations are explicitly tracked with governance flags (`needsHumanReview: true`) until certified by accredited institutional translators.

2. **Cryptographically Signed Consent Receipts:**
   - Every consent grant or revocation generates a tamper-evident receipt signed with HMAC-SHA256.
   - Receipts include: `receipt_id`, `student_pseudo_id`, `version`, `locale`, `toggles`, `action`, `timestamp`, `ip_hash`, and `signature`.
   - Verification uses constant-time comparison (`crypto.timingSafeEqual`) to prevent timing side-channel attacks.

3. **Consent Ledger Architecture:**
   - Granular toggle control: `consent_surveys`, `consent_academic`, `consent_help_seeking`, `consent_counselor_triage`, `consent_journal_signals`, `emergency_escalation_acknowledged`.
   - Immutable append-only audit trail in `identity.consent_records`.
   - Materialized cached state in `identity.consent_state` for fast middleware evaluation.

4. **Revocation Deletion Queue Runner:**
   - Revoking consent creates asynchronous jobs in `identity.revocation_deletion_jobs`.
   - The deletion runner purges unconsented telemetry records (`survey_responses`, `academic_signals`, `help_seeking_signals`, and `counselor_cases`) while retaining the immutable consent audit record for regulatory proof.

5. **Cryptographic Shredding for Right to Erasure:**
   - Calling `cryptoShredStudentData(userId, reason)` destroys the student's AES Data Encryption Key row in `identity.student_keys`.
   - Because personal journals are envelope-encrypted with the student's unique DEK, deleting the DEK renders all historical journal ciphertexts mathematically unrecoverable without needing expensive, error-prone database scrubbing of encrypted blocks.
   - An immutable audit log entry (`DATA_ERASURE_CRYPTO_SHRED` under `ERASURE` category) is permanently recorded.

## Consequences

- Compliance with DPDP Act 2023 Section 6 (Notice and Consent) and Section 12 (Right to Correction and Erasure).
- Cryptographic shredding ensures privacy even against forensically restored database backups.
- Students possess verifiable receipts proving when consent was granted or revoked.
