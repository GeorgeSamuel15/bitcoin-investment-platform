import { describe, it, expect } from 'vitest';

function needsReview(isNewAddress: boolean, btcAmount: number, largeThreshold: number) {
  return isNewAddress || btcAmount >= largeThreshold;
}

describe('withdrawal manual-review triggers', () => {
  it('flags a brand-new destination address', () => {
    expect(needsReview(true, 0.01, 0.5)).toBe(true);
  });
  it('flags a large withdrawal even to a known address', () => {
    expect(needsReview(false, 0.6, 0.5)).toBe(true);
  });
  it('does not flag a small withdrawal to a known address', () => {
    expect(needsReview(false, 0.1, 0.5)).toBe(false);
  });
});
