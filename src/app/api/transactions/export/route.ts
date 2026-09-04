import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

// Combines deposits, investment orders, and withdrawals into one CSV —
// the transaction history spec calls for a single exportable ledger view.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const [deposits, orders, withdrawals] = await Promise.all([
    prisma.deposit.findMany({ where: { userId: user.id } }),
    prisma.investmentOrder.findMany({ where: { userId: user.id }, include: { execution: true } }),
    prisma.withdrawal.findMany({ where: { userId: user.id } }),
  ]);

  const rows: string[] = ['type,id,amount_usd,btc_amount,status,date,provider_reference,blockchain_hash'];
  deposits.forEach((d) => rows.push(`deposit,${d.id},${d.amount},,${d.status},${d.createdAt.toISOString()},${d.providerRef ?? ''},`));
  orders.forEach((o) => rows.push(`investment,${o.id},${o.amountUsd},${o.execution?.btcAmount ?? o.estimatedBtc},${o.status},${o.createdAt.toISOString()},${o.execution?.providerRef ?? ''},`));
  withdrawals.forEach((w) => rows.push(`withdrawal,${w.id},,${w.btcAmount},${w.status},${w.createdAt.toISOString()},,${w.blockchainHash ?? ''}`));

  const csv = rows.join('\n');
  return new NextResponse(csv, {
    headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="transactions.csv"' },
  });
}
