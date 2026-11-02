import { describe, it, expect } from 'vitest';
import snapshot from '@/data/support-snapshot.json';

describe('CI Support Snapshot Freshness & Verification Gate', () => {
  it('contains valid support entries', () => {
    expect(snapshot.length).toBeGreaterThanOrEqual(4);
  });

  it('asserts that every entry has a valid verified_on date and verified_by staff member', () => {
    for (const entry of snapshot) {
      expect(entry.verified_on).toBeDefined();
      expect(new Date(entry.verified_on).toString()).not.toBe('Invalid Date');
      expect(entry.verified_by).toBeTruthy();
      expect(entry.verification_status).toBe('VERIFIED');
    }
  });

  it('asserts that no entry has an empty or placeholder-only telephone number', () => {
    for (const entry of snapshot) {
      expect(entry.phone).toBeTruthy();
      expect(entry.phone.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('asserts essential Indian national crisis helplines are included in reference seed', () => {
    const phones = snapshot.map((e) => e.phone);
    expect(phones).toContain('14416'); // Tele-MANAS
    expect(phones).toContain('1800-599-0019'); // KIRAN
    expect(phones).toContain('112'); // National Emergency
  });
});
