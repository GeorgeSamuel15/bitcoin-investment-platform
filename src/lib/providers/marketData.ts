import { MarketDataProvider, MarketPricePoint } from './types';

// Real provider: public market data. Fine for development; the README
// go-live checklist calls out that production should use a licensed
// market-data contract (Kaiko, CoinMarketCap Pro, etc.) with an SLA rather
// than an unauthenticated public endpoint.
class CoinGeckoMarketDataProvider implements MarketDataProvider {
  async getPrice(symbol: string): Promise<MarketPricePoint> {
    if (symbol !== 'BTC-USD') {
      throw new Error(`Unsupported symbol: ${symbol}`);
    }
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true',
      { next: { revalidate: 15 } }
    );
    if (!res.ok) throw new Error('Market data provider error');
    const json = await res.json();
    const btc = json.bitcoin;
    return {
      symbol,
      price: btc.usd,
      change24h: btc.usd_24h_change ?? 0,
      marketCap: btc.usd_market_cap,
      volume24h: btc.usd_24h_vol,
      source: 'coingecko',
      fetchedAt: new Date().toISOString(),
    };
  }
}

// Used only if the real provider is unreachable. Always labeled in the UI
// as unavailable/indicative — never presented as a live price.
class UnavailableMarketDataProvider implements MarketDataProvider {
  async getPrice(): Promise<MarketPricePoint> {
    throw new Error('Market data temporarily unavailable.');
  }
}

export function getMarketDataProvider(): MarketDataProvider {
  return new CoinGeckoMarketDataProvider();
}

export const fallbackProvider = new UnavailableMarketDataProvider();
