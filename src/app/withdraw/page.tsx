'use client';
import { useState } from 'react';
import RiskBanner from '@/components/RiskBanner';

export default function WithdrawPage() {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const res = await fetch('/api/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ btcAmount: parseFloat(amount), address, network: 'bitcoin' }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setResult(`Withdrawal ${data.id} created — status: ${data.status}`);
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display font-semibold text-3xl mb-2" style={{ fontFamily: 'Space Grotesk' }}>Withdraw Bitcoin</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
        New destination addresses and large withdrawals are automatically held for manual review.
      </p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <input required type="number" step="0.00000001" placeholder="Amount (BTC)" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <input required placeholder="Destination BTC address" className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
        {error && <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
        {result && <p className="text-sm" style={{ color: 'var(--green)' }}>{result}</p>}
        <button className="font-semibold rounded-lg py-3" style={{ background: 'var(--orange)', color: '#1B1000' }}>Request withdrawal</button>
      </form>
      <div className="mt-8"><RiskBanner /></div>
      <style jsx>{`
        .input { background: var(--panel); border: 1px solid var(--line); color: var(--paper); padding: 12px 14px; border-radius: 8px; font-size: 14.5px; }
        .input:focus { outline: none; border-color: var(--orange); }
      `}</style>
    </div>
  );
}
