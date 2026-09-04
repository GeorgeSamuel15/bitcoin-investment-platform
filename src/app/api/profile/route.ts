import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  return NextResponse.json({
    fullName: user.fullName,
    email: user.email,
    country: user.country,
    phone: user.phone,
    referralCode: user.referralCode,
    twoFactorEnabled: user.twoFactorEnabled,
    createdAt: user.createdAt,
  });
}

// Email is intentionally NOT editable here — changing it should require
// re-verification, which is a follow-up, not something to silently allow.
const schema = z.object({ fullName: z.string().min(2), country: z.string().min(2), phone: z.string().optional() });

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });

  await prisma.user.update({ where: { id: user.id }, data: parsed.data });
  await logAudit({ actorType: 'user', actorId: user.id, userId: user.id, action: 'profile.updated' });

  return NextResponse.json({ ok: true });
}
