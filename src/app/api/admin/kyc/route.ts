import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';

export async function GET() {
  try {
    await requirePermission('kyc.review');
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : 'Permission denied';

    return NextResponse.json(
      { error: message },
      { status: 403 }
    );
  }

  const cases = await prisma.kycCase.findMany({
    where: {
      status: {
        in: ['PENDING', 'REQUIRES_REVIEW'],
      },
    },
    include: {
      user: true,
    },
  });

  return NextResponse.json(cases);
}