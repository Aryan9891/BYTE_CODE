import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TierBadge, RiskTier } from '@/components/shared/TierBadge';

describe('TierBadge Component (Staff Triage Only)', () => {
  const tiers: RiskTier[] = ['TIER_0', 'TIER_1', 'TIER_2', 'TIER_3'];

  it.each(tiers)('renders tier %s with non-diagnostic accessible copy and icon', (tier) => {
    const { container } = render(<TierBadge tier={tier} />);
    const badge = container.querySelector('span');
    expect(badge).toBeInTheDocument();

    const text = badge?.textContent || '';
    // Must NOT contain clinical diagnoses
    expect(text.toLowerCase()).not.toContain('depress');
    expect(text.toLowerCase()).not.toContain('anxiety');
    expect(text.toLowerCase()).not.toContain('disorder');
    expect(text.toLowerCase()).not.toContain('patient');

    // Must have accessible label
    expect(badge).toHaveAttribute('aria-label');
  });

  it('Tier 0 shows Thriving label', () => {
    render(<TierBadge tier="TIER_0" />);
    expect(screen.getByText(/Tier 0: Thriving/i)).toBeInTheDocument();
  });

  it('Tier 2 shows Check-in Suggested label', () => {
    render(<TierBadge tier="TIER_2" />);
    expect(screen.getByText(/Tier 2: Check-in Suggested/i)).toBeInTheDocument();
  });

  it('Tier 3 shows Priority Review label without clinical stigma', () => {
    render(<TierBadge tier="TIER_3" />);
    expect(screen.getByText(/Tier 3: Priority Review/i)).toBeInTheDocument();
  });
});
