import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import snapshot from '@/data/support-snapshot.json';
import { validateSupportSnapshot, SupportResource } from '@/lib/support-snapshot';

const mockFullyVerifiedEntry: SupportResource = {
  id: 'res_verified_test_01',
  name: 'Verified Helpline Test',
  category: 'NATIONAL_HELPLINE',
  description: 'Fully institutionally audited 24/7 counseling support test line.',
  phone: '0000000000',
  sms_or_whatsapp: null,
  web_url: 'https://support.example.edu',
  source_url: 'https://support.example.edu/verification',
  operating_hours: '24/7/365',
  languages_supported: ['English', 'Hindi'],
  region_code: 'IN',
  is_free_toll_free: true,
  is_crisis_priority: true,
  verification_status: 'VERIFIED',
  verified_by: 'Dr. Jane Doe, Chief Medical Officer',
  verified_on: '2026-10-01T00:00:00Z',
  next_verification_due: '2027-10-01T00:00:00Z',
  verification_notes: 'Independently audited and dialed live.',
};

describe('Support Snapshot Gate & Verification Engine', () => {
  describe('Mode: demo', () => {
    it('accepts snapshot with "VERIFY BEFORE LAUNCH" entries and mandates banner display', () => {
      const result = validateSupportSnapshot(snapshot, 'demo');
      expect(result.valid).toBe(true);
      expect(result.requiresBanner).toBe(true);
      expect(result.isPlaceholder).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Mode: launch', () => {
    it('strictly FAILS the gate when snapshot contains unverified or "VERIFY BEFORE LAUNCH" entries', () => {
      const result = validateSupportSnapshot(snapshot, 'launch', new Date('2026-11-01T00:00:00Z'));
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((err) => err.includes('VERIFY BEFORE LAUNCH'))).toBe(true);
    });

    it('passes cleanly when all entries are verified with valid source_url and future review dates', () => {
      const result = validateSupportSnapshot([mockFullyVerifiedEntry], 'launch', new Date('2026-11-01T00:00:00Z'));
      expect(result.valid).toBe(true);
      expect(result.requiresBanner).toBe(false);
      expect(result.isPlaceholder).toBe(false);
      expect(result.errors).toHaveLength(0);
    });

    it('fails when an entry lacks verified_by', () => {
      const invalidEntry = { ...mockFullyVerifiedEntry, verified_by: '' };
      const result = validateSupportSnapshot([invalidEntry], 'launch');
      expect(result.valid).toBe(false);
      expect(result.errors.some((err) => err.includes('missing verified_by'))).toBe(true);
    });

    it('fails when an entry lacks source_url', () => {
      const invalidEntry = { ...mockFullyVerifiedEntry, source_url: '' };
      const result = validateSupportSnapshot([invalidEntry], 'launch');
      expect(result.valid).toBe(false);
      expect(result.errors.some((err) => err.includes('source_url'))).toBe(true);
    });

    it('fails when an entry review date has expired', () => {
      const expiredEntry: SupportResource = {
        ...mockFullyVerifiedEntry,
        next_verification_due: '2026-01-01T00:00:00Z',
      };
      const result = validateSupportSnapshot([expiredEntry], 'launch', new Date('2026-11-01T00:00:00Z'));
      expect(result.valid).toBe(false);
      expect(result.errors.some((err) => err.includes('review date') && err.includes('expired'))).toBe(true);
    });

    it('fails when verification_status is not VERIFIED', () => {
      const pendingEntry: SupportResource = {
        ...mockFullyVerifiedEntry,
        verification_status: 'PENDING',
      };
      const result = validateSupportSnapshot([pendingEntry], 'launch');
      expect(result.valid).toBe(false);
      expect(result.errors.some((err) => err.includes('verification_status must be \'VERIFIED\''))).toBe(true);
    });
  });

  describe('Strict Zero-Hardcoding Phone Check', () => {
    it('confirms no phone numbers or shortcodes exist anywhere in src/ outside src/data/support-snapshot.json', () => {
      const srcDir = path.resolve(process.cwd(), 'src');
      const snapshotPath = path.resolve(srcDir, 'data', 'support-snapshot.json');

      const knownNumbers = [
        '14416',
        '1800-599-0019',
        '1800-891-4416',
        '011-2659-1000',
        '9999 666 555',
        '98765 43210',
        '741741',
      ];

      const phoneRegex = /\b(14416|1800-599-0019|1800-891-4416|741741|\+91\s*9999\s*666\s*555|\+91\s*98765\s*43210|011-2659-1000)\b/;
      const shortcodesRegex = /\b(tel:112|tel:988|sms:741741|sms:988)\b/;

      function scanDir(dir: string, violations: string[]) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scanDir(fullPath, violations);
          } else if (entry.isFile()) {
            if (path.normalize(fullPath) === path.normalize(snapshotPath)) {
              continue; // support-snapshot.json is the single authorized source
            }
            const content = fs.readFileSync(fullPath, 'utf-8');
            for (const num of knownNumbers) {
              if (content.includes(num)) {
                violations.push(`${fullPath}: hardcoded number "${num}" found`);
              }
            }
            if (phoneRegex.test(content)) {
              violations.push(`${fullPath}: phoneRegex match found`);
            }
            if (shortcodesRegex.test(content)) {
              violations.push(`${fullPath}: shortcode call target found`);
            }
          }
        }
      }

      const violations: string[] = [];
      scanDir(srcDir, violations);

      expect(violations).toEqual([]);
    });
  });
});
