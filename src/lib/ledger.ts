import { prisma } from './prisma';

// Double-entry ledger helper (spec section 16). Every financial event
// must post a BALANCED set of entries (sum of amounts == 0) across at
// least two accounts. No route handler should ever update a balance
// field directly — everything financial goes through here.
export async function postLedgerEntries(params: {
  refType: string;
  refId: string;
  currency: string;
  entries: { account: string; amount: number; memo?: string }[];
}) {
  const total = params.entries.reduce((sum, e) => sum + e.amount, 0);
  if (Math.abs(total) > 1e-8) {
    throw new Error(`Ledger entries for ${params.refType}:${params.refId} are not balanced (sum=${total})`);
  }

  return prisma.$transaction(async (tx) => {
    const results = [];
    for (const e of params.entries) {
      const account = await tx.ledgerAccount.upsert({
        where: { name: e.account },
        update: {},
        create: { name: e.account, currency: params.currency },
      });
      const entry = await tx.ledgerEntry.create({
        data: {
          accountId: account.id,
          amount: e.amount,
          currency: params.currency,
          refType: params.refType,
          refId: params.refId,
          memo: e.memo,
        },
      });
      results.push(entry);
    }
    return results;
  });
}

export async function getAccountBalance(accountName: string): Promise<number> {
  const account = await prisma.ledgerAccount.findUnique({ where: { name: accountName } });
  if (!account) return 0;
  const agg = await prisma.ledgerEntry.aggregate({
    where: { accountId: account.id },
    _sum: { amount: true },
  });
  return Number(agg._sum.amount ?? 0);
}
