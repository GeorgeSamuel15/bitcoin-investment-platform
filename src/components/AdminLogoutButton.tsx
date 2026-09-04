'use client';
import { useRouter } from 'next/navigation';

export default function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button onClick={logout} className="text-xs font-semibold underline" style={{ color: 'var(--muted)' }}>
      Logout
    </button>
  );
}
