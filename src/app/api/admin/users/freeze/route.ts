import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';

const schema = z.object({
  userId: z.string(),
  reason: z.string().min(5),
});

export async function POST(req: NextRequest) {
  let admin;

  try {
    admin = await requirePermission('users.freeze');
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
      { error: 'Reason is required.' },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: {
      id: parsed.data.userId,
    },
    data: {
      status: 'FROZEN',
    },
  });

  await logAudit({
    actorType: 'admin',
    actorId: admin.id,
    userId: user.id,
    action: 'user.frozen',
    metadata: {
      reason: parsed.data.reason,
    },
  });

  return NextResponse.json({ ok: true });
}