export default function Footer() {
  return (
    <footer className="px-6 py-9 border-t flex flex-wrap justify-between gap-4 text-sm" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
      <div className="flex items-center gap-2 font-display font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        <span
          className="w-5.5 h-5.5 w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-semibold"
          style={{ background: 'var(--orange)', color: '#0A0C0F' }}
        >
          ₿
        </span>
        Bitcoin Investment
      </div>
      <p className="max-w-xl">
        © 2026 Bitcoin Investment. Regulatory status: [CONFIGURE BEFORE PRODUCTION]. Bitcoin is
        volatile and speculative — you can lose some or all of what you contribute. Nothing on
        this site is financial advice. This platform is currently in SANDBOX MODE.
      </p>
    </footer>
  );
}
