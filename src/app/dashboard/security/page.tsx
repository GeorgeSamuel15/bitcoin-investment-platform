'use client';
import { useEffect, useState } from 'react';

type Session = { id: string; current: boolean; ipAddress: string | null; device: string; createdAt: string; expiresAt: string };

export default function SecurityPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaved, setPwSaved] = useState(false);

  const [setupSecret, setSetupSecret] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [totpToken, setTotpToken] = useState('');
  const [twoFaError, setTwoFaError] = useState<string | null>(null);
  const [disablePassword, setDisablePassword] = useState('');

  function loadAll() {
    fetch('/api/profile').then((r) => r.json()).then((d) => setTwoFactorEnabled(d.twoFactorEnabled));
    fetch('/api/security/sessions').then((r) => r.json()).then((d) => setSessions(Array.isArray(d) ? d : []));
  }
  useEffect(loadAll, []);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null); setPwSaved(false);
    const res = await fetch('/api/security/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) });
    const data = await res.json();
    if (!res.ok) { setPwError(data.error); return; }
    setPwSaved(true);
    setCurrentPassword(''); setNewPassword('');
  }

  async function start2fa() {
    setTwoFaError(null);
    const res = await fetch('/api/security/2fa/setup', { method: 'POST' });
    const data = await res.json();
    if (res.ok) setSetupSecret(data);
  }

  async function confirm2fa(e: React.FormEvent) {
    e.preventDefault();
    setTwoFaError(null);
    const res = await fetch('/api/security/2fa/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: totpToken }) });
    const data = await res.json();
    if (!res.ok) { setTwoFaError(data.error); return; }
    setSetupSecret(null);
    setTotpToken('');
    loadAll();
  }

  async function disable2fa(e: React.FormEvent) {
    e.preventDefault();
    setTwoFaError(null);
    const res = await fetch('/api/security/2fa/disable', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: disablePassword }) });
    const data = await res.json();
    if (!res.ok) { setTwoFaError(data.error); return; }
    setDisablePassword('');
    loadAll();
  }

  async function revoke(sessionId: string) {
    await fetch('/api/security/sessions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) });
    loadAll();
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <h1 className="font-display font-semibold text-2xl mb-8" style={{ fontFamily: 'Space Grotesk' }}>Security</h1>

      {/* Password */}
      <section className="mb-10">
        <h2 className="font-mono text-xs uppercase mb-3" style={{ color: 'var(--muted)' }}>Change password</h2>
        <form onSubmit={changePassword} className="flex flex-col gap-3">
          <input required type="password" placeholder="Current password" className="input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <input required type="password" placeholder="New password (10+ characters)" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          {pwError && <p className="text-sm" style={{ color: 'var(--red)' }}>{pwError}</p>}
          {pwSaved && <p className="text-sm" style={{ color: 'var(--green)' }}>Password updated.</p>}
          <button className="font-semibold rounded-lg py-2.5" style={{ background: 'var(--orange)', color: '#1B1000' }}>Update password</button>
        </form>
      </section>

      {/* 2FA */}
      <section className="mb-10">
        <h2 className="font-mono text-xs uppercase mb-3" style={{ color: 'var(--muted)' }}>Two-factor authentication</h2>

        {twoFactorEnabled ? (
          <div>
            <p className="text-sm mb-3" style={{ color: 'var(--green)' }}>Enabled — required for withdrawals.</p>
            <form onSubmit={disable2fa} className="flex gap-2">
              <input required type="password" placeholder="Password to disable" className="input flex-1" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)} />
              <button className="text-sm font-semibold px-4 rounded-lg" style={{ background: 'var(--red)', color: '#1A0505' }}>Disable</button>
            </form>
          </div>
        ) : setupSecret ? (
          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
            <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>Scan this into your authenticator app, or enter the code manually:</p>
            <div className="font-mono text-sm break-all rounded-md p-3 mb-3" style={{ background: 'var(--panel-2)' }}>{setupSecret.secret}</div>
            <form onSubmit={confirm2fa} className="flex gap-2">
              <input required maxLength={6} placeholder="6-digit code" className="input flex-1" value={totpToken} onChange={(e) => setTotpToken(e.target.value)} />
              <button className="text-sm font-semibold px-4 rounded-lg" style={{ background: 'var(--orange)', color: '#1B1000' }}>Confirm</button>
            </form>
          </div>
        ) : (
          <button onClick={start2fa} className="text-sm font-semibold px-4 py-2.5 rounded-lg" style={{ background: 'var(--orange)', color: '#1B1000' }}>
            Enable two-factor authentication
          </button>
        )}
        {twoFaError && <p className="text-sm mt-2" style={{ color: 'var(--red)' }}>{twoFaError}</p>}
      </section>

      {/* Sessions */}
      <section>
        <h2 className="font-mono text-xs uppercase mb-3" style={{ color: 'var(--muted)' }}>Active sessions</h2>
        <div className="flex flex-col gap-2">
          {sessions.map((s) => (
            <div key={s.id} className="rounded-lg border p-3 flex justify-between items-center text-sm" style={{ borderColor: 'var(--line)' }}>
              <div>
                <div>{s.device} {s.current && <span style={{ color: 'var(--green)' }}>(this device)</span>}</div>
                <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{s.ipAddress ?? 'unknown IP'} · since {new Date(s.createdAt).toLocaleDateString()}</div>
              </div>
              {!s.current && <button onClick={() => revoke(s.id)} className="text-xs underline" style={{ color: 'var(--red)' }}>Revoke</button>}
            </div>
          ))}
          {sessions.length === 0 && <p className="text-sm" style={{ color: 'var(--muted)' }}>No active sessions found.</p>}
        </div>
      </section>

      <style jsx>{`.input { background: var(--panel); border: 1px solid var(--line); color: var(--paper); padding: 11px 13px; border-radius: 8px; font-size: 14px; }`}</style>
    </div>
  );
}
