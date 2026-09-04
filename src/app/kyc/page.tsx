'use client';
import { useEffect, useState } from 'react';

const STEPS: Record<string, string> = {
  NOT_STARTED: 'You haven\u2019t started verification yet.',
  PENDING: 'Your verification is pending review. This can take a few minutes to a day.',
  APPROVED: 'You\u2019re verified — you can now fund your account and invest.',
  REJECTED: 'Your verification was not approved. Contact support for next steps.',
  REQUIRES_REVIEW: 'Extra review is needed. Our compliance team will follow up.',
};

export default function KycPage() {
  const [status, setStatus] = useState<string>('NOT_STARTED');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/kyc/status').then((r) => r.json()).then((d) => setStatus(d.status ?? 'NOT_STARTED'));
  }, []);

  async function start() {
    setLoading(true);
    const res = await fetch('/api/kyc/start', { method: 'POST' });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setStatus(data.status);
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <h1 className="font-display font-semibold text-3xl mb-3" style={{ fontFamily: 'Space Grotesk' }}>Identity verification</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
        Required before you can fund an account or invest. We collect your legal name, date of birth,
        country, and a government ID via our verification provider.
      </p>

      <div className="rounded-xl border p-6 mb-6" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
        <span className="text-xs font-mono uppercase" style={{ color: 'var(--muted)' }}>Status</span>
        <div className="font-display font-semibold text-xl mt-1" style={{ fontFamily: 'Space Grotesk' }}>{status.replace('_', ' ')}</div>
        <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>{STEPS[status]}</p>
      </div>

      {status === 'NOT_STARTED' && (
        <button onClick={start} disabled={loading} className="font-semibold rounded-lg py-3 px-6" style={{ background: 'var(--orange)', color: '#1B1000' }}>
          {loading ? 'Starting…' : 'Start verification'}
        </button>
      )}
    </div>
  );
}
