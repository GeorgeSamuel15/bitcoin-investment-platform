import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

const schema = z.object({ email: z.string().email(), password: z.string() });
const ADMIN_COOKIE = 'bi_admin_session';

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });

  const admin = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });

  // Same generic error whether the email doesn't exist or the password is
  // wrong, to avoid confirming which admin emails exist.
  if (!admin || !admin.active || !verifyPassword(parsed.data.password, admin.passwordHash)) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  // Matches the convention already documented in lib/rbac.ts (cookie value
  // IS the admin id). Flagged there and in the README as needing a real
  // signed session before production — not changed here to avoid widening
  // this repair beyond connecting the existing pieces.
  cookies().set(ADMIN_COOKIE, admin.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours — shorter-lived than investor sessions
    path: '/',
  });

  await logAudit({ actorType: 'admin', actorId: admin.id, action: 'admin.login' });

  return NextResponse.json({ ok: true });
}
