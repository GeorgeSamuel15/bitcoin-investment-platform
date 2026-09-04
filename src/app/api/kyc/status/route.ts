import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const kyc = await prisma.kycCase.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ status: kyc?.status ?? 'NOT_STARTED' });
}
