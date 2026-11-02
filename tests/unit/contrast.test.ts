import { describe, it, expect } from 'vitest';

/**
 * WCAG 2.2 AA Contrast Calculation
 */
function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  return [r, g, b];
}

function getLuminance([r, g, b]: [number, number, number]): number {
  const [R, G, B] = [r, g, b].map((val) => {
    return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hexToRgb(hex1));
  const lum2 = getLuminance(hexToRgb(hex2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Design Tokens WCAG 2.2 AA Contrast Verification', () => {
  const lightTokens = {
    bgPrimary: '#FAF9F6',
    bgSurface: '#FFFFFF',
    textPrimary: '#1C2421',
    textSecondary: '#4A5B52',
    textMuted: '#596B62',
    brandPrimary: '#1F5F4A',
    crisisBg: '#FEF2F2',
    crisisText: '#991B1B',
  };

  const darkTokens = {
    bgPrimary: '#111614',
    bgSurface: '#18201D',
    textPrimary: '#F3F4F3',
    textSecondary: '#B4C0B9',
    textMuted: '#82928A',
    brandPrimary: '#388E6D',
    crisisBg: '#2A1717',
    crisisText: '#FCA5A5',
  };

  it('Light Theme: Primary Text meets WCAG AA Normal Text (>= 4.5:1)', () => {
    const ratio = getContrastRatio(lightTokens.textPrimary, lightTokens.bgPrimary);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('Light Theme: Secondary Text meets WCAG AA Normal Text (>= 4.5:1)', () => {
    const ratio = getContrastRatio(lightTokens.textSecondary, lightTokens.bgPrimary);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('Light Theme: Muted Text meets WCAG AA Normal Text (>= 4.5:1)', () => {
    const ratio = getContrastRatio(lightTokens.textMuted, lightTokens.bgPrimary);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('Light Theme: Crisis Text on Crisis Background meets WCAG AA (>= 4.5:1)', () => {
    const ratio = getContrastRatio(lightTokens.crisisText, lightTokens.crisisBg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('Dark Theme: Primary Text meets WCAG AA Normal Text (>= 4.5:1)', () => {
    const ratio = getContrastRatio(darkTokens.textPrimary, darkTokens.bgPrimary);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('Dark Theme: Secondary Text meets WCAG AA Normal Text (>= 4.5:1)', () => {
    const ratio = getContrastRatio(darkTokens.textSecondary, darkTokens.bgPrimary);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('Dark Theme: Muted Text meets WCAG AA Normal Text (>= 4.5:1)', () => {
    const ratio = getContrastRatio(darkTokens.textMuted, darkTokens.bgPrimary);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('Dark Theme: Crisis Text on Crisis Background meets WCAG AA (>= 4.5:1)', () => {
    const ratio = getContrastRatio(darkTokens.crisisText, darkTokens.crisisBg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});
