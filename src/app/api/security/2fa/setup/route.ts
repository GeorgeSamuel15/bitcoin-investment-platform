import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { generateBase32Secret, otpauthUrl } from '@/lib/totp';

// Generates a new secret but does NOT enable 2FA yet — it's only stored
// as "pending" (twoFactorSecret set, twoFactorEnabled still false) until
// the user proves they can generate a valid code in /2fa/verify. This
// prevents someone getting locked out with a secret they never saved.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const secret = generateBase32Secret();
  await prisma.user.update({ where: { id: user.id }, data: { twoFactorSecret: secret, twoFactorEnabled: false } });

  return NextResponse.json({ secret, otpauthUrl: otpauthUrl(secret, user.email) });
}
