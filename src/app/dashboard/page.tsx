'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Portfolio = {
  totalInvested: number; currentValue: number | null; btcHoldings: number;
  availableUsd: number; pendingUsd: number; profitLoss: number | null; profitLossPct: number | null; btcPrice: number | null;
};

const PERIODS = ['24H', '7D', '30D', '3M', '6M', '1Y', 'All Time'];

function fmtUSD(n: number) { return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 }); }

export default function DashboardPage() {
  const router = useRouter();
  const [p, setP] = useState<Portfolio | null>(null);
  const [period, setPeriod] = useState('30D');

  useEffect(() => {
    fetch('/api/portfolio').then(async (r) => {
      if (r.status === 401) {
        router.push('/login?callbackUrl=/dashboard');
        return;
      }
      setP(await r.json());
    });
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="font-display font-semibold text-3xl" style={{ fontFamily: 'Space Grotesk' }}>Portfolio</h1>
        <div className="flex gap-3">
          <Link href="/invest" className="text-sm font-semibold px-4 py-2 rounded-lg" style={{ background: 'var(--orange)', color: '#1B1000' }}>Invest more</Link>
          <Link href="/dashboard/deposit" className="text-sm font-semibold px-4 py-2 rounded-lg border" style={{ borderColor: 'var(--line)' }}>Deposit</Link>
          <Link href="/withdraw" className="text-sm font-semibold px-4 py-2 rounded-lg border" style={{ borderColor: 'var(--line)' }}>Withdraw</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden border mb-6" style={{ background: 'var(--line)', borderColor: 'var(--line)' }}>
        <Cell label="Total Invested" value={p ? fmtUSD(p.totalInvested) : '—'} />
        <Cell label="Current Value" value={p?.currentValue != null ? fmtUSD(p.currentValue) : 'unavailable'} />
        <Cell label="BTC Holdings" value={p ? `${p.btcHoldings.toFixed(6)} BTC` : '—'} />
        <Cell
          label="Profit / Loss"
          value={p?.profitLoss != null ? `${p.profitLoss >= 0 ? '+' : ''}${fmtUSD(p.profitLoss)} (${p.profitLossPct?.toFixed(1)}%)` : '—'}
          color={p?.profitLoss != null ? (p.profitLoss >= 0 ? 'var(--green)' : 'var(--red)') : undefined}
        />
      </div>

      <div className="grid grid-cols-2 gap-px rounded-xl overflow-hidden border mb-8" style={{ background: 'var(--line)', borderColor: 'var(--line)' }}>
        <Cell label="Available Balance" value={p ? fmtUSD(p.availableUsd) : '—'} />
        <Cell label="Pending Balance" value={p ? fmtUSD(p.pendingUsd) : '—'} />
      </div>

      <div className="rounded-xl border p-6 mb-8" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <span className="text-xs font-mono uppercase" style={{ color: 'var(--muted)' }}>Portfolio value over time</span>
          <div className="flex gap-1 text-xs font-mono">
            {PERIODS.map((per) => (
              <button
                key={per}
                onClick={() => setPeriod(per)}
                className="px-2.5 py-1 rounded-md"
                style={{ background: per === period ? 'var(--orange)' : 'transparent', color: per === period ? '#1B1000' : 'var(--muted)' }}
              >
                {per}
              </button>
            ))}
          </div>
        </div>
        <div className="h-40 flex items-center justify-center text-sm" style={{ color: 'var(--muted)' }}>
          Chart renders once historical portfolio snapshots exist in the database for this period.
        </div>
      </div>

      <Link href="/dashboard/transactions" className="text-sm underline" style={{ color: 'var(--muted)' }}>View full transaction history →</Link>
    </div>
  );
}

function Cell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="p-5" style={{ background: 'var(--panel)' }}>
      <div className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{label}</div>
      <div className="font-display font-semibold text-xl mt-1.5" style={{ fontFamily: 'Space Grotesk', color }}>{value}</div>
    </div>
  );
}
