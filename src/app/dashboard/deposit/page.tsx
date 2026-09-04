'use client';
import { useState } from 'react';

// The /api/deposits endpoint already existed; this page was the missing
// piece connecting it to the UI (Phase 8 "Deposit" nav item had nowhere to go).
const METHODS = ['bank', 'card', 'stablecoin', 'bitcoin'] as const;

export default function DepositPage() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<typeof METHODS[number]>('bank');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    const res = await fetch('/api/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(amount), currency: 'USD', method }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? 'Could not start deposit.'); return; }
    setResult(`Deposit ${data.depositId} created — status: ${data.status}. In sandbox mode this stays pending until manually confirmed; a real payment provider would confirm it automatically.`);
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="font-display font-semibold text-2xl mb-2" style={{ fontFamily: 'Space Grotesk' }}>Fund your account</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>Requires approved identity verification first.</p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <input required type="number" step="0.01" placeholder="Amount (USD)" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <select value={method} onChange={(e) => setMethod(e.target.value as typeof method)} className="input">
          {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        {error && <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
        {result && <p className="text-sm" style={{ color: 'var(--green)' }}>{result}</p>}
        <button disabled={loading} className="font-semibold rounded-lg py-3" style={{ background: 'var(--orange)', color: '#1B1000' }}>
          {loading ? 'Starting…' : 'Start deposit'}
        </button>
      </form>
      <style jsx>{`
        .input { background: var(--panel); border: 1px solid var(--line); color: var(--paper); padding: 12px 14px; border-radius: 8px; font-size: 14.5px; width: 100%; }
        .input:focus { outline: none; border-color: var(--orange); }
      `}</style>
    </div>
  );
}
