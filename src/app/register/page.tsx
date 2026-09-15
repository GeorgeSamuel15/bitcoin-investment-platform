'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RiskBanner from '@/components/RiskBanner';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', country: '', phone: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(typeof data.error === 'string' ? data.error : 'Could not create account.');
      return;
    }
    router.push('/dashboard');
    router.refresh(); // re-runs the server-component Navbar so it shows the logged-in state
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display font-semibold text-3xl mb-2" style={{ fontFamily: 'Space Grotesk' }}>Create your account</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>Takes about a minute. You&apos;ll verify your identity next.</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input required placeholder="Full name" className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input required type="email" placeholder="Email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required type="password" placeholder="Password (10+ characters)" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <input required placeholder="Country" className="input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        <input placeholder="Phone (optional)" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        {error && <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
        <button disabled={loading} className="font-semibold rounded-lg py-3" style={{ background: 'var(--orange)', color: '#1B1000' }}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm mt-6" style={{ color: 'var(--muted)' }}>
        Already have an account? <a href="/login" className="underline">Sign in</a>
      </p>

      <div className="mt-8"><RiskBanner /></div>

      <style jsx>{`
        .input { background: var(--panel); border: 1px solid var(--line); color: var(--paper); padding: 12px 14px; border-radius: 8px; font-size: 14.5px; }
        .input:focus { outline: none; border-color: var(--orange); }
      `}</style>
    </div>
  );
}
