import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';

const baseItems = [
  { href: '/', label: 'Home', icon: '⌂' },
  { href: '/dashboard', label: 'Portfolio', icon: '◔' },
  { href: '/invest', label: 'Invest', icon: '₿' },
  { href: '/dashboard/transactions', label: 'Activity', icon: '≣' },
];

// Fixed bottom nav for mobile, per spec section 35. Server component so
// the last tab reflects real auth state (Sign In vs Dashboard shortcut)
// instead of always pointing at /login.
export default async function MobileNav() {
  const user = await getCurrentUser();
  const items = [
    ...baseItems,
    user ? { href: '/dashboard', label: 'Account', icon: '◍' } : { href: '/login', label: 'Sign In', icon: '◍' },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around border-t z-40"
      style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}
    >
      {items.map((item, i) => (
        <Link key={item.href + i} href={item.href} className="flex flex-col items-center gap-1 py-2.5 px-3 text-[11px]" style={{ color: 'var(--muted)' }}>
          <span className="text-lg leading-none">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
