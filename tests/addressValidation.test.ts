import { describe, it, expect } from 'vitest';
import { isValidAddress } from '../src/lib/addressValidation';

describe('bitcoin address validation', () => {
  it('accepts a legacy P2PKH-shaped address', () => {
    expect(isValidAddress('bitcoin', '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBe(true);
  });
  it('accepts a bech32-shaped address', () => {
    expect(isValidAddress('bitcoin', 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toBe(true);
  });
  it('rejects an obviously malformed address', () => {
    expect(isValidAddress('bitcoin', 'not-an-address')).toBe(false);
  });
  it('rejects an unsupported network', () => {
    expect(isValidAddress('ethereum', '0x0000000000000000000000000000000000dEaD')).toBe(false);
  });
});
