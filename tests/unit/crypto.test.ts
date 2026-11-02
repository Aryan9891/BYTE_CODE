import { describe, it, expect } from 'vitest';
import { generatePseudoId } from '@/lib/crypto/pseudo';
import { encryptField, decryptField } from '@/lib/crypto/envelope';

describe('Cryptographic & Pseudonymization Utilities', () => {
  const sampleKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const sampleSalt = 'salt_secret_1234567890abcdef1234567890abcdef';

  describe('generatePseudoId', () => {
    it('generates consistent pseudonyms for the same user and salt', () => {
      const id1 = generatePseudoId('user_uuid_100', sampleSalt);
      const id2 = generatePseudoId('user_uuid_100', sampleSalt);
      expect(id1).toBe(id2);
      expect(id1.startsWith('ps_')).toBe(true);
    });

    it('generates different pseudonyms for different salts', () => {
      const id1 = generatePseudoId('user_uuid_100', sampleSalt);
      const id2 = generatePseudoId('user_uuid_100', 'different_salt_12345');
      expect(id1).not.toBe(id2);
    });

    it('throws if userId or salt is missing', () => {
      expect(() => generatePseudoId('', sampleSalt)).toThrow();
      expect(() => generatePseudoId('user_uuid_100', '')).toThrow();
    });
  });

  describe('AES-256-GCM Envelope Encryption', () => {
    it('successfully encrypts and decrypts sensitive journal reflections', () => {
      const text = 'Today was challenging, but I took a 10-minute walk and felt slightly grounded.';
      const encrypted = encryptField(text, sampleKey);

      expect(encrypted.ciphertext).not.toBe(text);
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.authTag).toBeDefined();

      const decrypted = decryptField(encrypted, sampleKey);
      expect(decrypted).toBe(text);
    });

    it('produces unique IVs and ciphertexts for identical plaintext inputs', () => {
      const text = 'Identical reflection string.';
      const enc1 = encryptField(text, sampleKey);
      const enc2 = encryptField(text, sampleKey);

      expect(enc1.iv).not.toBe(enc2.iv);
      expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
    });

    it('detects tampering and throws when ciphertext or authTag is altered', () => {
      const text = 'Confidential thought.';
      const encrypted = encryptField(text, sampleKey);

      const tampered = {
        ...encrypted,
        ciphertext: Buffer.from('tampered content').toString('base64'),
      };

      expect(() => decryptField(tampered, sampleKey)).toThrow();
    });
  });
});
