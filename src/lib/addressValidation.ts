// Basic structural validation only — this does NOT confirm the address is
// spendable or correct-network. A real integration should use the
// custody/network provider's own address validation before broadcasting.
const PATTERNS: Record<string, RegExp> = {
  bitcoin: /^(bc1[a-zA-HJ-NP-Z0-9]{25,90}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/,
};

export function isValidAddress(network: string, address: string): boolean {
  const pattern = PATTERNS[network.toLowerCase()];
  if (!pattern) return false;
  return pattern.test(address.trim());
}
