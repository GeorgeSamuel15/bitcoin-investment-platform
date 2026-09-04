'use client';
import { useState } from 'react';

export default function AdminUsersPage() {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  async function search() {
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`);
    if (res.ok) setUsers(await res.json());
  }

  async function freeze(userId: string) {
    const reason = prompt('Reason for freezing this account (required, logged in audit trail):');
    if (!reason) return;
    await fetch('/api/admin/users/freeze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, reason }) });
    search();
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display font-semibold text-2xl mb-6" style={{ fontFamily: 'Space Grotesk' }}>Users</h1>
      <div className="flex gap-2 mb-6">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" className="input flex-1" />
        <button onClick={search} className="px-4 rounded-lg font-semibold" style={{ background: 'var(--orange)', color: '#1B1000' }}>Search</button>
      </div>
      <table className="w-full text-sm">
        <thead><tr style={{ borderBottom: '1px solid var(--line)' }}>
          {['Name', 'Email', 'Status', 'KYC', 'BTC Held', ''].map((h) => <th key={h} className="text-left py-2 text-xs font-mono uppercase" style={{ color: 'var(--muted)' }}>{h}</th>)}
        </tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: '1px solid var(--line)' }}>
              <td className="py-3">{u.fullName}</td>
              <td className="py-3 font-mono text-xs">{u.email}</td>
              <td className="py-3 font-mono text-xs">{u.status}</td>
              <td className="py-3 font-mono text-xs">{u.kycCase?.status ?? '—'}</td>
              <td className="py-3 font-mono text-xs">{u.portfolio?.btcHoldings ?? 0}</td>
              <td className="py-3"><button onClick={() => freeze(u.id)} className="text-xs underline" style={{ color: 'var(--red)' }}>Freeze</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`.input { background: var(--panel); border: 1px solid var(--line); color: var(--paper); padding: 10px 12px; border-radius: 8px; font-size: 14px; }`}</style>
    </div>
  );
}
