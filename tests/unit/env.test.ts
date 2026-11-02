import { describe, it, expect } from 'vitest';
import { env } from '@/lib/env';

describe('Environment Variable Validation (Zod)', () => {
  it('loads valid default values without throwing', () => {
    expect(env.NEXT_PUBLIC_APP_NAME).toBe('Sahayak');
    expect(env.NEXT_PUBLIC_DEFAULT_LOCALE).toMatch(/^(en|hi|bn)$/);
    expect(env.DEFAULT_REGION_CODE).toBe('IN');
    expect(env.K_ANONYMITY_MIN_COHORT_SIZE).toBeGreaterThanOrEqual(10);
  });

  it('enforces emergency auto-dispatch strictly OFF by default', () => {
    expect(env.ENABLE_AUTOMATED_EMERGENCY_DISPATCH).toBe(false);
  });
});
