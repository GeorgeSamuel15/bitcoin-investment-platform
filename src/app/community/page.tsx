export default function CommunityPage() {
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_GROUP_URL || '#';
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display font-semibold text-3xl mb-4" style={{ fontFamily: 'Space Grotesk' }}>Official Telegram community</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
        Announcements, market discussion, and support routing. Telegram is for community — not for sending money.
      </p>

      <a href={telegramUrl} className="inline-block font-semibold rounded-lg py-3 px-6 mb-10" style={{ background: 'var(--orange)', color: '#1B1000' }}>
        Join Official Telegram Community
      </a>

      <div className="rounded-xl border p-5 mb-8" style={{ borderColor: 'var(--orange-dim)', background: 'color-mix(in srgb, var(--orange) 6%, transparent)' }}>
        <p className="text-sm font-semibold mb-1">IMPORTANT</p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Official staff will never ask you to send Bitcoin to a personal wallet, ask for your password,
          your 2FA code, or your private keys. If anyone does, it is a scam — report it immediately.
        </p>
      </div>

      <h2 className="font-mono text-xs uppercase mb-3" style={{ color: 'var(--muted)' }}>Community sections</h2>
      <ul className="text-sm space-y-2" style={{ color: 'var(--muted)' }}>
        <li>📢 Announcements — official platform updates</li>
        <li>💬 Community — member discussions</li>
        <li>₿ Bitcoin Market — market discussion and education</li>
        <li>📰 News — Bitcoin/crypto news</li>
        <li>🛟 Support — customer support instructions</li>
        <li>🚨 Security Alerts — scam and impersonator warnings</li>
      </ul>
    </div>
  );
}
