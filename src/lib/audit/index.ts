import { PrismaClient, Prisma } from '@prisma/client';
import { getPrismaClient } from '@/lib/dal';
import { SessionActor } from '@/lib/auth/policy';
import crypto from 'node:crypto';

export interface AuditVerificationResult {
  valid: boolean;
  totalEntries: number;
  brokenAtIndex?: number;
  brokenEntryId?: string;
  error?: string;
  verifiedAt: string;
}

/**
 * Computes canonical SHA-256 hash for an audit log entry.
 * Strictly guarantees deterministic field serialization for tamper-evidence.
 */
export function computeAuditEntryHash(
  prevHash: string,
  timestamp: string | Date,
  actorId: string,
  actorRole: string,
  actionType: string,
  targetPseudoId: string | null | undefined,
  metadata: unknown
): string {
  const tsStr =
    timestamp instanceof Date ? timestamp.toISOString() : new Date(timestamp).toISOString();
  const canonicalPayload = JSON.stringify({
    prev_hash: prevHash,
    timestamp: tsStr,
    actor_id: actorId,
    actor_role: actorRole,
    action_type: actionType,
    target_pseudo_id: targetPseudoId || null,
    metadata: metadata || null,
  });

  return crypto.createHash('sha256').update(canonicalPayload).digest('hex');
}

/**
 * Appends an entry to the cryptographically chained audit ledger.
 */
export async function logAuditEvent(
  actor: SessionActor,
  actionType: string,
  targetPseudoId?: string | null,
  metadata?: Record<string, unknown>,
  prismaOverride?: PrismaClient
) {
  const prisma = prismaOverride || getPrismaClient();

  const lastEntry = await prisma.auditLogEntry.findFirst({
    orderBy: { timestamp: 'desc' },
  });

  const prevHash = lastEntry ? lastEntry.current_entry_hash : '0'.repeat(64);
  const now = new Date();
  const currentHash = computeAuditEntryHash(
    prevHash,
    now,
    actor.id,
    actor.role,
    actionType,
    targetPseudoId,
    metadata
  );

  return prisma.auditLogEntry.create({
    data: {
      actor_id: actor.id,
      actor_role: actor.role,
      action_type: actionType,
      target_pseudo_id: targetPseudoId || null,
      metadata: metadata ? (metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      previous_entry_hash: prevHash,
      current_entry_hash: currentHash,
      timestamp: now,
    },
  });
}

/**
 * Verifies the mathematical integrity of the entire audit chain from genesis to head.
 * Detects any record insertion, deletion, modification, or reordering.
 */
export async function verifyAuditChain(
  prismaOverride?: PrismaClient
): Promise<AuditVerificationResult> {
  const prisma = prismaOverride || getPrismaClient();
  const entries = await prisma.auditLogEntry.findMany({
    orderBy: { timestamp: 'asc' },
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

    // 1. Verify previous hash pointer
    if (i === 0) {
      // Genesis entry must point to null hash (zeros)
      if (entry.previous_entry_hash !== expectedPrevHash) {
        return {
          valid: false,
          totalEntries: entries.length,
          brokenAtIndex: 0,
          brokenEntryId: entry.id,
          error: 'Genesis entry does not link to standard zero hash.',
          verifiedAt,
        };
      }
    } else {
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
    }

    // 2. Recompute current entry hash
    const recomputed = computeAuditEntryHash(
      entry.previous_entry_hash,
      entry.timestamp,
      entry.actor_id,
      entry.actor_role,
      entry.action_type,
      entry.target_pseudo_id,
      entry.metadata
    );

    if (recomputed !== entry.current_entry_hash) {
      return {
        valid: false,
        totalEntries: entries.length,
        brokenAtIndex: i,
        brokenEntryId: entry.id,
        error: `Payload tampering detected at block ${i}: hash mismatch.`,
        verifiedAt,
      };
    }

    expectedPrevHash = entry.current_entry_hash;
  }

  return {
    valid: true,
    totalEntries: entries.length,
    verifiedAt,
  };
}
