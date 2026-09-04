'use client';
import { useState } from 'react';

export default function OfficialLinksPage() {
  const [reported, setReported] = useState(false);
  const [details, setDetails] = useState('');

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    // Wire this to /api/support/tickets with category "security" in production.
    await fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'security', subject: 'Scam report', body: details }),
    }).catch(() => {});
    setReported(true);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display font-semibold text-3xl mb-6" style={{ fontFamily: 'Space Grotesk' }}>Official links &amp; scam awareness</h1>

      <div className="rounded-xl border p-5 mb-8" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
        <ul className="text-sm space-y-2 font-mono">
          <li>Website: bitcoin-investment.example (replace with real domain)</li>
          <li>Telegram: see <a href="/community" className="underline">Community</a></li>
          <li>Support: <a href="/support" className="underline">/support</a></li>
          <li>Email: support@bitcoin-investment.example</li>
        </ul>
      </div>

      <div className="rounded-xl border p-5 mb-10" style={{ borderColor: 'var(--orange-dim)', background: 'color-mix(in srgb, var(--orange) 6%, transparent)' }}>
        <p className="text-sm font-semibold mb-1">Never send Bitcoin to an administrator's personal wallet.</p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Never share your password, 2FA code, or private keys with anyone — including someone claiming to be staff.</p>
      </div>

      <h2 className="font-display font-semibold text-lg mb-3" style={{ fontFamily: 'Space Grotesk' }}>Report a scam or impersonator</h2>
      {reported ? (
        <p className="text-sm" style={{ color: 'var(--green)' }}>Thanks — your report has been submitted.</p>
      ) : (
        <form onSubmit={submitReport} className="flex flex-col gap-3">
          <textarea required rows={4} placeholder="Describe what happened (links, usernames, screenshots if possible)" value={details} onChange={(e) => setDetails(e.target.value)} className="input" />
          <button className="font-semibold rounded-lg py-2.5" style={{ background: 'var(--orange)', color: '#1B1000' }}>Submit report</button>
        </form>
      )}
      <style jsx>{`.input { background: var(--panel); border: 1px solid var(--line); color: var(--paper); padding: 10px 12px; border-radius: 8px; font-size: 14px; width: 100%; }`}</style>
    </div>
  );
}
