import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { getConfig } from '@/lib/platformConfig';
import { getMarketDataProvider } from '@/lib/providers/marketData';
import { logAudit } from '@/lib/audit';

const schema = z.object({ amountUsd: z.number().positive() });

// Creates a PENDING investment order only. Nothing here touches the
// ledger or the user's BTC balance — that only happens once a provider
// (or, in sandbox, an explicit admin action) confirms execution via
// POST /api/investments/:id/execute.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const kyc = await prisma.kycCase.findUnique({ where: { userId: user.id } });
  if (kyc?.status !== 'APPROVED') {
    return NextResponse.json({ error: 'Identity verification must be approved before you can invest.' }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid amount.' }, { status: 400 });
  const { amountUsd } = parsed.data;

  const [minInvestment, maxInvestment, feePct] = await Promise.all([
    getConfig<number>('min_investment_usd'),
    getConfig<number>('max_investment_usd'),
    getConfig<number>('fee_investment_pct'),
  ]);
  if (amountUsd < minInvestment) return NextResponse.json({ error: `Minimum investment is $${minInvestment}.` }, { status: 400 });
  if (amountUsd > maxInvestment) return NextResponse.json({ error: `Maximum investment is $${maxInvestment}.` }, { status: 400 });

  const portfolio = await prisma.portfolio.findUnique({ where: { userId: user.id } });
  if (!portfolio || Number(portfolio.availableUsd) < amountUsd) {
    return NextResponse.json({ error: 'Insufficient available balance. Fund your account first.' }, { status: 400 });
  }

  let btcPrice: number;
  try {
    btcPrice = (await getMarketDataProvider().getPrice('BTC-USD')).price;
  } catch {
    return NextResponse.json({ error: 'Market data temporarily unavailable — try again shortly.' }, { status: 503 });
  }

  const feeUsd = amountUsd * (feePct / 100);
  const estimatedBtc = (amountUsd - feeUsd) / btcPrice;

  const order = await prisma.$transaction(async (tx) => {
    // Reserve the funds immediately so the same balance can't be used twice.
    await tx.portfolio.update({
      where: { userId: user.id },
      data: { availableUsd: { decrement: amountUsd }, pendingUsd: { increment: amountUsd } },
    });
    return tx.investmentOrder.create({
      data: { userId: user.id, amountUsd, feeUsd, btcPriceUsed: btcPrice, estimatedBtc, status: 'PENDING' },
    });
  });

  await logAudit({ actorType: 'user', actorId: user.id, userId: user.id, action: 'investment.order_created', metadata: { orderId: order.id, amountUsd } });

  return NextResponse.json(order);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const orders = await prisma.investmentOrder.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, include: { execution: true } });
  return NextResponse.json(orders);
}
