import crypto from 'crypto';

// Minimal, dependency-free TOTP (RFC 6238) + base32 (RFC 4648) so 2FA works
// with any standard authenticator app (Google Authenticator, Authy, etc.)
// without needing network access to install a library.

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateBase32Secret(bytes = 20): string {
  const buf = crypto.randomBytes(bytes);
  let bits = '';
  for (const b of buf) bits += b.toString(2).padStart(8, '0');
  let secret = '';
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    secret += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  }
  return secret;
}

function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=+$/, '');
  let bits = '';
  for (const char of clean) {
    const val = BASE32_ALPHABET.indexOf(char);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function hotp(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (code % 1_000_000).toString().padStart(6, '0');
}

export function generateTotp(secret: string, stepSeconds = 30, at = Date.now()): string {
  const counter = Math.floor(at / 1000 / stepSeconds);
  return hotp(secret, counter);
}

// Allows a +/-1 step window (90 seconds total) so clock drift between the
// user's phone and the server doesn't cause spurious failures.
export function verifyTotp(secret: string, token: string, stepSeconds = 30, window = 1): boolean {
  const cleanToken = token.replace(/\s/g, '');
  const nowCounter = Math.floor(Date.now() / 1000 / stepSeconds);
  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    const candidate = hotp(secret, nowCounter + errorWindow);
    if (crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(cleanToken.padStart(6, '0')))) {
      return true;
    }
  }
  return false;
}

export function otpauthUrl(secret: string, email: string, issuer = 'Bitcoin Investment'): string {
  const label = encodeURIComponent(`${issuer}:${email}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}
