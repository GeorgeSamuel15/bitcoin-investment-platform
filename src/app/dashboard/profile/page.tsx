'use client';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [form, setForm] = useState({ fullName: '', country: '', phone: '' });
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/profile').then((r) => r.json()).then((d) => {
      setForm({ fullName: d.fullName ?? '', country: d.country ?? '', phone: d.phone ?? '' });
      setEmail(d.email ?? '');
      setReferralCode(d.referralCode ?? '');
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const res = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Could not save.'); return; }
    setSaved(true);
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="font-display font-semibold text-2xl mb-6" style={{ fontFamily: 'Space Grotesk' }}>Profile</h1>

      <div className="rounded-xl border p-4 mb-6 text-sm" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
        <div style={{ color: 'var(--muted)' }}>Email (contact support to change)</div>
        <div className="font-mono mt-1">{email}</div>
      </div>

      <form onSubmit={save} className="flex flex-col gap-4">
        <input required placeholder="Full name" className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input required placeholder="Country" className="input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        <input placeholder="Phone" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        {error && <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
        {saved && <p className="text-sm" style={{ color: 'var(--green)' }}>Saved.</p>}
        <button className="font-semibold rounded-lg py-3" style={{ background: 'var(--orange)', color: '#1B1000' }}>Save changes</button>
      </form>

      {referralCode && (
        <div className="mt-8 rounded-xl border p-4 text-sm" style={{ borderColor: 'var(--line)' }}>
          <div style={{ color: 'var(--muted)' }}>Your referral code</div>
          <div className="font-mono mt-1">{referralCode}</div>
        </div>
      )}
      <style jsx>{`.input { background: var(--panel); border: 1px solid var(--line); color: var(--paper); padding: 12px 14px; border-radius: 8px; font-size: 14.5px; }`}</style>
    </div>
  );
}
