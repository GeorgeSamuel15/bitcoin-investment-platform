import { getConfig } from '@/lib/platformConfig';

export const dynamic = 'force-dynamic';

export default async function StrategyPage() {
  const [title, description, regulatoryStatus] = await Promise.all([
    getConfig<string>('strategy_title'),
    getConfig<string>('strategy_description'),
    getConfig<string>('regulatory_status'),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <span className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Investment Strategy</span>
      <h1 className="font-display font-semibold mt-3 mb-6" style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(26px,3.6vw,36px)' }}>
        {title}
      </h1>
      <p className="text-[15px] leading-relaxed whitespace-pre-line" style={{ color: 'var(--muted)' }}>
        {description}
      </p>

      <div className="mt-8 rounded-xl border p-5" style={{ borderColor: 'var(--orange-dim)', background: 'color-mix(in srgb, var(--orange) 6%, transparent)' }}>
        <span className="text-xs font-mono uppercase" style={{ color: 'var(--orange)' }}>Regulatory status</span>
        <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>{regulatoryStatus}</p>
      </div>

      <p className="text-xs font-mono mt-8" style={{ color: 'var(--muted)' }}>
        This description is administrator-configurable and does not itself constitute a regulatory license or approval.
      </p>
    </div>
  );
}
