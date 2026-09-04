export default function Page() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="rounded-xl border p-4 mb-8 text-sm" style={{ borderColor: 'var(--orange-dim)', background: 'color-mix(in srgb, var(--orange) 6%, transparent)', color: 'var(--muted)' }}>
        This is placeholder text and requires review by a qualified lawyer before production use.
      </div>
      <h1 className="font-display font-semibold text-3xl mb-6" style={{ fontFamily: 'Space Grotesk' }}>Privacy Policy</h1>
      <div className="text-sm leading-relaxed space-y-4" style={{ color: 'var(--muted)' }}>
        <p>[Placeholder] Describes what personal data is collected (identity, KYC documents, transaction data, device data), how it is used, who it is shared with (KYC/payment/custody providers), retention periods, and user rights (access, deletion, portability).</p>
      </div>
    </div>
  );
}
