'use client';
import { useEffect, useState } from 'react';

type Price = { price: number; change24h: number } | null;
type Stats = { registeredUsers: number | null; totalBtcHeld: string | null } | null;

function fmtUSD(n: number) {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: n < 10 ? 2 : 0 });
}

export default function LiveStats() {
  const [price, setPrice] = useState<Price>(null);
  const [priceError, setPriceError] = useState(false);
  const [stats, setStats] = useState<Stats>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPrice() {
      try {
        const res = await fetch('/api/market/price');
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) {
          setPrice({ price: data.price, change24h: data.change24h });
          setPriceError(false);
        }
      } catch {
        if (!cancelled) setPriceError(true);
      }
    }

    async function loadStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (!cancelled) setStats(data);
      } catch {
        // leave stats null -> renders empty state
      }
    }

    loadPrice();
    loadStats();
    const id = setInterval(loadPrice, 20000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const up = (price?.change24h ?? 0) >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden border" style={{ background: 'var(--line)', borderColor: 'var(--line)' }}>
      <div className="p-5" style={{ background: 'var(--panel)' }}>
        <div className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--muted)' }}>BTC / USD</div>
        <div className="font-display font-semibold text-2xl mt-1.5" style={{ fontFamily: 'Space Grotesk' }}>
          {priceError ? 'unavailable' : price ? fmtUSD(price.price) : '—'}
        </div>
      </div>
      <div className="p-5" style={{ background: 'var(--panel)' }}>
        <div className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--muted)' }}>24h Change</div>
        <div
          className="font-display font-semibold text-2xl mt-1.5"
          style={{ fontFamily: 'Space Grotesk', color: priceError || !price ? undefined : up ? 'var(--green)' : 'var(--red)' }}
        >
          {priceError ? '—' : price ? `${up ? '+' : ''}${price.change24h.toFixed(2)}%` : '—'}
        </div>
      </div>
      <div className="p-5" style={{ background: 'var(--panel)' }}>
        <div className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Registered Users</div>
        <div className="font-display font-semibold text-2xl mt-1.5" style={{ fontFamily: 'Space Grotesk' }}>
          {stats?.registeredUsers ?? '—'}
        </div>
      </div>
      <div className="p-5" style={{ background: 'var(--panel)' }}>
        <div className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Total BTC Held</div>
        <div className="font-display font-semibold text-2xl mt-1.5" style={{ fontFamily: 'Space Grotesk' }}>
          {stats?.totalBtcHeld ?? '—'}
        </div>
      </div>
    </div>
  );
}
