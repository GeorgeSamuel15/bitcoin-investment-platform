import Link from 'next/link';

// Links to every investor-facing route that exists in this codebase.
const tabs = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/invest', label: 'Invest' },
  { href: '/dashboard/deposit', label: 'Deposit' },
  { href: '/withdraw', label: 'Withdraw' },
  { href: '/dashboard/transactions', label: 'Transactions' },
  { href: '/dashboard/profile', label: 'Profile' },
  { href: '/dashboard/security', label: 'Security' },
  { href: '/dashboard/notifications', label: 'Notifications' },
  { href: '/kyc', label: 'KYC' },
  { href: '/support', label: 'Support' },
  { href: '/community', label: 'Telegram' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b sticky top-[65px] z-30 backdrop-blur-xl" style={{ borderColor: 'var(--line)', background: 'color-mix(in srgb, var(--bg) 85%, transparent)' }}>
        <div className="max-w-4xl mx-auto px-6 flex gap-1 overflow-x-auto no-scrollbar py-2">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="text-sm px-3.5 py-1.5 rounded-full whitespace-nowrap"
              style={{ color: 'var(--muted)' }}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
