'use client';
import { useEffect, useState } from 'react';

type Tx = { type: string; id: string; amountUsd?: number; btcAmount?: number; status: string; date: string };

export default function TransactionsPage() {
  const [rows, setRows] = useState<Tx[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    Promise.all([
      fetch('/api/deposits').then((r) => r.json()),
      fetch('/api/investments').then((r) => r.json()),
      fetch('/api/withdrawals').then((r) => r.json()),
    ]).then(([deposits, orders, withdrawals]) => {
      const combined: Tx[] = [
        ...deposits.map((d: any) => ({ type: 'deposit', id: d.id, amountUsd: Number(d.amount), status: d.status, date: d.createdAt })),
        ...orders.map((o: any) => ({ type: 'investment', id: o.id, amountUsd: Number(o.amountUsd), btcAmount: Number(o.estimatedBtc), status: o.status, date: o.createdAt })),
        ...withdrawals.map((w: any) => ({ type: 'withdrawal', id: w.id, btcAmount: Number(w.btcAmount), status: w.status, date: w.createdAt })),
      ];
      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRows(combined);
    });
  }, []);

  const filtered = filter === 'all' ? rows : rows.filter((r) => r.type === filter);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="font-display font-semibold text-2xl" style={{ fontFamily: 'Space Grotesk' }}>Transaction history</h1>
        <a href="/api/transactions/export" className="text-sm font-semibold px-4 py-2 rounded-lg border" style={{ borderColor: 'var(--line)' }}>Export CSV</a>
      </div>

      <div className="flex gap-2 mb-6 text-xs font-mono">
        {['all', 'deposit', 'investment', 'withdrawal'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-md border"
            style={{ borderColor: 'var(--line)', background: f === filter ? 'var(--orange)' : 'transparent', color: f === filter ? '#1B1000' : 'var(--muted)' }}>
            {f}
          </button>
        ))}
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)' }}>
            {['Type', 'ID', 'USD', 'BTC', 'Status', 'Date'].map((h) => (
              <th key={h} className="text-left py-2.5 text-xs font-mono uppercase" style={{ color: 'var(--muted)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id} style={{ borderBottom: '1px solid var(--line)' }}>
              <td className="py-3 font-mono text-xs">{r.type}</td>
              <td className="py-3 font-mono text-xs">{r.id.slice(0, 8)}…</td>
              <td className="py-3 font-mono text-xs">{r.amountUsd ? `$${r.amountUsd.toFixed(2)}` : '—'}</td>
              <td className="py-3 font-mono text-xs">{r.btcAmount ? r.btcAmount.toFixed(6) : '—'}</td>
              <td className="py-3 font-mono text-xs">{r.status}</td>
              <td className="py-3 font-mono text-xs">{new Date(r.date).toLocaleDateString()}</td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={6} className="py-10 text-center text-sm" style={{ color: 'var(--muted)' }}>No transactions yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
