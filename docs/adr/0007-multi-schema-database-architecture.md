# ADR 0007: Multi-Schema Database Partitioning and PostgreSQL Immutability Triggers

## Status

Accepted

## Context

A mental health platform handling sensitive student data cannot rely solely on application-level authorization. A database breach or accidental bulk query must not trivially correlate student identity with sensitive mental health indicators. Furthermore, audit trails and legal consent history must be provably tamper-evident and resilient against database administrator tampering.

## Decision

1. **Multi-Schema Partitioning:**
   - Partition PostgreSQL into three isolated schemas:
     - `identity`: User accounts, encrypted emails (`AES-256-GCM`), HMAC lookup hashes, institutional keys (`StudentKey`), and legal consent ledger (`consent_records`, `consent_state`).
     - `telemetry`: Behavioral mental health indicators, survey responses, academic signals, help-seeking patterns, risk evaluations, counselor triage cases, and feedback ratings—keyed exclusively by `student_pseudo_id`.
     - `audit`: Append-only, cryptographically chained audit log entries (`audit_log_entries`) and the verified support directory.

2. **Database-Level Immutability Triggers:**
   - **Audit Log Immutability:** A PostgreSQL statement-level trigger (`BEFORE UPDATE OR DELETE OR TRUNCATE ON audit.audit_log_entries FOR EACH STATEMENT`) blocks any update, deletion, or truncation with an immediate `integrity_constraint_violation` exception.
   - **Consent Record Immutability:** A PostgreSQL trigger (`BEFORE UPDATE OR DELETE ON identity.consent_records FOR EACH ROW`) blocks all updates. Deletions are permitted ONLY when an explicit session variable (`sahayak.authorized_erasure = 'true'`) is set during audited Right-to-Erasure execution.

3. **Field-Level Email Encryption and Blind Indexing:**
   - Real student emails are encrypted using AES-256-GCM with authenticated associated data (AAD: `identity:user_email:v1`).
   - Constant-time indexed lookups are performed via a keyed HMAC-SHA256 lookup hash (`email_lookup_hash`) using an institutional secret pepper, preventing plaintext email storage.

4. **SHA-256 Merkle Hash Chaining & Concurrency Serialization:**
   - Every audit log entry references `previous_entry_hash`.
   - The entry hash is computed canonically over all fields and sorted JSON details:
     `current_hash = SHA256(prev_hash || sequence || timestamp || actor_pseudo || actor_role || action_type || resource_type || target_pseudo || canonical(details))`
   - Database advisory locks (`pg_advisory_xact_lock(749201)`) serialize concurrent audit insertions, preventing sequence collisions or hash chain forks.

## Consequences

- Database administrators or SQL injection cannot silently alter or delete audit records.
- Cross-schema correlation is prevented because telemetry holds zero foreign keys to user identities.
- Legal consent compliance meets the highest standard of verifiable digital records.
