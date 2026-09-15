import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { SandboxCustodyProvider } from '@/lib/providers/sandbox';
import { SANDBOX_MODE } from '@/lib/config';

const schema = z.object({
  withdrawalId: z.string(),
  decision: z.enum(['APPROVED', 'REJECTED']),
});

const custody = new SandboxCustodyProvider();

export async function POST(req: NextRequest) {
  let admin;

  try {
    admin = await requirePermission('withdrawals.review');
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : 'Permission denied';

    return NextResponse.json(
      { error: message },
      { status: 403 }
    );
  }

  const parsed = schema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    );
  }

  const withdrawal = await prisma.withdrawal.findUnique({
    where: {
      id: parsed.data.withdrawalId,
    },
  });

  if (!withdrawal) {
    return NextResponse.json(
      { error: 'Not found.' },
      { status: 404 }
    );
  }

  if (parsed.data.decision === 'REJECTED') {
    await prisma.$transaction(async (tx) => {
      await tx.withdrawal.update({
        where: {
          id: withdrawal.id,
        },
        data: {
          status: 'REJECTED',
        },
      });

      // Refund the reserved BTC back to the user's holdings.
      await tx.portfolio.update({
        where: {
          userId: withdrawal.userId,
        },
        data: {
          btcHoldings: {
            increment: withdrawal.btcAmount,
          },
        },
      });
    });

    await logAudit({
      actorType: 'admin',
      actorId: admin.id,
      userId: withdrawal.userId,
      action: 'withdrawal.rejected',
    });

    return NextResponse.json({
      status: 'REJECTED',
    });
  }

  // Approved: in sandbox mode this simulates broadcast.
  // A real custody provider integration would return an actual
  // blockchain hash, which is the only thing written to blockchainHash.

  await prisma.withdrawal.update({
    where: {
      id: withdrawal.id,
    },
    data: {
      status: 'APPROVED',
    },
  });

  const result = await custody.initiateWithdrawal({
    withdrawalId: withdrawal.id,
    btcAmount: Number(withdrawal.btcAmount),
    address: withdrawal.destinationAddr,
    network: withdrawal.network,
  });

  await prisma.withdrawal.update({
    where: {
      id: withdrawal.id,
    },
    data: {
      status: SANDBOX_MODE ? 'PROCESSING' : 'BROADCAST',
      blockchainHash: SANDBOX_MODE ? null : undefined,
    },
  });

  await logAudit({
    actorType: 'admin',
    actorId: admin.id,
    userId: withdrawal.userId,
    action: 'withdrawal.approved',
    metadata: {
      providerRef: result.providerRef,
    },
  });

  return NextResponse.json({
    status: 'PROCESSING',
    sandbox: SANDBOX_MODE,
  });
}