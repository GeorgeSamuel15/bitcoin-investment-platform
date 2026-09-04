import Link from 'next/link';
import LiveStats from '@/components/LiveStats';
import RiskBanner from '@/components/RiskBanner';

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6">
      <section className="pt-16 pb-14">
        <div
          className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full border mb-7"
          style={{ borderColor: 'var(--orange-dim)', color: 'var(--orange)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--orange)' }} />
          LIVE MARKET DATA
        </div>

        <h1
          className="font-display font-semibold leading-[1.05] tracking-tight"
          style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(34px, 5vw, 56px)' }}
        >
          Invest in Bitcoin.
          <br />
          Build for the long term.
        </h1>

        <p className="mt-5 max-w-xl text-[17px]" style={{ color: 'var(--muted)' }}>
          Bitcoin Investment helps you build a Bitcoin position, one contribution at a time —
          with clear pricing, a transparent strategy, and your holdings tracked in one place.
        </p>

        <div className="flex flex-wrap gap-3 mt-8">
          <Link
            href="/register"
            className="text-sm font-semibold px-5 py-3 rounded-lg"
            style={{ background: 'var(--orange)', color: '#1B1000' }}
          >
            Start Investing
          </Link>
          <Link
            href="/how-it-works"
            className="text-sm font-semibold px-5 py-3 rounded-lg border"
            style={{ borderColor: 'var(--line)' }}
          >
            How It Works
          </Link>
          <a
            href="#"
            className="text-sm font-semibold px-5 py-3 rounded-lg border"
            style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
          >
            Join Our Community
          </a>
        </div>

        <div className="mt-12">
          <LiveStats />
        </div>

        <div className="mt-8">
          <RiskBanner />
        </div>
      </section>
    </div>
  );
}
