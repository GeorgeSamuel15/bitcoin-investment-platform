// Every external integration (market data, KYC, payments, custody, email,
// SMS, Telegram) is defined as an interface here. Route handlers and
// services depend only on these interfaces, never on a specific vendor's
// SDK directly — so swapping providers later doesn't require touching
// application logic, and each provider has a SANDBOX_MODE implementation
// so the whole platform is testable without any real integration.

export interface MarketPricePoint {
  symbol: string; // e.g. "BTC-USD"
  price: number;
  change24h: number;
  marketCap?: number;
  volume24h?: number;
  source: string;
  fetchedAt: string;
}

export interface MarketDataProvider {
  getPrice(symbol: string): Promise<MarketPricePoint>;
}

export type KycStatus = 'not_started' | 'pending' | 'approved' | 'rejected' | 'requires_review';

export interface KycProvider {
  startVerification(userId: string): Promise<{ providerRef: string; redirectUrl?: string }>;
  getStatus(providerRef: string): Promise<KycStatus>;
}

export interface PaymentIntent {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  providerRef: string;
}

export interface PaymentProvider {
  createDepositIntent(params: { userId: string; amountUsd: number; method: string }): Promise<PaymentIntent>;
  getDepositStatus(providerRef: string): Promise<PaymentIntent['status']>;
}

export interface CustodyExecutionResult {
  btcAmount: number;
  executionPriceUsd: number;
  providerRef: string;
  sandbox: boolean;
}

export interface CustodyProvider {
  executeBuy(params: { orderId: string; amountUsd: number }): Promise<CustodyExecutionResult>;
  initiateWithdrawal(params: { withdrawalId: string; btcAmount: number; address: string; network: string }): Promise<{ providerRef: string; sandbox: boolean }>;
}

export interface EmailProvider {
  send(params: { to: string; subject: string; body: string }): Promise<void>;
}

export interface SmsProvider {
  send(params: { to: string; body: string }): Promise<void>;
}

export interface TelegramProvider {
  notifyUser(telegramId: string, message: string): Promise<void>;
  postAnnouncement(message: string): Promise<void>;
}
