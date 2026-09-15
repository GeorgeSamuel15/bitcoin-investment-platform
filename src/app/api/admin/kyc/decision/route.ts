import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';
import { logAudit } from '@/lib/audit';
import { notifyUser } from '@/lib/notify';

const schema = z.object({
  kycCaseId: z.string(),
  decision: z.enum(['APPROVED', 'REJECTED']),
});

export async function POST(req: NextRequest) {
  let admin;

  try {
    admin = await requirePermission('kyc.review');
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

  const kycCase = await prisma.kycCase.update({
    where: {
      id: parsed.data.kycCaseId,
    },
    data: {
      status: parsed.data.decision,
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
    include: {
      user: true,
    },
  });

  await notifyUser({
    userId: kycCase.userId,
    category: 'kyc',
    title: `Verification ${parsed.data.decision.toLowerCase()}`,
    body:
      parsed.data.decision === 'APPROVED'
        ? 'You can now fund your account and invest.'
        : 'Your verification was not approved. Contact support for details.',
    email: kycCase.user.email,
  });

  await logAudit({
    actorType: 'admin',
    actorId: admin.id,
    userId: kycCase.userId,
    action: `kyc.${parsed.data.decision.toLowerCase()}`,
  });

  return NextResponse.json(kycCase);
}