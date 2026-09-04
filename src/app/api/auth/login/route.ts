import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { createSession } from '@/lib/session';
import { logAudit } from '@/lib/audit';

const schema = z.object({ email: z.string().email(), password: z.string() });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }
  if (user.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'This account is not active. Contact support.' }, { status: 403 });
  }

  await createSession(user.id, undefined, req.headers.get('x-forwarded-for') ?? undefined);
  await logAudit({ actorType: 'user', actorId: user.id, userId: user.id, action: 'user.login' });

  return NextResponse.json({ id: user.id, email: user.email, twoFactorEnabled: user.twoFactorEnabled });
}
