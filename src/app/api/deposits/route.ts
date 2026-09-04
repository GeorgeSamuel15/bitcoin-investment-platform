import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { SandboxPaymentProvider } from '@/lib/providers/sandbox';
import { logAudit } from '@/lib/audit';

const paymentProvider = new SandboxPaymentProvider();
const schema = z.object({ amount: z.number().positive(), currency: z.literal('USD'), method: z.enum(['bank', 'card', 'stablecoin', 'bitcoin']) });

// Creates a deposit intent only. The deposit stays PENDING until the
// payment provider's webhook confirms it — see /api/webhooks/payment.
// Nothing here credits the user's balance.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const kyc = await prisma.kycCase.findUnique({ where: { userId: user.id } });
  if (kyc?.status !== 'APPROVED') {
    return NextResponse.json({ error: 'Identity verification must be approved before you can fund your account.' }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid deposit request.' }, { status: 400 });
  const { amount, currency, method } = parsed.data;

  const intent = await paymentProvider.createDepositIntent({ userId: user.id, amountUsd: amount, method });

  const deposit = await prisma.deposit.create({
    data: { userId: user.id, amount, currency, method, status: 'PENDING', providerRef: intent.providerRef },
  });

  await logAudit({ actorType: 'user', actorId: user.id, userId: user.id, action: 'deposit.created', metadata: { depositId: deposit.id, amount } });

  return NextResponse.json({ depositId: deposit.id, status: deposit.status, providerRef: intent.providerRef });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const deposits = await prisma.deposit.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(deposits);
}
