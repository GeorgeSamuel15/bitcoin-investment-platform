'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? 'Login failed.'); return; }
    router.push(callbackUrl);
    router.refresh(); // re-runs the server-component Navbar so it shows the logged-in state
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="font-display font-semibold text-3xl mb-2" style={{ fontFamily: 'Space Grotesk' }}>Log in</h1>
      {callbackUrl !== '/dashboard' && (
        <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Sign in to continue to {callbackUrl}</p>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-6">
        <input required type="email" placeholder="Email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input required type="password" placeholder="Password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
        <button disabled={loading} className="font-semibold rounded-lg py-3" style={{ background: 'var(--orange)', color: '#1B1000' }}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="text-sm mt-6" style={{ color: 'var(--muted)' }}>
        No account yet? <a href="/register" className="underline">Create one</a>
      </p>
      <style jsx>{`
        .input { background: var(--panel); border: 1px solid var(--line); color: var(--paper); padding: 12px 14px; border-radius: 8px; font-size: 14.5px; }
        .input:focus { outline: none; border-color: var(--orange); }
      `}</style>
    </div>
  );
}
