import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

// Admin-editable settings (spec section 6/24): min investment, fees,
// strategy text. Falls back to sane defaults if never configured yet.
const DEFAULTS: Record<string, unknown> = {
  min_investment_usd: 0.02,
  max_investment_usd: 50000,
  fee_deposit_pct: 0,
  fee_investment_pct: 1.0,
  fee_management_pct_annual: 0,
  fee_withdrawal_flat_usd: 0,
  strategy_title: 'Bitcoin-focused investment',
  strategy_description:
    'Contributions are used to purchase Bitcoin through the platform\u2019s configured execution provider. ' +
    'Bitcoin is intended to be held long-term on your behalf via a qualified custody provider. ' +
    'Purchases are executed at prevailing market price at time of execution; no specific price is guaranteed. ' +
    'Withdrawals are processed according to the platform\u2019s withdrawal policy and security checks.',
  regulatory_status: '[CONFIGURE BEFORE PRODUCTION]',
};

export async function getConfig<T = unknown>(
  key: string
): Promise<T> {
  try {
    const row = await prisma.platformConfig.findUnique({
      where: { key },
    });

    if (row) {
      return row.value as T;
    }
  } catch {
    // DB not migrated yet
  }

  return DEFAULTS[key] as T;
}

export async function setConfig(
  key: string,
  value: unknown,
  updatedBy: string
) {
  const jsonValue = value as Prisma.InputJsonValue;

  return prisma.platformConfig.upsert({
    where: { key },

    update: {
      value: jsonValue,
      updatedBy,
    },

    create: {
      key,
      value: jsonValue,
      updatedBy,
    },
  });
}

export async function getAllDefaults() {
  return DEFAULTS;
}