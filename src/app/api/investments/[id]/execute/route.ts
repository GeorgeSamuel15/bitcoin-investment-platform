import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { postLedgerEntries } from '@/lib/ledger';
import { SANDBOX_MODE } from '@/lib/config';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { getMarketDataProvider } from '@/lib/providers/marketData';

// In sandbox mode there is no real custody provider to call, so execution
// is triggered explicitly by an authorized admin (simulating what a real
// provider's confirmation webhook would do) rather than happening
// automatically. This keeps the state machine identical to production.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requirePermission('investments.execute');
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }

  const order = await prisma.investmentOrder.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  if (order.status !== 'PENDING') return NextResponse.json({ error: `Order is already ${order.status}.` }, { status: 409 });

  const executionPrice = SANDBOX_MODE
    ? Number(order.btcPriceUsed)
    : (await getMarketDataProvider().getPrice('BTC-USD')).price;
  const btcAmount = Number(order.estimatedBtc);

  await prisma.$transaction(async (tx) => {
    await tx.investmentOrder.update({ where: { id: order.id }, data: { status: 'EXECUTED' } });
    await tx.execution.create({
      data: { orderId: order.id, btcAmount, executionPriceUsd: executionPrice, providerRef: SANDBOX_MODE ? `sandbox_exec_${order.id}` : undefined, sandbox: SANDBOX_MODE },
    });
    await tx.portfolio.update({
      where: { userId: order.userId },
      data: { pendingUsd: { decrement: order.amountUsd }, btcHoldings: { increment: btcAmount }, totalInvested: { increment: order.amountUsd } },
    });
  });

  await postLedgerEntries({
    refType: 'investment_order',
    refId: order.id,
    currency: 'USD',
    entries: [
      { account: `user:${order.userId}:usd`, amount: -Number(order.amountUsd) },
      { account: 'platform:btc_custody', amount: Number(order.amountUsd) - Number(order.feeUsd) },
      { account: 'platform:fees_revenue', amount: Number(order.feeUsd) },
    ],
  });

  await logAudit({ actorType: 'admin', action: 'investment.executed', metadata: { orderId: order.id, sandbox: SANDBOX_MODE } });

  return NextResponse.json({ status: 'EXECUTED', btcAmount, executionPrice, sandbox: SANDBOX_MODE });
}
