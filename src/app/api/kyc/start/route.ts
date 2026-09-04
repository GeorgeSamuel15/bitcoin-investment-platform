import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { SandboxKycProvider } from '@/lib/providers/sandbox';
import { logAudit } from '@/lib/audit';

const kycProvider = new SandboxKycProvider();

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { providerRef } = await kycProvider.startVerification(user.id);
  await prisma.kycCase.update({
    where: { userId: user.id },
    data: { status: 'PENDING', provider: 'sandbox', providerRef },
  });
  await logAudit({ actorType: 'user', actorId: user.id, userId: user.id, action: 'kyc.started' });

  return NextResponse.json({ status: 'PENDING', providerRef });
}
