'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh(); // re-runs the server-component Navbar so it reflects logged-out state
  }

  return (
    <button onClick={logout} className={className} style={style}>
      Logout
    </button>
  );
}
