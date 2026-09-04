'use client';

export default function SandboxBadge() {
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE !== 'false';
  if (!sandbox) return null;
  return (
    <div className="w-full bg-orange text-center text-xs font-mono font-semibold tracking-wide py-1.5"
         style={{ color: '#1B1000' }}>
      SANDBOX MODE — no real money, no real Bitcoin purchases, no real withdrawals
    </div>
  );
}
