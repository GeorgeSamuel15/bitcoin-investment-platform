import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { verifyTotp } from '@/lib/totp';
import { logAudit } from '@/lib/audit';
import { notifyUser } from '@/lib/notify';

const schema = z.object({ token: z.string().min(6).max(6) });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  if (!user.twoFactorSecret) return NextResponse.json({ error: 'Start setup first.' }, { status: 400 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Enter the 6-digit code.' }, { status: 400 });

  if (!verifyTotp(user.twoFactorSecret, parsed.data.token)) {
    return NextResponse.json({ error: 'Incorrect code. Check your authenticator app and try again.' }, { status: 400 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });
  await logAudit({ actorType: 'user', actorId: user.id, userId: user.id, action: 'security.2fa_enabled' });
  await notifyUser({ userId: user.id, category: 'security', title: 'Two-factor authentication enabled', body: 'Your account now requires a code from your authenticator app to withdraw funds.', email: user.email });

  return NextResponse.json({ ok: true });
}
