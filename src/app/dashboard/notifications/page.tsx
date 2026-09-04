'use client';
import { useEffect, useState } from 'react';

type Notification = { id: string; category: string; title: string; body: string; readAt: string | null; createdAt: string };

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);

  function load() {
    fetch('/api/notifications').then((r) => r.json()).then((d) => setItems(Array.isArray(d) ? d : []));
  }
  useEffect(load, []);

  async function markRead(id: string) {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <h1 className="font-display font-semibold text-2xl mb-6" style={{ fontFamily: 'Space Grotesk' }}>Notifications</h1>
      <div className="flex flex-col gap-2">
        {items.map((n) => (
          <div
            key={n.id}
            className="rounded-lg border p-4"
            style={{ borderColor: 'var(--line)', background: n.readAt ? 'transparent' : 'var(--panel)' }}
          >
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="font-semibold text-sm">{n.title}</div>
                <div className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{n.body}</div>
                <div className="text-xs font-mono mt-2" style={{ color: 'var(--muted)' }}>{n.category} · {new Date(n.createdAt).toLocaleString()}</div>
              </div>
              {!n.readAt && (
                <button onClick={() => markRead(n.id)} className="text-xs underline flex-shrink-0" style={{ color: 'var(--orange)' }}>
                  Mark read
                </button>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm" style={{ color: 'var(--muted)' }}>No notifications yet.</p>}
      </div>
    </div>
  );
}
