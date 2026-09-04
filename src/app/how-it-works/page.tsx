import RiskBanner from '@/components/RiskBanner';

const steps = [
  {
    n: '01',
    title: 'Create an Account',
    body: 'Register securely with your email and a strong password. Two-factor authentication is available from your first login.',
  },
  {
    n: '02',
    title: 'Complete Verification',
    body: 'Complete the identity verification required by law before you can fund an account or invest — this protects you and the platform.',
  },
  {
    n: '03',
    title: 'Fund Account',
    body: 'Contribute using a supported payment method. Funds are only credited after your payment provider confirms the transaction.',
  },
  {
    n: '04',
    title: 'Invest in Bitcoin',
    body: 'The platform executes your investment through its configured provider and custody infrastructure once your order is confirmed.',
  },
  {
    n: '05',
    title: 'Track Portfolio',
    body: 'See your BTC holdings, current value, total contributions, and profit/loss, alongside a full transaction history.',
  },
  {
    n: '06',
    title: 'Withdraw',
    body: 'Request a withdrawal at any time, subject to the platform\u2019s security checks and withdrawal rules.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-12">
        <span className="text-xs font-mono uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
          The Process
        </span>
        <h1
          className="font-display font-semibold mt-3"
          style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(28px, 4vw, 40px)' }}
        >
          How it works
        </h1>
        <p className="mt-3 text-[15.5px]" style={{ color: 'var(--muted)' }}>
          Six steps, in the order they actually happen — from account creation to your first withdrawal.
        </p>
      </div>

      <div className="flex flex-col">
        {steps.map((s, i) => (
          <div
            key={s.n}
            className="flex gap-6 py-6"
            style={{
              borderTop: '1px solid var(--line)',
              borderBottom: i === steps.length - 1 ? '1px solid var(--line)' : undefined,
            }}
          >
            <div className="font-mono text-sm pt-0.5 min-w-[32px]" style={{ color: 'var(--orange)' }}>
              {s.n}
            </div>
            <div>
              <h3 className="font-display font-semibold text-[17px]" style={{ fontFamily: 'Space Grotesk' }}>
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm max-w-xl" style={{ color: 'var(--muted)' }}>
                {s.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <RiskBanner />
      </div>
    </div>
  );
}
