import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/rbac';

export async function GET() {
  try { await requirePermission('withdrawals.review'); } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 403 }); }
  const withdrawals = await prisma.withdrawal.findMany({ where: { status: { in: ['REQUESTED', 'UNDER_REVIEW'] } }, include: { user: true }, orderBy: { createdAt: 'asc' } });
  return NextResponse.json(withdrawals);
}
