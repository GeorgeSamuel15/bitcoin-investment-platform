// SANDBOX implementations. These simulate provider behavior so the whole
// platform is testable end-to-end with no real money, no real KYC checks,
// and no real blockchain activity. Every result they return is tagged
// sandbox: true (where applicable) and the UI must display that plainly.
//
// These are intentionally simplistic — swap in a real provider from
// src/lib/providers/ (implementing the same interfaces) before production,
// gated by the environment variables in .env.example.

import {
  KycProvider,
  KycStatus,
  PaymentProvider,
  PaymentIntent,
  CustodyProvider,
  CustodyExecutionResult,
  EmailProvider,
  SmsProvider,
  TelegramProvider,
} from './types';

export class SandboxKycProvider implements KycProvider {
  async startVerification(userId: string) {
    return { providerRef: `sandbox_kyc_${userId}`, redirectUrl: undefined };
  }
  async getStatus(_providerRef: string): Promise<KycStatus> {
    // Sandbox never auto-approves; a human (or a real provider webhook)
    // still has to move a case out of "pending" via the admin KYC workflow.
    return 'pending';
  }
}

export class SandboxPaymentProvider implements PaymentProvider {
  async createDepositIntent(params: { userId: string; amountUsd: number; method: string }): Promise<PaymentIntent> {
    return {
      id: `sandbox_pi_${Date.now()}`,
      status: 'pending',
      providerRef: `sandbox_${params.method}_${Date.now()}`,
    };
  }
  async getDepositStatus(_providerRef: string): Promise<PaymentIntent['status']> {
    // Deliberately stays "pending" — sandbox deposits are moved to
    // "completed" only through an explicit sandbox admin/testing action,
    // never automatically, so the flow mirrors a real webhook-driven system.
    return 'pending';
  }
}

export class SandboxCustodyProvider implements CustodyProvider {
  async executeBuy(params: { orderId: string; amountUsd: number }): Promise<CustodyExecutionResult> {
    throw new Error(
      'Sandbox mode: BTC purchases are not executed automatically. ' +
      'Use the sandbox admin tool to manually simulate execution of order ' + params.orderId + '.'
    );
  }
  async initiateWithdrawal(params: { withdrawalId: string; btcAmount: number; address: string; network: string }) {
    return { providerRef: `sandbox_wd_${params.withdrawalId}`, sandbox: true };
  }
}

export class SandboxEmailProvider implements EmailProvider {
  async send(params: { to: string; subject: string; body: string }) {
    console.log(`[sandbox email] to=${params.to} subject="${params.subject}"`);
  }
}

export class SandboxSmsProvider implements SmsProvider {
  async send(params: { to: string; body: string }) {
    console.log(`[sandbox sms] to=${params.to} body="${params.body}"`);
  }
}

export class SandboxTelegramProvider implements TelegramProvider {
  async notifyUser(telegramId: string, message: string) {
    console.log(`[sandbox telegram] to=${telegramId}: ${message}`);
  }
  async postAnnouncement(message: string) {
    console.log(`[sandbox telegram announcement]: ${message}`);
  }
}
