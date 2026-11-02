import { PrismaClient, Role, Prisma } from '@prisma/client';
import { getPrismaClient } from '@/lib/dal';
import crypto from 'node:crypto';
import { z } from 'zod';

export const AuditDetailsSchema = z
  .object({
    event_category: z.enum(['AUTH', 'CONSENT', 'TRIAGE', 'SECURITY', 'SYSTEM', 'ERASURE']),
    status_code: z.number().int().optional(),
    item_count: z.number().int().optional(),
    flag_state: z.boolean().optional(),
    reason_code: z
      .enum([
        'INITIAL_ONBOARDING',
        'USER_PREFERENCE_UPDATE',
        'RIGHT_TO_ERASURE',
        'CARE_TRIAGE_UNMASK',
        'SYSTEM_MAINTENANCE',
        'TIER_CHANGE_REVIEW',
        'REVERIFICATION_COMPLETE',
      ])
      .optional(),
    metadata_version: z.string().optional(),
  })
  .strict(); // Strict allowlist: forbids free text, user messages, content, or PII!

export type AuditDetails = z.infer<typeof AuditDetailsSchema>;

export interface AuditVerificationResult {
  valid: boolean;
  totalEntries: number;
  brokenAtIndex?: number;
  brokenEntryId?: string;
  error?: string;
  verifiedAt: string;
}

/**
 * Derives an audit pseudonym for an actor.
 * Prevents real user UUIDs, emails, or PII from persisting in immutable audit tombstones.
 */
export function deriveActorPseudoId(actorId: string, salt: string): string {
  return 'act_' + crypto.createHmac('sha256', salt).update(actorId).digest('hex').slice(0, 16);
}

/**
 * Computes canonical SHA-256 hash for an audit log entry across ALL fields.
 */
export function computeCanonicalAuditHash(
  prevHash: string,
  sequenceNumber: bigint | number | string,
  timestamp: string | Date,
  actorPseudoId: string,
  actorRole: string,
  actionType: string,
  resourceType: string,
  targetPseudoId: string | null | undefined,
  details: unknown
): string {
  const tsStr =
    timestamp instanceof Date ? timestamp.toISOString() : new Date(timestamp).toISOString();
  const canonicalPayload = JSON.stringify({
    prev_hash: prevHash,
    sequence: sequenceNumber.toString(),
    timestamp: tsStr,
    actor_pseudo: actorPseudoId,
    actor_role: actorRole,
    action_type: actionType,
    resource_type: resourceType,
    target_pseudo: targetPseudoId || null,
    details: details || null,
  });

  return crypto.createHash('sha256').update(canonicalPayload).digest('hex');
}

/**
 * Compatibility wrapper for computing audit entry hash.
 */
export function computeAuditEntryHash(
  prevHash: string,
  timestamp: string | Date,
  actorPseudoId: string,
  actorRole: string,
  actionType: string,
  targetPseudoId: string | null | undefined,
  details: unknown,
  sequenceNumber: bigint | number | string = 1n,
  resourceType: string = 'SYSTEM'
): string {
  return computeCanonicalAuditHash(
    prevHash,
    sequenceNumber,
    timestamp,
    actorPseudoId,
    actorRole,
    actionType,
    resourceType,
    targetPseudoId,
    details
  );
}

/**
 * Appends an entry to the cryptographically chained audit ledger.
 * Uses PostgreSQL advisory lock to serialize sequence allocation and guarantee linear chain integrity.
 */
export async function logAuditEvent(
  actorPseudoId: string,
  actorRole: Role,
  actionType: string,
  resourceType: string,
  targetPseudoId: string | null | undefined,
  details: AuditDetails,
  prismaOverride?: PrismaClient
) {
  // Validate details against strict allowlist schema
  const validatedDetails = AuditDetailsSchema.parse(details);
  const prisma = prismaOverride || getPrismaClient();

  type TxCallable = (tx: Prisma.TransactionClient) => Promise<unknown>;
  const runInTx =
    typeof prisma.$transaction === 'function'
      ? (cb: TxCallable) =>
          prisma.$transaction(cb as unknown as Parameters<typeof prisma.$transaction>[0])
      : (cb: TxCallable) => cb(prisma as unknown as Prisma.TransactionClient);

  return runInTx(async (tx: Prisma.TransactionClient) => {
    // Acquire PostgreSQL transaction-level advisory lock to serialize audit entry appending
    const txRaw = tx as unknown as { $executeRawUnsafe?: (sql: string) => Promise<unknown> };
    if (typeof txRaw.$executeRawUnsafe === 'function') {
      try {
        await txRaw.$executeRawUnsafe(
          `SELECT pg_advisory_xact_lock(hashtext('sahayak_audit_chain_lock'));`
        );
      } catch {
        // In-memory or non-pg test environments
      }
    }

    const lastEntry = await tx.auditLogEntry.findFirst({
      orderBy: { sequence_number: 'desc' },
    });

    const prevHash = lastEntry ? lastEntry.current_hash : '0'.repeat(64);
    const nextSeq = lastEntry ? BigInt(lastEntry.sequence_number) + 1n : 1n;
    const now = new Date();

    const currentHash = computeCanonicalAuditHash(
      prevHash,
      nextSeq,
      now,
      actorPseudoId,
      actorRole,
      actionType,
      resourceType,
      targetPseudoId,
      validatedDetails
    );

    return tx.auditLogEntry.create({
      data: {
        sequence_number: nextSeq,
        timestamp: now,
        actor_pseudo_id: actorPseudoId,
        actor_role: actorRole,
        action_type: actionType,
        resource_type: resourceType,
        target_pseudo_id: targetPseudoId || null,
        details: validatedDetails as unknown as Prisma.InputJsonValue,
        previous_entry_hash: prevHash,
        current_hash: currentHash,
      },
    });
  });
}

/**
 * Verifies the mathematical integrity of the entire audit chain from genesis to head.
 */
export async function verifyAuditChain(
  prismaOverride?: PrismaClient
): Promise<AuditVerificationResult> {
  const prisma = prismaOverride || getPrismaClient();
  const entries = await prisma.auditLogEntry.findMany({
    orderBy: { sequence_number: 'asc' },
  });

  const verifiedAt = new Date().toISOString();

  if (entries.length === 0) {
    return {
      valid: true,
      totalEntries: 0,
      verifiedAt,
    };
  }

  let expectedPrevHash = '0'.repeat(64);

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    if (entry.previous_entry_hash !== expectedPrevHash) {
      return {
        valid: false,
        totalEntries: entries.length,
        brokenAtIndex: i,
        brokenEntryId: entry.id,
        error: `Broken chain pointer at block ${i}: expected previous hash ${expectedPrevHash}, received ${entry.previous_entry_hash}`,
        verifiedAt,
      };
    }

    const recomputed = computeCanonicalAuditHash(
      entry.previous_entry_hash,
      entry.sequence_number,
      entry.timestamp,
      entry.actor_pseudo_id,
      entry.actor_role,
      entry.action_type,
      entry.resource_type,
      entry.target_pseudo_id,
      entry.details
    );

    if (recomputed !== entry.current_hash) {
      return {
        valid: false,
        totalEntries: entries.length,
        brokenAtIndex: i,
        brokenEntryId: entry.id,
        error: `Payload tampering detected at block ${i}: recomputed hash does not match current_hash`,
        verifiedAt,
      };
    }

    expectedPrevHash = entry.current_hash;
  }

  return {
    valid: true,
    totalEntries: entries.length,
    verifiedAt,
  };
}
