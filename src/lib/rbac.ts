import { prisma } from './prisma';
import { cookies } from 'next/headers';

const ADMIN_COOKIE = 'bi_admin_session';

// Minimal admin session + permission check. Every sensitive admin action
// must call requirePermission() before mutating anything, and every call
// site is responsible for writing an AuditLog entry (see lib/audit.ts).
export async function getCurrentAdmin() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  // In this scaffold the admin session token IS the admin user id for
  // simplicity — replace with a real signed session before production.
  const admin = await prisma.adminUser.findUnique({ where: { id: token }, include: { role: { include: { permissions: true } } } });
  return admin && admin.active ? admin : null;
}

export async function requirePermission(permissionKey: string) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error('Not authenticated as admin.');
  const has = admin.role.permissions.some((p) => p.key === permissionKey);
  if (!has) throw new Error(`Admin lacks permission: ${permissionKey}`);
  return admin;
}
