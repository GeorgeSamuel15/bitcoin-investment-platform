import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, passwordStrength } from '@/lib/auth';
import { createSession } from '@/lib/session';
import { logAudit } from '@/lib/audit';
import { notifyUser } from '@/lib/notify';
import crypto from 'crypto';

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(10),
  country: z.string().min(2),
  phone: z.string().optional(),
  referralCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { fullName, email, password, country, phone, referralCode } = parsed.data;

  const strength = passwordStrength(password);
  if (!strength.ok) return NextResponse.json({ error: strength.reason }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });

  let referredById: string | undefined;
  if (referralCode) {
    const referrer = await prisma.user.findUnique({ where: { referralCode } });
    referredById = referrer?.id;
  }

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash: hashPassword(password),
      country,
      phone,
      referralCode: crypto.randomBytes(4).toString('hex'),
      referredById,
    },
  });

  await prisma.portfolio.create({ data: { userId: user.id } });
  await prisma.kycCase.create({ data: { userId: user.id, status: 'NOT_STARTED' } });

  const verificationToken = crypto.randomBytes(24).toString('hex');
  await notifyUser({
    userId: user.id,
    category: 'account',
    title: 'Verify your email',
    body: `Welcome to Bitcoin Investment. Verification token (sandbox): ${verificationToken}`,
    email: user.email,
  });

  await createSession(user.id);
  await logAudit({ actorType: 'user', actorId: user.id, userId: user.id, action: 'user.registered' });

  return NextResponse.json({ id: user.id, email: user.email });
}
