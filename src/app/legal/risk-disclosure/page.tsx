export default function Page() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="rounded-xl border p-4 mb-8 text-sm" style={{ borderColor: 'var(--orange-dim)', background: 'color-mix(in srgb, var(--orange) 6%, transparent)', color: 'var(--muted)' }}>
        This is placeholder text and requires review by a qualified lawyer before production use.
      </div>
      <h1 className="font-display font-semibold text-3xl mb-6" style={{ fontFamily: 'Space Grotesk' }}>Investment Risk Disclosure</h1>
      <div className="text-sm leading-relaxed space-y-4" style={{ color: 'var(--muted)' }}>
        <p><strong style={{ color: "var(--paper)" }}>Bitcoin is volatile and speculative.</strong> You can lose some or all of the money you contribute. Past performance does not guarantee future results.</p><p>[Placeholder] Additional disclosures: no guaranteed returns, custody risk, regulatory risk, liquidity risk, cybersecurity risk, and tax implications.</p>
      </div>
    </div>
  );
}
