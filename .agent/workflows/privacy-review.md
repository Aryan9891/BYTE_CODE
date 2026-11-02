# Antigravity Workflow: Mandatory Privacy Review Checklist
**Workflow ID:** `workflow:privacy-review`  
**Applicability:** Mandatory before merging or finalizing ANY code touching data ingestion, database models, API responses, or counselor/admin views.

---

## 1. Consent Verification Check
- [ ] Is data ingestion gated by the student's active consent flag (`consent_surveys`, `consent_academic`, `consent_help_seeking`)?
- [ ] If consent is false, does the endpoint reject ingestion immediately with a `403 Forbidden`?
- [ ] Is there an automated path to wipe or scrub this data upon user revocation?

---

## 2. Pseudonymization & Boundary Check
- [ ] Is telemetry keyed exclusively by `student_pseudo_id` rather than the student's primary `user_id`?
- [ ] Are real-world identity fields (`full_name`, `email`, `university_id`) completely excluded from telemetry and analytics tables?
- [ ] Are database queries free of direct SQL joins between `identity_realm.users` and `telemetry_realm` tables (except during audited unmasking)?

---

## 3. Encryption & Student-Private Envelope Encryption Verification
- [ ] Are sensitive free-form text fields (journal entries, survey free-text) encrypted with authenticated envelope encryption (`AES-256-GCM`) before being stored?
- [ ] Is it verified that counselors and admins have ZERO ability to decrypt journal entries?
- [ ] Are journal contents strictly excluded from risk-engine processing unless an explicit, independent opt-in (`consent_journal_signals`) is granted?
- [ ] Are initialization vectors (IVs) and authentication tags uniquely generated per entry?
- [ ] Are cryptographic keys and salt secrets pulled exclusively from secure environment variables?

---

## 4. Institutional Aggregation & k-Anonymity Check
- [ ] Does every admin/institution query enforce the $k$-anonymity threshold ($k \ge 10$)?
- [ ] When a filtered cohort produces $<10$ individual records, are all metrics completely suppressed and replaced with a privacy redaction notice?

---

## 5. Audit Logging Verification
- [ ] Does any staff action that reveals student identity (`/api/v1/counselor/unmask`) mandate an explicit outreach purpose?
- [ ] Is an immutable, SHA-256 chained audit record created atomically with the unmasking action?

---

## 6. Zero PII Logging Audit
- [ ] Verify that no `console.log`, logger statements, or error diagnostics print student names, emails, IP addresses, raw survey answers, or journal text.

