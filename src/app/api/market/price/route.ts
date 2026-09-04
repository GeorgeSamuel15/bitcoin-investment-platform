import { NextResponse } from 'next/server';
import { getMarketDataProvider } from '@/lib/providers/marketData';

export async function GET() {
  try {
    const provider = getMarketDataProvider();
    const point = await provider.getPrice('BTC-USD');
    return NextResponse.json(point);
  } catch (err) {
    // Never fabricate a price. The frontend must show "Market data
    // temporarily unavailable" rather than stale or invented numbers.
    return NextResponse.json({ error: 'Market data temporarily unavailable.' }, { status: 502 });
  }
}
