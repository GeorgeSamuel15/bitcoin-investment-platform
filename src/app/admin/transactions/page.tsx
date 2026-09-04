import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminTransactionsPage() {
  const [deposits, orders, withdrawals] = await Promise.all([
    prisma.deposit.findMany({ take: 25, orderBy: { createdAt: 'desc' }, include: { user: true } }).catch(() => []),
    prisma.investmentOrder.findMany({ take: 25, orderBy: { createdAt: 'desc' }, include: { user: true } }).catch(() => []),
    prisma.withdrawal.findMany({ take: 25, orderBy: { createdAt: 'desc' }, include: { user: true } }).catch(() => []),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display font-semibold text-2xl mb-6" style={{ fontFamily: 'Space Grotesk' }}>Recent transactions</h1>
      <Section title="Deposits" rows={deposits.map((d: any) => `${d.user.email} — $${d.amount} — ${d.status}`)} />
      <Section title="Investment orders" rows={orders.map((o: any) => `${o.user.email} — $${o.amountUsd} — ${o.status}`)} />
      <Section title="Withdrawals" rows={withdrawals.map((w: any) => `${w.user.email} — ${w.btcAmount} BTC — ${w.status}`)} />
    </div>
  );
}

function Section({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="mb-8">
      <h2 className="font-mono text-xs uppercase mb-3" style={{ color: 'var(--muted)' }}>{title}</h2>
      {rows.length === 0 ? <p className="text-sm" style={{ color: 'var(--muted)' }}>None yet.</p> :
        <ul className="text-sm flex flex-col gap-1.5">{rows.map((r, i) => <li key={i} className="font-mono text-xs">{r}</li>)}</ul>}
    </div>
  );
}
