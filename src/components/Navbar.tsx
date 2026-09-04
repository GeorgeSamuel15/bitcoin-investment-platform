import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import LogoutButton from './LogoutButton';
import { getCurrentUser } from '@/lib/session';

const links = [
  { href: '/', label: 'Home' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/invest', label: 'Invest' },
  { href: '/fees', label: 'Fees' },
  { href: '/security/official-links', label: 'Security' },
];

// Server component: reads the session cookie directly so the nav reflects
// real auth state on first paint (no client-side flash of the wrong menu).
export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav
      className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-40 backdrop-blur-xl"
      style={{ borderColor: 'var(--line)', background: 'color-mix(in srgb, var(--bg) 85%, transparent)' }}
    >
      <Link href="/" className="flex items-center gap-2.5 font-display font-semibold text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-mono font-bold"
          style={{ background: 'linear-gradient(135deg, var(--orange), #ffb54d)', color: '#1B1000', boxShadow: 'var(--glow-orange)' }}
        >
          ₿
        </span>
        Bitcoin Investment
      </Link>

      <div className="hidden md:flex items-center gap-1 text-sm p-1 rounded-full" style={{ background: 'var(--panel)', border: '1px solid var(--line)' }}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="px-4 py-1.5 rounded-full transition-colors hover:text-[var(--paper)]" style={{ color: 'var(--muted)' }}>
            {l.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {user ? (
          <>
            <Link href="/dashboard" className="text-sm font-semibold px-4 py-2.5 rounded-full border" style={{ borderColor: 'var(--line)' }}>
              Dashboard
            </Link>
            <LogoutButton
              className="text-sm font-semibold px-4 py-2.5 rounded-full"
              style={{ background: 'linear-gradient(135deg, var(--orange), #ffb54d)', color: '#1B1000', boxShadow: 'var(--glow-orange)' }}
            />
          </>
        ) : (
          <>
            <Link href="/login" className="hidden sm:inline text-sm font-semibold px-4 py-2.5 rounded-full border" style={{ borderColor: 'var(--line)' }}>
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold px-4 py-2.5 rounded-full transition-transform hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, var(--orange), #ffb54d)', color: '#1B1000', boxShadow: 'var(--glow-orange)' }}
            >
              Create Account
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
