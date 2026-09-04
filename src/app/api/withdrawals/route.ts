import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { isValidAddress } from '@/lib/addressValidation';
import { logAudit } from '@/lib/audit';
import { SANDBOX_MODE } from '@/lib/config';

const schema = z.object({ btcAmount: z.number().positive(), address: z.string().min(10), network: z.literal('bitcoin') });

const LARGE_WITHDRAWAL_BTC = 0.5; // above this, force manual review regardless of other checks

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  if (!user.twoFactorEnabled) {
    return NextResponse.json({ error: 'Enable two-factor authentication before requesting a withdrawal.' }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid withdrawal request.' }, { status: 400 });
  const { btcAmount, address, network } = parsed.data;

  if (!isValidAddress(network, address)) {
    return NextResponse.json({ error: 'That does not look like a valid Bitcoin address.' }, { status: 400 });
  }

  const portfolio = await prisma.portfolio.findUnique({ where: { userId: user.id } });
  if (!portfolio || Number(portfolio.btcHoldings) < btcAmount) {
    return NextResponse.json({ error: 'Insufficient BTC balance.' }, { status: 400 });
  }

  // New-address cooling period: if this address has never been used by
  // this user before, hold the withdrawal for manual review.
  const priorToSameAddress = await prisma.withdrawal.findFirst({ where: { userId: user.id, destinationAddr: address } });
  const needsReview = !priorToSameAddress || btcAmount >= LARGE_WITHDRAWAL_BTC;

  const withdrawal = await prisma.$transaction(async (tx) => {
    await tx.portfolio.update({ where: { userId: user.id }, data: { btcHoldings: { decrement: btcAmount } } });
    return tx.withdrawal.create({
      data: {
        userId: user.id,
        btcAmount,
        destinationAddr: address,
        network,
        status: needsReview ? 'UNDER_REVIEW' : 'REQUESTED',
        sandbox: SANDBOX_MODE,
      },
    });
  });

  if (needsReview) {
    await prisma.complianceAlert.create({
      data: {
        userId: user.id,
        type: !priorToSameAddress ? 'new_address' : 'large_withdrawal',
        severity: btcAmount >= LARGE_WITHDRAWAL_BTC ? 'high' : 'medium',
        details: `Withdrawal ${withdrawal.id} flagged for manual review.`,
      },
    });
  }

  await logAudit({ actorType: 'user', actorId: user.id, userId: user.id, action: 'withdrawal.requested', metadata: { withdrawalId: withdrawal.id, btcAmount } });

  return NextResponse.json(withdrawal);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const withdrawals = await prisma.withdrawal.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(withdrawals);
}
