'use client';

import { useCallback, useEffect, useState } from 'react';

const CATEGORIES = [
  'account',
  'kyc',
  'deposit',
  'investment',
  'withdrawal',
  'security',
  'technical',
];

type SupportTicket = {
  id: string;
  subject: string;
  category: string;
  status: string;
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [category, setCategory] = useState('account');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const load = useCallback(() => {
    fetch('/api/support/tickets')
      .then((r) => r.json())
      .then((d: unknown) => {
        setTickets(
          Array.isArray(d) ? (d as SupportTicket[]) : []
        );
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    await fetch('/api/support/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category,
        subject,
        body,
      }),
    });

    setSubject('');
    setBody('');
    load();
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1
        className="font-display font-semibold text-2xl mb-6"
        style={{ fontFamily: 'Space Grotesk' }}
      >
        Support
      </h1>

      <form
        onSubmit={submit}
        className="rounded-xl border p-5 mb-10 flex flex-col gap-3"
        style={{
          borderColor: 'var(--line)',
          background: 'var(--panel)',
        }}
      >
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          required
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input"
        />

        <textarea
          required
          placeholder="Describe the issue"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="input"
          rows={4}
        />

        <button
          className="font-semibold rounded-lg py-2.5"
          style={{
            background: 'var(--orange)',
            color: '#1B1000',
          }}
        >
          Submit ticket
        </button>
      </form>

      <h2
        className="font-mono text-xs uppercase mb-3"
        style={{ color: 'var(--muted)' }}
      >
        Your tickets
      </h2>

      <div className="flex flex-col gap-2">
        {tickets.map((t) => (
          <div
            key={t.id}
            className="rounded-lg border p-3 text-sm"
            style={{ borderColor: 'var(--line)' }}
          >
            <strong>{t.subject}</strong> —{' '}
            <span style={{ color: 'var(--muted)' }}>
              {t.category} · {t.status}
            </span>
          </div>
        ))}

        {tickets.length === 0 && (
          <p
            className="text-sm"
            style={{ color: 'var(--muted)' }}
          >
            No tickets yet.
          </p>
        )}
      </div>

      <style jsx>{`
        .input {
          background: var(--panel-2);
          border: 1px solid var(--line);
          color: var(--paper);
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 14px;
          width: 100%;
        }
      `}</style>
    </div>
  );
}