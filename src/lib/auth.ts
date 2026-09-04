import crypto from 'crypto';

// Password hashing via Node's built-in scrypt — no external dependency
// required. Never store or log plaintext passwords anywhere.
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
}

export function passwordStrength(password: string): { ok: boolean; reason?: string } {
  if (password.length < 10) return { ok: false, reason: 'Use at least 10 characters.' };
  if (!/[A-Z]/.test(password)) return { ok: false, reason: 'Include an uppercase letter.' };
  if (!/[0-9]/.test(password)) return { ok: false, reason: 'Include a number.' };
  return { ok: true };
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
