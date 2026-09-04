import Link from 'next/link';
import AdminLogoutButton from '@/components/AdminLogoutButton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b" style={{ borderColor: 'var(--line)' }}>
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-4 text-sm">
            <Link href="/admin" className="underline">Overview</Link>
            <Link href="/admin/users" className="underline">Users</Link>
            <Link href="/admin/kyc" className="underline">KYC</Link>
            <Link href="/admin/transactions" className="underline">Transactions</Link>
            <Link href="/admin/withdrawals" className="underline">Withdrawals</Link>
          </div>
          <AdminLogoutButton />
        </div>
      </div>
      {children}
    </div>
  );
}
