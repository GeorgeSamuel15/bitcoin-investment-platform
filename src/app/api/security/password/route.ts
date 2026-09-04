import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { hashPassword, verifyPassword, passwordStrength } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { notifyUser } from '@/lib/notify';

const schema = z.object({ currentPassword: z.string(), newPassword: z.string().min(10) });

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });

  if (!verifyPassword(parsed.data.currentPassword, user.passwordHash)) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 403 });
  }
  const strength = passwordStrength(parsed.data.newPassword);
  if (!strength.ok) return NextResponse.json({ error: strength.reason }, { status: 400 });

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(parsed.data.newPassword) } });
  await logAudit({ actorType: 'user', actorId: user.id, userId: user.id, action: 'security.password_changed' });
  await notifyUser({ userId: user.id, category: 'security', title: 'Password changed', body: 'Your password was just changed. Contact support immediately if this wasn\u2019t you.', email: user.email });

  return NextResponse.json({ ok: true });
}
