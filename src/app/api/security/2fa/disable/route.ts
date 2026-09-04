import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { verifyPassword } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { notifyUser } from '@/lib/notify';

// Requires the account password (not just the TOTP code) to disable 2FA —
// otherwise a stolen session alone could turn off the withdrawal protection
// it's meant to guard.
const schema = z.object({ password: z.string() });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 403 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
  await logAudit({ actorType: 'user', actorId: user.id, userId: user.id, action: 'security.2fa_disabled' });
  await notifyUser({ userId: user.id, category: 'security', title: 'Two-factor authentication disabled', body: 'If you didn\u2019t do this, change your password immediately and contact support.', email: user.email });

  return NextResponse.json({ ok: true });
}
