import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';

export async function GET() {
  try {
    await requirePermission('withdrawals.review');
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : 'Permission denied';

    return NextResponse.json(
      { error: message },
      { status: 403 }
    );
  }

  const withdrawals = await prisma.withdrawal.findMany({
    where: {
      status: {
        in: ['REQUESTED', 'UNDER_REVIEW'],
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return NextResponse.json(withdrawals);
}