import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const currentToken = cookies().get('bi_session')?.value;
  const sessions = await prisma.session.findMany({
    where: { userId: user.id },
    include: { device: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(
    sessions.map((s) => ({
      id: s.id,
      current: s.id === currentToken,
      ipAddress: s.ipAddress,
      device: s.device?.label ?? s.device?.userAgent ?? 'Unknown device',
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
    }))
  );
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { sessionId } = await req.json();
  // Scope the delete to this user's own sessions — never let a client
  // supply an arbitrary session id belonging to someone else.
  await prisma.session.deleteMany({ where: { id: sessionId, userId: user.id } });

  return NextResponse.json({ ok: true });
}
