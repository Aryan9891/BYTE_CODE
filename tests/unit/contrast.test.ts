import { describe, it, expect } from 'vitest';

/**
 * WCAG 2.2 AA Contrast Calculation
 * Reference: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
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
    bgMuted: '#F0EFEB',
    textPrimary: '#1C2421',
    textSecondary: '#4A5B52',
    textMuted: '#596B62',
    brandPrimary: '#1F5F4A',
    brandAccent: '#388E6D',
    brandFocus: '#1A56DB',
    crisisBg: '#FEF2F2',
    crisisText: '#991B1B',
    disabledText: '#718379',
    disabledBg: '#E8E7E3',
  };

  const darkTokens = {
    bgPrimary: '#111614',
    bgSurface: '#18201D',
    bgMuted: '#222D28',
    textPrimary: '#F3F4F3',
    textSecondary: '#B4C0B9',
    textMuted: '#82928A',
    brandPrimary: '#388E6D',
    brandAccent: '#52B788',
    brandFocus: '#60A5FA',
    crisisBg: '#2A1717',
    crisisText: '#FCA5A5',
    disabledText: '#7A8C84',
    disabledBg: '#1E2824',
  };

  // TierBadge specific color palettes
  const tierBadges = {
    light: {
      tier0: { bg: '#ECFDF5', text: '#065F46', border: '#6EE7B7' },
      tier1: { bg: '#FFFBEB', text: '#78350F', border: '#FCD34D' },
      tier2: { bg: '#FFF7ED', text: '#7C2D12', border: '#FDBA74' },
      tier3: { bg: '#FEF2F2', text: '#7F1D1D', border: '#FCA5A5' },
    },
    dark: {
      tier0: { bg: '#022C22', text: '#6EE7B7', border: '#065F46' },
      tier1: { bg: '#451A03', text: '#FCD34D', border: '#78350F' },
      tier2: { bg: '#431407', text: '#FDBA74', border: '#7C2D12' },
      tier3: { bg: '#450A0A', text: '#FCA5A5', border: '#7F1D1D' },
    },
  };

  describe('Light Theme: Normal Body Text (Threshold: >= 4.5:1)', () => {
    it('Primary Text meets WCAG AA Normal Text', () => {
      const ratio = getContrastRatio(lightTokens.textPrimary, lightTokens.bgPrimary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('Secondary Text meets WCAG AA Normal Text', () => {
      const ratio = getContrastRatio(lightTokens.textSecondary, lightTokens.bgPrimary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('Muted Text meets WCAG AA Normal Text', () => {
      const ratio = getContrastRatio(lightTokens.textMuted, lightTokens.bgPrimary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('Link Text (Brand Primary) on Primary Background meets WCAG AA', () => {
      const ratio = getContrastRatio(lightTokens.brandPrimary, lightTokens.bgPrimary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('Crisis Text on Crisis Background meets WCAG AA', () => {
      const ratio = getContrastRatio(lightTokens.crisisText, lightTokens.crisisBg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Dark Theme: Normal Body Text (Threshold: >= 4.5:1)', () => {
    it('Primary Text meets WCAG AA Normal Text', () => {
      const ratio = getContrastRatio(darkTokens.textPrimary, darkTokens.bgPrimary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('Secondary Text meets WCAG AA Normal Text', () => {
      const ratio = getContrastRatio(darkTokens.textSecondary, darkTokens.bgPrimary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('Muted Text meets WCAG AA Normal Text', () => {
      const ratio = getContrastRatio(darkTokens.textMuted, darkTokens.bgPrimary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('Link Text (Brand Accent) on Dark Primary Background meets WCAG AA', () => {
      const ratio = getContrastRatio(darkTokens.brandAccent, darkTokens.bgPrimary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('Crisis Text on Crisis Background meets WCAG AA', () => {
      const ratio = getContrastRatio(darkTokens.crisisText, darkTokens.crisisBg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Focus Ring & UI Components (Threshold: >= 3.0:1 for Non-Text Contrast)', () => {
    it('Light Theme: Focus Ring meets >= 3:1 against primary background', () => {
      const ratio = getContrastRatio(lightTokens.brandFocus, lightTokens.bgPrimary);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
    });

    it('Light Theme: Focus Ring meets >= 3:1 against surface background', () => {
      const ratio = getContrastRatio(lightTokens.brandFocus, lightTokens.bgSurface);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
    });

    it('Dark Theme: Focus Ring meets >= 3:1 against primary background', () => {
      const ratio = getContrastRatio(darkTokens.brandFocus, darkTokens.bgPrimary);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
    });

    it('Dark Theme: Focus Ring meets >= 3:1 against surface background', () => {
      const ratio = getContrastRatio(darkTokens.brandFocus, darkTokens.bgSurface);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
    });
  });

  describe('Disabled State Readability (Threshold: >= 3.0:1)', () => {
    it('Light Theme: Disabled text on disabled background meets >= 3.0:1', () => {
      const ratio = getContrastRatio(lightTokens.disabledText, lightTokens.disabledBg);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
    });

    it('Dark Theme: Disabled text on disabled background meets >= 3.0:1', () => {
      const ratio = getContrastRatio(darkTokens.disabledText, darkTokens.disabledBg);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
    });
  });

  describe('TierBadge Counselor Triage Badges (Threshold: >= 4.5:1 text on badge background)', () => {
    it('Light Theme: Tier 0 Thriving text on badge background meets >= 4.5:1', () => {
      const ratio = getContrastRatio(tierBadges.light.tier0.text, tierBadges.light.tier0.bg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('Light Theme: Tier 1 Watch text on badge background meets >= 4.5:1', () => {
      const ratio = getContrastRatio(tierBadges.light.tier1.text, tierBadges.light.tier1.bg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('Light Theme: Tier 2 Check-in Suggested text on badge background meets >= 4.5:1', () => {
      const ratio = getContrastRatio(tierBadges.light.tier2.text, tierBadges.light.tier2.bg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('Light Theme: Tier 3 Priority Review text on badge background meets >= 4.5:1', () => {
      const ratio = getContrastRatio(tierBadges.light.tier3.text, tierBadges.light.tier3.bg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('Dark Theme: Tier 0 Thriving text on badge background meets >= 4.5:1', () => {
      const ratio = getContrastRatio(tierBadges.dark.tier0.text, tierBadges.dark.tier0.bg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('Dark Theme: Tier 1 Watch text on badge background meets >= 4.5:1', () => {
      const ratio = getContrastRatio(tierBadges.dark.tier1.text, tierBadges.dark.tier1.bg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('Dark Theme: Tier 2 Check-in Suggested text on badge background meets >= 4.5:1', () => {
      const ratio = getContrastRatio(tierBadges.dark.tier2.text, tierBadges.dark.tier2.bg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('Dark Theme: Tier 3 Priority Review text on badge background meets >= 4.5:1', () => {
      const ratio = getContrastRatio(tierBadges.dark.tier3.text, tierBadges.dark.tier3.bg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});
