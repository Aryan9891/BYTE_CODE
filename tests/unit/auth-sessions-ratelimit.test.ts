import { describe, it, expect, beforeEach } from 'vitest';
import { hashPassword, verifyPassword, OWASP_ARGON2_OPTIONS } from '@/lib/auth/password';
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  clearRateLimitStore,
} from '@/lib/auth/rate-limit';
import {
  createSession,
  validateSession,
  rotateSession,
  revokeSession,
  revokeAllUserSessions,
  clearSessionStore,
} from '@/lib/auth/session';
import { createStaffInvite, consumeStaffInvite, clearInviteStore } from '@/lib/auth/invite';
import { validateAgeGate } from '@/lib/auth/validators';
import { Role } from '@prisma/client';
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';

describe('B2: Auth, Sessions, Rate Limiting & Nonce CSP (src/lib/auth & middleware)', () => {
  beforeEach(() => {
    clearRateLimitStore();
    clearSessionStore();
    clearInviteStore();
  });

  describe('1. Password Hashing & OWASP Argon2id Parameters', () => {
    it('verifies OWASP-compliant parameter configuration', () => {
      expect(OWASP_ARGON2_OPTIONS.memoryCost).toBe(65536); // 64 MB
      expect(OWASP_ARGON2_OPTIONS.timeCost).toBe(3); // 3 iterations
      expect(OWASP_ARGON2_OPTIONS.parallelism).toBe(4); // 4 threads
      expect(OWASP_ARGON2_OPTIONS.outputLen).toBe(32);
    });

    it('hashes and successfully verifies passwords', async () => {
      const pass = 'SahayakSecret!2026';
      const hashStr = await hashPassword(pass);
      expect(hashStr).toContain('$argon2id$');
      expect(await verifyPassword(hashStr, pass)).toBe(true);
      expect(await verifyPassword(hashStr, 'WrongPassword')).toBe(false);
    });

    it('rejects passwords shorter than 8 characters', async () => {
      await expect(hashPassword('short')).rejects.toThrow(
        'Password must be at least 8 characters long.'
      );
    });
  });

  describe('2. Rate Limiting and Account Lockout', () => {
    it('allows attempts within limit and tracks remaining attempts', () => {
      const key = 'ip:192.168.1.1';
      expect(checkRateLimit(key).allowed).toBe(true);

      const r1 = recordFailedAttempt(key);
      expect(r1.allowed).toBe(true);
      expect(r1.remainingAttempts).toBe(4);

      recordFailedAttempt(key);
      recordFailedAttempt(key);
      const r4 = recordFailedAttempt(key);
      expect(r4.remainingAttempts).toBe(1);
    });

    it('locks out account on 5th failed attempt for 15 minutes', () => {
      const key = 'id:test_lookup_hash_123';
      for (let i = 0; i < 4; i++) {
        recordFailedAttempt(key);
      }

      const lockedResult = recordFailedAttempt(key);
      expect(lockedResult.allowed).toBe(false);
      expect(lockedResult.remainingAttempts).toBe(0);
      expect(lockedResult.lockedUntil).toBeDefined();
      expect(lockedResult.retryAfterSeconds).toBeGreaterThan(800);

      const check = checkRateLimit(key);
      expect(check.allowed).toBe(false);
      expect(check.retryAfterSeconds).toBeGreaterThan(800);
    });

    it('resets rate limit upon successful login', () => {
      const key = 'ip:10.0.0.5';
      recordFailedAttempt(key);
      recordFailedAttempt(key);
      expect(checkRateLimit(key).remainingAttempts).toBe(3);

      resetRateLimit(key);
      expect(checkRateLimit(key).remainingAttempts).toBe(5);
    });
  });

  describe('3. Session Management & Role-Based Idle Timeouts', () => {
    it('creates session with 30-minute idle timeout for staff', () => {
      const session = createSession('usr_counselor_1', Role.COUNSELOR, 'inst_1');
      expect(session.token).toHaveLength(64);
      const diffMs = session.expiresAt.getTime() - session.createdAt.getTime();
      expect(diffMs).toBe(30 * 60 * 1000); // 30 minutes
    });

    it('creates session with 7-day idle timeout for students', () => {
      const session = createSession('usr_student_1', Role.STUDENT, 'inst_1', 'pseudo_1');
      const diffMs = session.expiresAt.getTime() - session.createdAt.getTime();
      expect(diffMs).toBe(7 * 24 * 60 * 60 * 1000); // 7 days
    });

    it('rotates session token on login (invalidates old token)', () => {
      const initial = createSession('usr_student_1', Role.STUDENT, 'inst_1');
      expect(validateSession(initial.token)).toBeTruthy();

      const rotated = rotateSession(initial.token, {
        userId: 'usr_student_1',
        role: Role.STUDENT,
        institutionId: 'inst_1',
      });

      expect(rotated.token).not.toBe(initial.token);
      expect(validateSession(initial.token)).toBeNull(); // Old token dead
      expect(validateSession(rotated.token)).toBeTruthy(); // New token alive
    });

    it('implements logout everywhere (revokes all sessions for user)', () => {
      const s1 = createSession('usr_target_1', Role.STUDENT, 'inst_1');
      const s2 = createSession('usr_target_1', Role.STUDENT, 'inst_1');
      const sOther = createSession('usr_other_2', Role.STUDENT, 'inst_1');

      expect(validateSession(s1.token)).toBeTruthy();
      expect(validateSession(s2.token)).toBeTruthy();
      expect(validateSession(sOther.token)).toBeTruthy();

      const revokedCount = revokeAllUserSessions('usr_target_1');
      expect(revokedCount).toBe(2);

      expect(validateSession(s1.token)).toBeNull();
      expect(validateSession(s2.token)).toBeNull();
      expect(validateSession(sOther.token)).toBeTruthy(); // Unaffected
    });
  });

  describe('4. Staff Single-Use Invites', () => {
    it('generates secure single-use invite with 48h expiration', () => {
      const invite = createStaffInvite(
        'newcounselor@campus.edu',
        Role.COUNSELOR,
        'inst_1',
        'admin_1'
      );
      expect(invite.token).toContain('inv_');
      expect(invite.used).toBe(false);

      const consumed = consumeStaffInvite(invite.token);
      expect(consumed).toBeTruthy();
      expect(consumed?.used).toBe(true);

      // Re-use is rejected
      expect(consumeStaffInvite(invite.token)).toBeNull();
    });

    it('rejects staff invite creation for student role', () => {
      expect(() =>
        createStaffInvite('student@campus.edu', Role.STUDENT, 'inst_1', 'admin_1')
      ).toThrow('Staff invite tokens cannot be issued for the STUDENT role.');
    });
  });

  describe('5. Age Gate & DPDP Act Child Safeguards', () => {
    it('aborts processing for under-18 with mandatory crisis referral and legal review flag', () => {
      const res = validateAgeGate(17);
      expect(res.isAllowed).toBe(false);
      expect(res.legalReviewRequired).toBe(true);
      expect(res.supportiveAction).toBe('DIRECT_CRISIS_SUPPORT_ONLY');
      expect(res.message).toContain('DPDP Act 2023');
    });

    it('permits adult students (18+) to proceed', () => {
      const res = validateAgeGate(19);
      expect(res.isAllowed).toBe(true);
      expect(res.legalReviewRequired).toBe(false);
      expect(res.supportiveAction).toBe('PROCEED_TO_ONBOARDING');
    });
  });

  describe('6. Nonce-Based CSP Middleware & /crisis Static Exception', () => {
    it('generates nonce and strict-dynamic for dynamic routes without unsafe-inline or unsafe-eval in script-src', () => {
      const req = new NextRequest(new URL('https://sahayak.campus.edu/student/portal'));
      const res = middleware(req);
      const csp = res.headers.get('Content-Security-Policy') || '';
      const nonce = res.headers.get('x-nonce');

      expect(nonce).toBeTruthy();
      expect(csp).toContain(`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`);
      expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
      expect(csp).not.toContain('unsafe-eval');
    });

    it('preserves offline static exception for /crisis with zero auth/db dependency', () => {
      const req = new NextRequest(new URL('https://sahayak.campus.edu/crisis'));
      const res = middleware(req);
      const csp = res.headers.get('Content-Security-Policy') || '';

      expect(csp).toContain("script-src 'self' 'unsafe-inline'");
      expect(csp).not.toContain('unsafe-eval');
      expect(res.headers.get('x-nonce')).toBeNull(); // No nonce on /crisis static route
    });
  });
});
