'use client';
import { useEffect, useState } from 'react';

export default function AdminWithdrawalsPage() {
  const [rows, setRows] = useState<any[]>([]);
  function load() { fetch('/api/admin/withdrawals').then((r) => r.json()).then((d) => setRows(Array.isArray(d) ? d : [])); }
  useEffect(load, []);

  async function decide(withdrawalId: string, decision: 'APPROVED' | 'REJECTED') {
    await fetch('/api/admin/withdrawals/decision', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ withdrawalId, decision }) });
    load();
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display font-semibold text-2xl mb-6" style={{ fontFamily: 'Space Grotesk' }}>Withdrawal review</h1>
      {rows.length === 0 && <p className="text-sm" style={{ color: 'var(--muted)' }}>Nothing pending review.</p>}
      <div className="flex flex-col gap-3">
        {rows.map((w) => (
          <div key={w.id} className="rounded-lg border p-4 flex justify-between items-center flex-wrap gap-3" style={{ borderColor: 'var(--line)' }}>
            <div>
              <div className="font-semibold text-sm">{w.user.fullName} — {w.btcAmount} BTC</div>
              <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>to {w.destinationAddr.slice(0, 14)}… · {w.status}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => decide(w.id, 'APPROVED')} className="text-xs font-semibold px-3 py-1.5 rounded-md" style={{ background: 'var(--green)', color: '#04150E' }}>Approve</button>
              <button onClick={() => decide(w.id, 'REJECTED')} className="text-xs font-semibold px-3 py-1.5 rounded-md" style={{ background: 'var(--red)', color: '#1A0505' }}>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
