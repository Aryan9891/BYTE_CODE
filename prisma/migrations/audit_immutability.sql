-- ==============================================================================
-- POSTGRESQL IMMUTABILITY TRIGGER: audit_log_entries
-- ==============================================================================
-- Purpose: Enforce physical, database-level tamper-evidence on the audit ledger.
-- Reference: docs/DATA_MODEL.md & docs/PRIVACY_AND_ETHICS.md
-- Non-negotiable constraint: Updates and deletions on audit records are blocked.
-- ==============================================================================

CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Sahayak Security Invariant Violated: Audit log entries are cryptographically chained and strictly immutable. Updates and deletions are forbidden by institutional governance policy.'
    USING ERRCODE = 'integrity_constraint_violation';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_log_immutable ON "audit_log_entries";

CREATE TRIGGER trg_audit_log_immutable
BEFORE UPDATE OR DELETE ON "audit_log_entries"
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_modification();
