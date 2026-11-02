import { Role } from '@prisma/client';
import crypto from 'node:crypto';

export interface AuthSession {
  token: string;
  userId: string;
  role: Role;
  institutionId: string;
  studentPseudoId?: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
}

export const SESSION_COOKIE_NAME = 'sahayak_session';

// Idle timeouts
const STAFF_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes for Counselor / Admin
const STUDENT_IDLE_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000; // 7 days for Student

// In-memory session store (with multi-session support for logout everywhere)
const activeSessions = new Map<string, AuthSession>();
const userSessionsMap = new Map<string, Set<string>>(); // userId -> Set of session tokens

/**
 * Creates a new session with idle timeout appropriate to the actor's role.
 */
export function createSession(
  userId: string,
  role: Role,
  institutionId: string,
  studentPseudoId?: string
): AuthSession {
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const timeoutMs = role === Role.STUDENT ? STUDENT_IDLE_TIMEOUT_MS : STAFF_IDLE_TIMEOUT_MS;
  const expiresAt = new Date(now.getTime() + timeoutMs);

  const session: AuthSession = {
    token,
    userId,
    role,
    institutionId,
    studentPseudoId,
    createdAt: now,
    expiresAt,
    lastActivityAt: now,
  };

  activeSessions.set(token, session);

  let userTokens = userSessionsMap.get(userId);
  if (!userTokens) {
    userTokens = new Set<string>();
    userSessionsMap.set(userId, userTokens);
  }
  userTokens.add(token);

  return session;
}

/**
 * Validates an active session token, checks idle timeout, and updates activity timestamp.
 */
export function validateSession(token: string): AuthSession | null {
  if (!token) return null;

  const session = activeSessions.get(token);
  if (!session) return null;

  const now = Date.now();

  // Check expiration
  if (now > session.expiresAt.getTime()) {
    revokeSession(token);
    return null;
  }

  // Check idle timeout based on role
  const timeoutMs = session.role === Role.STUDENT ? STUDENT_IDLE_TIMEOUT_MS : STAFF_IDLE_TIMEOUT_MS;
  if (now - session.lastActivityAt.getTime() > timeoutMs) {
    revokeSession(token);
    return null;
  }

  // Slide idle timeout on valid activity
  session.lastActivityAt = new Date(now);
  session.expiresAt = new Date(now + timeoutMs);

  return session;
}

/**
 * Rotates a session upon authentication (invalidates previous token, generates fresh one).
 * Defends against session fixation attacks.
 */
export function rotateSession(
  oldToken: string | undefined,
  sessionData: {
    userId: string;
    role: Role;
    institutionId: string;
    studentPseudoId?: string;
  }
): AuthSession {
  if (oldToken) {
    revokeSession(oldToken);
  }
  return createSession(
    sessionData.userId,
    sessionData.role,
    sessionData.institutionId,
    sessionData.studentPseudoId
  );
}

/**
 * Revokes a specific session token.
 */
export function revokeSession(token: string): boolean {
  const session = activeSessions.get(token);
  if (!session) return false;

  activeSessions.delete(token);

  const userTokens = userSessionsMap.get(session.userId);
  if (userTokens) {
    userTokens.delete(token);
    if (userTokens.size === 0) {
      userSessionsMap.delete(session.userId);
    }
  }

  return true;
}

/**
 * Revokes ALL sessions for a user ID ("Logout Everywhere").
 */
export function revokeAllUserSessions(userId: string): number {
  const userTokens = userSessionsMap.get(userId);
  if (!userTokens) return 0;

  let revokedCount = 0;
  for (const token of userTokens) {
    activeSessions.delete(token);
    revokedCount++;
  }

  userSessionsMap.delete(userId);
  return revokedCount;
}

/**
 * Returns security cookie options for setting the session cookie.
 */
export function getSessionCookieOptions(expiresAt: Date) {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires: expiresAt,
  };
}

/**
 * Clears in-memory session store (useful for test isolation).
 */
export function clearSessionStore(): void {
  activeSessions.clear();
  userSessionsMap.clear();
}
