import { Role } from '@prisma/client';
import crypto from 'node:crypto';

export interface StaffInvite {
  token: string;
  email: string;
  role: Role; // COUNSELOR or ADMIN
  institutionId: string;
  invitedByUserId: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

const inviteStore = new Map<string, StaffInvite>();

const INVITE_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours validity

/**
 * Generates a cryptographically secure, single-use invite token for staff onboarding.
 */
export function createStaffInvite(
  email: string,
  role: Role,
  institutionId: string,
  invitedByUserId: string
): StaffInvite {
  if (role === Role.STUDENT) {
    throw new Error('Staff invite tokens cannot be issued for the STUDENT role.');
  }

  const token = 'inv_' + crypto.randomBytes(24).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + INVITE_TTL_MS);

  const invite: StaffInvite = {
    token,
    email: email.trim().toLowerCase(),
    role,
    institutionId,
    invitedByUserId,
    createdAt: now,
    expiresAt,
    used: false,
  };

  inviteStore.set(token, invite);
  return invite;
}

/**
 * Validates a staff invite token and marks it as used (single-use guarantee).
 */
export function consumeStaffInvite(token: string): StaffInvite | null {
  const invite = inviteStore.get(token);
  if (!invite) return null;

  if (invite.used) {
    return null; // Already consumed
  }

  if (Date.now() > invite.expiresAt.getTime()) {
    inviteStore.delete(token);
    return null; // Expired
  }

  invite.used = true;
  return invite;
}

/**
 * Clears invite store (for test suites).
 */
export function clearInviteStore(): void {
  inviteStore.clear();
}
