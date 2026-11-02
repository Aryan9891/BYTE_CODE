/**
 * In-memory sliding window rate limiter and account lockout protection.
 * Protects login and signup endpoints from brute-force and credential stuffing attacks.
 */

interface RateLimitRecord {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  lockedUntil?: Date;
  retryAfterSeconds?: number;
}

/**
 * Checks whether an action is allowed under the rate limit for a given key (IP or identifier).
 */
export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record) {
    return {
      allowed: true,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
    };
  }

  // Check if currently locked out
  if (record.lockedUntil && now < record.lockedUntil) {
    const retryAfter = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: new Date(record.lockedUntil),
      retryAfterSeconds: retryAfter,
    };
  }

  // Check if window has expired
  if (now - record.firstAttemptAt > WINDOW_MS) {
    rateLimitStore.delete(key);
    return {
      allowed: true,
      remainingAttempts: MAX_FAILED_ATTEMPTS,
    };
  }

  const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - record.attempts);
  return {
    allowed: remaining > 0,
    remainingAttempts: remaining,
  };
}

/**
 * Records a failed attempt for a given key (IP or identifier).
 * Triggers account lockout if max attempts are exceeded.
 */
export function recordFailedAttempt(key: string): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now - record.firstAttemptAt > WINDOW_MS) {
    rateLimitStore.set(key, {
      attempts: 1,
      firstAttemptAt: now,
    });
    return {
      allowed: true,
      remainingAttempts: MAX_FAILED_ATTEMPTS - 1,
    };
  }

  record.attempts += 1;

  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: new Date(record.lockedUntil),
      retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000),
    };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_FAILED_ATTEMPTS - record.attempts,
  };
}

/**
 * Resets the rate limit counter upon successful authentication.
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Clears all rate limit records (useful for testing).
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}
