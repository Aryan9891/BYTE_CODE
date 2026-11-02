-- ==============================================================================
-- POSTGRESQL IMMUTABILITY TRIGGERS (identity, audit schemas)
-- ==============================================================================
-- Reference: docs/DATA_MODEL.md, docs/PRIVACY_AND_ETHICS.md & Step 3 Specification
-- Non-negotiable constraints:
-- 1. audit.audit_log_entries: UPDATE, DELETE, TRUNCATE are blocked at STATEMENT level.
-- 2. identity.consent_records: UPDATE blocked; DELETE permitted ONLY during audited erasure.
-- ==============================================================================

-- 1. Audit Log Immutability Trigger (Statement Level)
CREATE OR REPLACE FUNCTION audit.prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Sahayak Security Invariant: Audit log entries are cryptographically chained and strictly immutable. Updates, deletions, and truncations are forbidden by institutional governance policy.'
    USING ERRCODE = 'integrity_constraint_violation';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_log_immutable ON audit.audit_log_entries;
DROP TRIGGER IF EXISTS trg_audit_log_truncate ON audit.audit_log_entries;

CREATE TRIGGER trg_audit_log_immutable
BEFORE UPDATE OR DELETE OR TRUNCATE ON audit.audit_log_entries
FOR EACH STATEMENT
EXECUTE FUNCTION audit.prevent_audit_log_modification();

-- 2. Consent Record Append-Only Trigger
CREATE OR REPLACE FUNCTION identity.prevent_consent_record_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION 'Sahayak Security Invariant: ConsentRecord rows are append-only legal evidence. Updates are strictly forbidden.'
        USING ERRCODE = 'integrity_constraint_violation';
    END IF;
    IF TG_OP = 'DELETE' THEN
        -- Only permit deletion if explicit authorized session flag is set by the erasure routine
        IF current_setting('sahayak.authorized_erasure', true) IS DISTINCT FROM 'true' THEN
            RAISE EXCEPTION 'Sahayak Security Invariant: Direct deletion of ConsentRecord rows is forbidden except via audited account erasure routine.'
            USING ERRCODE = 'integrity_constraint_violation';
        END IF;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_consent_record_immutable ON identity.consent_records;
CREATE TRIGGER trg_consent_record_immutable
BEFORE UPDATE OR DELETE ON identity.consent_records
FOR EACH ROW
EXECUTE FUNCTION identity.prevent_consent_record_modification();
