import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { getMarketDataProvider } from '@/lib/providers/marketData';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const portfolio = await prisma.portfolio.findUnique({ where: { userId: user.id } });
  let btcPrice: number | null = null;
  try {
    btcPrice = (await getMarketDataProvider().getPrice('BTC-USD')).price;
  } catch {
    // leave null
  }

  const btcHoldings = Number(portfolio?.btcHoldings ?? 0);
  const totalInvested = Number(portfolio?.totalInvested ?? 0);
  const currentValue = btcPrice ? btcHoldings * btcPrice : null;
  const profitLoss = currentValue !== null ? currentValue - totalInvested : null;
  const profitLossPct = currentValue !== null && totalInvested > 0 ? (profitLoss! / totalInvested) * 100 : null;

  return NextResponse.json({
    totalInvested,
    currentValue,
    btcHoldings,
    availableUsd: Number(portfolio?.availableUsd ?? 0),
    pendingUsd: Number(portfolio?.pendingUsd ?? 0),
    profitLoss,
    profitLossPct,
    btcPrice,
  });
}
