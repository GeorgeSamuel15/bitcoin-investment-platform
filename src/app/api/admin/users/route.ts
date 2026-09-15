import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  try {
    await requirePermission('users.view');
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : 'Permission denied';

    return NextResponse.json(
      { error: message },
      { status: 403 }
    );
  }

  const q = req.nextUrl.searchParams.get('q') ?? '';

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            {
              email: {
                contains: q,
                mode: 'insensitive',
              },
            },
            {
              fullName: {
                contains: q,
                mode: 'insensitive',
              },
            },
          ],
        }
      : undefined,

    include: {
      kycCase: true,
      portfolio: true,
    },

    take: 50,
  });

  return NextResponse.json(users);
}