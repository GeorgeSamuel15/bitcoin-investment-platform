import { getConfig } from '@/lib/platformConfig';
import { getMarketDataProvider } from '@/lib/providers/marketData';
import RiskBanner from '@/components/RiskBanner';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function InvestPage() {
  const [minInvestment, feePct, strategyTitle] = await Promise.all([
    getConfig<number>('min_investment_usd'),
    getConfig<number>('fee_investment_pct'),
    getConfig<string>('strategy_title'),
  ]);

  let price: number | null = null;
  let change24h: number | null = null;
  try {
    const point = await getMarketDataProvider().getPrice('BTC-USD');
    price = point.price;
    change24h = point.change24h;
  } catch {
    // leave null -> "unavailable" shown below
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <span className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Invest</span>
      <h1 className="font-display font-semibold mt-3 mb-2" style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(28px,4vw,40px)' }}>
        {strategyTitle}
      </h1>
      <p className="text-[15.5px] mb-10" style={{ color: 'var(--muted)' }}>
        Review the numbers before you commit any money.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden border mb-10" style={{ background: 'var(--line)', borderColor: 'var(--line)' }}>
        <Cell label="BTC / USD" value={price ? `$${price.toLocaleString()}` : 'unavailable'} />
        <Cell label="24h Change" value={change24h !== null ? `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%` : '—'} />
        <Cell label="Minimum Investment" value={`$${minInvestment}`} />
        <Cell label="Investment Fee" value={`${feePct}%`} />
      </div>

      <div className="rounded-xl border p-6 mb-8" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
        <h3 className="font-display font-semibold text-lg mb-3" style={{ fontFamily: 'Space Grotesk' }}>What happens to your money</h3>
        <ul className="text-sm space-y-2" style={{ color: 'var(--muted)' }}>
          <li>Payment methods: bank transfer, card, stablecoin, or Bitcoin (availability depends on your region and provider setup).</li>
          <li>Custody: Bitcoin purchased on your behalf is intended to be held by a qualified/regulated custody provider — see <Link href="/strategy" className="underline">strategy details</Link>.</li>
          <li>Withdrawal: subject to security checks and the platform's <Link href="/legal/withdrawal-policy" className="underline">withdrawal policy</Link>.</li>
        </ul>
      </div>

      <Link href="/register" className="inline-block font-semibold rounded-lg py-3 px-6" style={{ background: 'var(--orange)', color: '#1B1000' }}>
        Create an account to invest
      </Link>

      <div className="mt-10"><RiskBanner /></div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5" style={{ background: 'var(--panel)' }}>
      <div className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{label}</div>
      <div className="font-display font-semibold text-xl mt-1.5" style={{ fontFamily: 'Space Grotesk' }}>{value}</div>
    </div>
  );
}
