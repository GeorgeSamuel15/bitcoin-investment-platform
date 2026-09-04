'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Login failed.'); return; }
    router.push(callbackUrl);
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="font-display font-semibold text-3xl mb-2" style={{ fontFamily: 'Space Grotesk' }}>Admin sign in</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Separate from investor accounts. Not linked from the public site.</p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input required type="email" placeholder="Admin email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input required type="password" placeholder="Password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm" style={{ color: 'var(--red)' }}>{error}</p>}
        <button className="font-semibold rounded-lg py-3" style={{ background: 'var(--orange)', color: '#1B1000' }}>Sign in</button>
      </form>
      <style jsx>{`
        .input { background: var(--panel); border: 1px solid var(--line); color: var(--paper); padding: 12px 14px; border-radius: 8px; font-size: 14.5px; }
        .input:focus { outline: none; border-color: var(--orange); }
      `}</style>
    </div>
  );
}
