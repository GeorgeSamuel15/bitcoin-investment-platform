export default function RiskBanner() {
  return (
    <div
      className="rounded-xl border p-5 flex gap-4 items-start"
      style={{ borderColor: 'var(--orange-dim)', background: 'color-mix(in srgb, var(--orange) 6%, transparent)' }}
    >
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center font-mono text-sm flex-shrink-0"
        style={{ border: '1px solid var(--orange-dim)', color: 'var(--orange)' }}
      >
        !
      </div>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>
        <strong style={{ color: 'var(--paper)' }}>Bitcoin is volatile and you can lose money.</strong>{' '}
        Past performance does not guarantee future results. Only contribute what you can afford to lose.
      </p>
    </div>
  );
}
