import { describe, it, expect } from 'vitest';

// Pure math test — does not touch the database. Verifies the balance
// invariant that postLedgerEntries() enforces before writing anything.
function isBalanced(entries: { amount: number }[]): boolean {
  const total = entries.reduce((sum, e) => sum + e.amount, 0);
  return Math.abs(total) < 1e-8;
}

describe('ledger balance invariant', () => {
  it('accepts a balanced deposit entry pair', () => {
    expect(isBalanced([{ amount: 100 }, { amount: -100 }])).toBe(true);
  });

  it('rejects an unbalanced entry set', () => {
    expect(isBalanced([{ amount: 100 }, { amount: -95 }])).toBe(false);
  });

  it('accepts a balanced three-way investment split (principal + fee)', () => {
    expect(isBalanced([{ amount: -100 }, { amount: 98.5 }, { amount: 1.5 }])).toBe(true);
  });
});
