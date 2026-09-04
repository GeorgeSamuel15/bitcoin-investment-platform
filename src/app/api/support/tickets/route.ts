import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

const schema = z.object({
  category: z.enum(['account', 'kyc', 'deposit', 'investment', 'withdrawal', 'security', 'technical']),
  subject: z.string().min(3),
  body: z.string().min(5),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid ticket.' }, { status: 400 });

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: user.id,
      category: parsed.data.category,
      subject: parsed.data.subject,
      messages: { create: [{ authorType: 'user', body: parsed.data.body }] },
    },
  });
  return NextResponse.json(ticket);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
  const tickets = await prisma.supportTicket.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, include: { messages: true } });
  return NextResponse.json(tickets);
}
