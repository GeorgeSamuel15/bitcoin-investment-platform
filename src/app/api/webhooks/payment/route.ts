import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { postLedgerEntries } from '@/lib/ledger';
import { logAudit } from '@/lib/audit';
import crypto from 'crypto';

// Real payment providers sign their webhook payloads — verify that
// signature here before trusting anything in the body. This is a stub;
// wire in your actual provider's verification scheme before production.
function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.PAYMENT_PROVIDER_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-provider-signature');

  // In sandbox mode we accept unsigned test payloads so the flow is
  // exercisable locally; production must require a valid signature.
  const sandbox = process.env.NEXT_PUBLIC_SANDBOX_MODE !== 'false';
  if (!sandbox && !verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const { providerRef, status } = payload; // expected: { providerRef, status: 'completed' | 'failed' }

  const deposit = await prisma.deposit.findFirst({ where: { providerRef } });
  if (!deposit) return NextResponse.json({ error: 'Unknown deposit.' }, { status: 404 });

  if (status === 'completed' && deposit.status !== 'COMPLETED') {
    await prisma.$transaction(async (tx) => {
      await tx.deposit.update({ where: { id: deposit.id }, data: { status: 'COMPLETED' } });
      await tx.portfolio.update({
        where: { userId: deposit.userId },
        data: { availableUsd: { increment: deposit.amount } },
      });
    });
    await postLedgerEntries({
      refType: 'deposit',
      refId: deposit.id,
      currency: 'USD',
      entries: [
        { account: `user:${deposit.userId}:usd`, amount: Number(deposit.amount) },
        { account: 'platform:cash_in_transit', amount: -Number(deposit.amount) },
      ],
    });
    await logAudit({ actorType: 'system', action: 'deposit.completed', userId: deposit.userId, metadata: { depositId: deposit.id } });
  } else if (status === 'failed') {
    await prisma.deposit.update({ where: { id: deposit.id }, data: { status: 'FAILED' } });
  }

  return NextResponse.json({ ok: true });
}
