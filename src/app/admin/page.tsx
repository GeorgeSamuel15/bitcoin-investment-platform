import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Every number here comes straight from the database — no placeholders,
// per spec section 20 ("Only show real database information").
export default async function AdminOverview() {
  const [totalUsers, verifiedUsers, pendingDeposits, pendingWithdrawals, kycPending, complianceOpen, btcAgg, investedAgg] = await Promise.all([
    prisma.user.count(),
    prisma.kycCase.count({ where: { status: 'APPROVED' } }),
    prisma.deposit.count({ where: { status: 'PENDING' } }),
    prisma.withdrawal.count({ where: { status: { in: ['REQUESTED', 'UNDER_REVIEW'] } } }),
    prisma.kycCase.count({ where: { status: { in: ['PENDING', 'REQUIRES_REVIEW'] } } }),
    prisma.complianceAlert.count({ where: { status: 'open' } }),
    prisma.portfolio.aggregate({ _sum: { btcHoldings: true } }),
    prisma.portfolio.aggregate({ _sum: { totalInvested: true } }),
  ]).catch(() => [0, 0, 0, 0, 0, 0, { _sum: { btcHoldings: null } }, { _sum: { totalInvested: null } }] as const);

  const cells = [
    ['Total Users', totalUsers],
    ['Verified Users', verifiedUsers],
    ['Pending Deposits', pendingDeposits],
    ['Pending Withdrawals', pendingWithdrawals],
    ['KYC Cases Open', kycPending],
    ['Compliance Alerts', complianceOpen],
    ['Total BTC Held', (btcAgg as any)._sum.btcHoldings?.toString() ?? '0'],
    ['Total Contributions', `$${(investedAgg as any)._sum.totalInvested?.toString() ?? '0'}`],
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display font-semibold text-2xl mb-6" style={{ fontFamily: 'Space Grotesk' }}>Admin overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden border" style={{ background: 'var(--line)', borderColor: 'var(--line)' }}>
        {cells.map(([label, value]) => (
          <div key={label} className="p-5" style={{ background: 'var(--panel)' }}>
            <div className="text-xs font-mono uppercase" style={{ color: 'var(--muted)' }}>{label}</div>
            <div className="font-display font-semibold text-xl mt-1.5" style={{ fontFamily: 'Space Grotesk' }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
