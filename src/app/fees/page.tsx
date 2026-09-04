import { getConfig } from '@/lib/platformConfig';

export const dynamic = 'force-dynamic';

export default async function FeesPage() {
  const [deposit, investment, management, withdrawal] = await Promise.all([
    getConfig<number>('fee_deposit_pct'),
    getConfig<number>('fee_investment_pct'),
    getConfig<number>('fee_management_pct_annual'),
    getConfig<number>('fee_withdrawal_flat_usd'),
  ]);
  const rows = [
    ['Deposit fee', `${deposit}%`],
    ['Investment fee', `${investment}%`],
    ['Management fee (annual)', `${management}%`],
    ['Withdrawal fee', `$${withdrawal}`],
    ['Network fee', 'Passed through at cost, shown before you confirm'],
  ];
  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <h1 className="font-display font-semibold text-3xl mb-6" style={{ fontFamily: 'Space Grotesk' }}>Fee schedule</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>Every applicable fee is shown before you confirm a transaction — never hidden.</p>
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} style={{ borderBottom: '1px solid var(--line)' }}>
              <td className="py-3">{label}</td>
              <td className="py-3 font-mono text-right">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
