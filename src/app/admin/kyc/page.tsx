'use client';
import { useEffect, useState } from 'react';

export default function AdminKycPage() {
  const [cases, setCases] = useState<any[]>([]);

  function load() {
    fetch('/api/admin/kyc').then((r) => r.json()).then((d) => setCases(Array.isArray(d) ? d : []));
  }
  useEffect(load, []);

  async function decide(kycCaseId: string, decision: 'APPROVED' | 'REJECTED') {
    await fetch('/api/admin/kyc/decision', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kycCaseId, decision }) });
    load();
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display font-semibold text-2xl mb-6" style={{ fontFamily: 'Space Grotesk' }}>KYC review queue</h1>
      {cases.length === 0 && <p className="text-sm" style={{ color: 'var(--muted)' }}>No cases pending review.</p>}
      <div className="flex flex-col gap-3">
        {cases.map((c) => (
          <div key={c.id} className="rounded-lg border p-4 flex justify-between items-center" style={{ borderColor: 'var(--line)' }}>
            <div>
              <div className="font-semibold text-sm">{c.user.fullName} — {c.user.email}</div>
              <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{c.status} · {c.user.country}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => decide(c.id, 'APPROVED')} className="text-xs font-semibold px-3 py-1.5 rounded-md" style={{ background: 'var(--green)', color: '#04150E' }}>Approve</button>
              <button onClick={() => decide(c.id, 'REJECTED')} className="text-xs font-semibold px-3 py-1.5 rounded-md" style={{ background: 'var(--red)', color: '#1A0505' }}>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
