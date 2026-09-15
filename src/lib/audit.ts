import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

export async function logAudit(params: {
  actorType: 'user' | 'admin' | 'system';
  actorId?: string;
  userId?: string;
  action: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorType: params.actorType,
      actorId: params.actorId,
      userId: params.userId,
      action: params.action,
      metadata: params.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}