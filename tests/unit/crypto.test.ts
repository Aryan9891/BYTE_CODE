import { describe, it, expect } from 'vitest';
import { generatePseudoId, verifyPseudoId } from '@/lib/crypto/pseudo';
import {
  encryptField,
  decryptField,
  serializePayload,
  deserializePayload,
  buildAAD,
  KeyRing,
  EnvelopeMetadata,
} from '@/lib/crypto/envelope';

describe('Cryptographic & Pseudonymization Utilities (Hardened)', () => {
  const sampleKeyV1 = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const sampleKeyV2 = 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210';
  const sampleSalt = 'salt_secret_1234567890abcdef1234567890abcdef';

  const defaultMeta: EnvelopeMetadata = {
    studentPseudoId: 'ps_abc123456789def0',
    fieldName: 'journal_reflection',
    keyVersion: 'v1',
  };

  describe('generatePseudoId & constant-time verifyPseudoId', () => {
    it('generates consistent pseudonyms for the same user, salt, and version', () => {
      const id1 = generatePseudoId('user_uuid_100', sampleSalt);
      const id2 = generatePseudoId('user_uuid_100', sampleSalt);
      expect(id1).toBe(id2);
      expect(id1.startsWith('ps_')).toBe(true);
      expect(id1.length).toBe(19); // 'ps_' (3) + 16 hex chars
    });

    it('generates different pseudonyms for different salts', () => {
      const id1 = generatePseudoId('user_uuid_100', sampleSalt);
      const id2 = generatePseudoId('user_uuid_100', 'different_salt_12345');
      expect(id1).not.toBe(id2);
    });

    it('generates different pseudonyms across salt rotation versions', () => {
      const idV1 = generatePseudoId('user_uuid_100', sampleSalt, 'v1');
      const idV2 = generatePseudoId('user_uuid_100', sampleSalt, 'v2');
      expect(idV1).not.toBe(idV2);
    });

    it('verifies pseudonyms in constant time with verifyPseudoId', () => {
      const pseudo = generatePseudoId('student@campus.edu', sampleSalt);
      expect(verifyPseudoId(pseudo, 'student@campus.edu', sampleSalt)).toBe(true);
      expect(verifyPseudoId('ps_0000000000000000', 'student@campus.edu', sampleSalt)).toBe(false);
      expect(verifyPseudoId(pseudo, 'other@campus.edu', sampleSalt)).toBe(false);
      expect(verifyPseudoId('short', 'student@campus.edu', sampleSalt)).toBe(false);
      expect(verifyPseudoId('', 'student@campus.edu', sampleSalt)).toBe(false);
      expect(verifyPseudoId(pseudo, '', sampleSalt)).toBe(false);
      expect(verifyPseudoId(pseudo, 'student@campus.edu', '')).toBe(false);
    });

    it('throws if userId or salt is missing', () => {
      expect(() => generatePseudoId('', sampleSalt)).toThrow();
      expect(() => generatePseudoId('user_uuid_100', '')).toThrow();
    });
  });

  describe('AES-256-GCM Envelope Encryption with AAD Binding', () => {
    it('encrypts and decrypts with random 96-bit IV and AAD binding', () => {
      const text = 'Today was challenging, but I took a 10-minute walk and felt slightly grounded.';
      const encrypted = encryptField(text, sampleKeyV1, defaultMeta);

      expect(encrypted.ciphertext).not.toBe(text);
      expect(encrypted.keyVersion).toBe('v1');

      // Verify 96-bit (12-byte) IV in base64
      const ivBuffer = Buffer.from(encrypted.iv, 'base64');
      expect(ivBuffer.length).toBe(12);

      // Verify 128-bit (16-byte) Auth Tag in base64
      const authTagBuffer = Buffer.from(encrypted.authTag, 'base64');
      expect(authTagBuffer.length).toBe(16);

      const decrypted = decryptField(encrypted, sampleKeyV1, defaultMeta);
      expect(decrypted).toBe(text);
    });

    it('generates fresh, unique 96-bit IVs for identical plaintext inputs', () => {
      const text = 'Identical reflection string.';
      const enc1 = encryptField(text, sampleKeyV1, defaultMeta);
      const enc2 = encryptField(text, sampleKeyV1, defaultMeta);

      expect(enc1.iv).not.toBe(enc2.iv);
      expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
      expect(enc1.authTag).not.toBe(enc2.authTag);
    });

    it('detects tampering and throws when ciphertext is altered', () => {
      const text = 'Confidential thought.';
      const encrypted = encryptField(text, sampleKeyV1, defaultMeta);

      const tampered = {
        ...encrypted,
        ciphertext: Buffer.from('tampered content').toString('base64'),
      };

      expect(() => decryptField(tampered, sampleKeyV1, defaultMeta)).toThrow(/authenticity check failed/i);
    });

    it('detects tampering and throws when authTag is altered', () => {
      const text = 'Confidential thought.';
      const encrypted = encryptField(text, sampleKeyV1, defaultMeta);

      // Modify the auth tag
      const authTagBuf = Buffer.from(encrypted.authTag, 'base64');
      authTagBuf[0] ^= 0xff;
      const tampered = {
        ...encrypted,
        authTag: authTagBuf.toString('base64'),
      };

      expect(() => decryptField(tampered, sampleKeyV1, defaultMeta)).toThrow(/authenticity check failed/i);
    });

    it('strictly REJECTS decryption when AAD studentPseudoId does not match', () => {
      const text = 'Private reflection.';
      const encrypted = encryptField(text, sampleKeyV1, defaultMeta);

      const wrongStudentMeta: EnvelopeMetadata = {
        ...defaultMeta,
        studentPseudoId: 'ps_impostor_99999999',
      };

      expect(() => decryptField(encrypted, sampleKeyV1, wrongStudentMeta)).toThrow(
        /authenticity check failed/i
      );
    });

    it('strictly REJECTS decryption when AAD fieldName does not match', () => {
      const text = 'Private reflection.';
      const encrypted = encryptField(text, sampleKeyV1, defaultMeta);

      const wrongFieldMeta: EnvelopeMetadata = {
        ...defaultMeta,
        fieldName: 'other_survey_response',
      };

      expect(() => decryptField(encrypted, sampleKeyV1, wrongFieldMeta)).toThrow(
        /authenticity check failed/i
      );
    });

    it('strictly REJECTS decryption with an incorrect key', () => {
      const text = 'Secret reflections.';
      const encrypted = encryptField(text, sampleKeyV1, defaultMeta);

      expect(() => decryptField(encrypted, sampleKeyV2, defaultMeta)).toThrow(
        /authenticity check failed/i
      );
    });

    it('supports key rotation via KeyRing mapping', () => {
      const keyring: KeyRing = {
        v1: sampleKeyV1,
        v2: sampleKeyV2,
      };

      // 1. Data encrypted under older version v1
      const v1Text = 'Written before annual key rotation.';
      const encV1 = encryptField(v1Text, sampleKeyV1, { ...defaultMeta, keyVersion: 'v1' });

      // 2. Data encrypted under new version v2
      const v2Text = 'Written after key rotation.';
      const encV2 = encryptField(v2Text, sampleKeyV2, { ...defaultMeta, keyVersion: 'v2' });

      // 3. Decrypt both using the multi-version KeyRing
      const decryptedV1 = decryptField(encV1, keyring, { ...defaultMeta, keyVersion: 'v1' });
      const decryptedV2 = decryptField(encV2, keyring, { ...defaultMeta, keyVersion: 'v2' });

      expect(decryptedV1).toBe(v1Text);
      expect(decryptedV2).toBe(v2Text);
    });

    it('throws when decrypting with a KeyRing missing the payload key version', () => {
      const text = 'Versioned payload.';
      const enc = encryptField(text, sampleKeyV1, { ...defaultMeta, keyVersion: 'v99' });
      const partialKeyring: KeyRing = { v1: sampleKeyV1 };

      expect(() => decryptField(enc, partialKeyring, { ...defaultMeta, keyVersion: 'v99' })).toThrow(
        /Key version "v99" not found/i
      );
    });

    it('serializes and deserializes payloads to and from compact string formats', () => {
      const text = 'Serialized journal entry.';
      const encrypted = encryptField(text, sampleKeyV1, defaultMeta);

      const serialized = serializePayload(encrypted);
      expect(serialized.startsWith('v1:')).toBe(true);

      const parsed = deserializePayload(serialized);
      expect(parsed).toEqual(encrypted);

      const decrypted = decryptField(parsed, sampleKeyV1, defaultMeta);
      expect(decrypted).toBe(text);
    });

    it('validates inputs for buildAAD, encryptField, decryptField, and deserializePayload', () => {
      expect(() => buildAAD({ studentPseudoId: '', fieldName: 'test' })).toThrow();
      expect(() => buildAAD({ studentPseudoId: 'ps_123', fieldName: '' })).toThrow();

      expect(() => encryptField('', sampleKeyV1, defaultMeta)).toThrow();
      expect(() => encryptField('test', 'short-key', defaultMeta)).toThrow();

      expect(() => decryptField(null as any, sampleKeyV1, defaultMeta)).toThrow();
      expect(() =>
        decryptField(
          { keyVersion: 'v1', iv: '', authTag: 'tag', ciphertext: 'cipher' },
          sampleKeyV1,
          defaultMeta
        )
      ).toThrow();
      expect(() =>
        decryptField(
          { keyVersion: 'v1', iv: 'iv', authTag: 'tag', ciphertext: 'cipher' },
          'short',
          defaultMeta
        )
      ).toThrow();
      expect(() =>
        decryptField(
          {
            keyVersion: 'v1',
            iv: Buffer.from('short-iv').toString('base64'),
            authTag: Buffer.from('1234567890123456').toString('base64'),
            ciphertext: 'cipher',
          },
          sampleKeyV1,
          defaultMeta
        )
      ).toThrow(/Invalid IV length/i);

      expect(() => deserializePayload('invalid:format')).toThrow();
    });
  });
});
