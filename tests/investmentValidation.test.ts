import { describe, it, expect } from 'vitest';

function validateInvestment(amount: number, min: number, max: number, availableUsd: number) {
  if (amount < min) return { ok: false, error: 'below_min' };
  if (amount > max) return { ok: false, error: 'above_max' };
  if (amount > availableUsd) return { ok: false, error: 'insufficient_funds' };
  return { ok: true };
}

describe('investment order validation', () => {
  it('rejects amounts below the configured minimum', () => {
    expect(validateInvestment(0.01, 0.02, 1000, 100).error).toBe('below_min');
  });
  it('rejects amounts above the configured maximum', () => {
    expect(validateInvestment(100000, 0.02, 50000, 200000).error).toBe('above_max');
  });
  it('rejects spending more than the available balance', () => {
    expect(validateInvestment(50, 0.02, 1000, 10).error).toBe('insufficient_funds');
  });
  it('accepts a valid amount within balance and limits', () => {
    expect(validateInvestment(50, 0.02, 1000, 100).ok).toBe(true);
  });
});
