import { prisma } from '@/lib/prisma';
import { getConfig } from '@/lib/platformConfig';

export const dynamic = 'force-dynamic';

// Every figure here must come from real data — never invented, per spec
// section 27. Before a real custody provider is connected, the
// proof-of-reserves field is explicit about that instead of guessing.
export default async function TransparencyPage() {
  const [userCount, btcAgg, investedAgg, regulatoryStatus] = await Promise.all([
    prisma.user.count().catch(() => null),
    prisma.portfolio.aggregate({ _sum: { btcHoldings: true } }).catch(() => ({ _sum: { btcHoldings: null } })),
    prisma.portfolio.aggregate({ _sum: { totalInvested: true } }).catch(() => ({ _sum: { totalInvested: null } })),
    getConfig<string>('regulatory_status'),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display font-semibold text-3xl mb-3" style={{ fontFamily: 'Space Grotesk' }}>Transparency</h1>
      <p className="text-sm mb-10" style={{ color: 'var(--muted)' }}>Only figures that come directly from our database or a verified custody provider — nothing here is estimated.</p>

      <div className="grid grid-cols-2 gap-px rounded-xl overflow-hidden border mb-8" style={{ background: 'var(--line)', borderColor: 'var(--line)' }}>
        <Cell label="Registered Users" value={userCount ?? '—'} />
        <Cell label="Total BTC Held" value={btcAgg._sum.btcHoldings?.toString() ?? '0'} />
        <Cell label="Total Contributions" value={`$${investedAgg._sum.totalInvested?.toString() ?? '0'}`} />
        <Cell label="Custody Provider" value="[CONFIGURE BEFORE PRODUCTION]" />
      </div>

      <div className="rounded-xl border p-5" style={{ borderColor: 'var(--orange-dim)', background: 'color-mix(in srgb, var(--orange) 6%, transparent)' }}>
        <span className="text-xs font-mono uppercase" style={{ color: 'var(--orange)' }}>Regulatory status</span>
        <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>{regulatoryStatus}</p>
      </div>

      <p className="text-xs font-mono mt-8" style={{ color: 'var(--muted)' }}>
        Proof-of-reserves reconciliation against the custody provider will be published here once a provider is connected. Last reconciliation: not yet available.
      </p>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-5" style={{ background: 'var(--panel)' }}>
      <div className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{label}</div>
      <div className="font-display font-semibold text-xl mt-1.5" style={{ fontFamily: 'Space Grotesk' }}>{value}</div>
    </div>
  );
}
