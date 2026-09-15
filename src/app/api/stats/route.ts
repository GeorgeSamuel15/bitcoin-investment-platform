import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Platform stats shown on the homepage must come only from real database
// rows — see spec section 3. Before the database has any users/portfolios,
// this correctly returns zeros rather than inventing placeholder numbers.
export async function GET() {
  try {
    const [registeredUsers, portfolioAgg] = await Promise.all([
      prisma.user.count(),
      prisma.portfolio.aggregate({ _sum: { btcHoldings: true } }),
    ]);

    return NextResponse.json({
      registeredUsers,
      totalBtcHeld: portfolioAgg._sum.btcHoldings?.toString() ?? '0',
      source: 'database',
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    // Database not migrated/connected yet — be explicit, don't guess.
    return NextResponse.json(
      { registeredUsers: null, totalBtcHeld: null, source: 'unavailable', error: 'Database not connected.' },
      { status: 200 }
    );
  }
}
