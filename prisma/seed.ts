import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';
const prisma = new PrismaClient();

// Seeds the RBAC roles/permissions so the admin panel is usable immediately.
// Does NOT create any fake users, balances, or transactions.
async function main() {
  const permissions = [
    'users.view', 'users.freeze', 'kyc.review', 'transactions.view',
    'withdrawals.review', 'investments.execute', 'config.update',
  ];
  const permRecords = await Promise.all(
    permissions.map((key) => prisma.permission.upsert({ where: { key }, update: {}, create: { key } }))
  );

  const roles: Record<string, string[]> = {
    super_admin: permissions,
    compliance_admin: ['users.view', 'kyc.review', 'withdrawals.review', 'transactions.view'],
    finance_admin: ['transactions.view', 'investments.execute', 'withdrawals.review'],
    support_admin: ['users.view', 'transactions.view'],
    analyst: ['transactions.view'],
    auditor: ['transactions.view', 'users.view'],
  };

  for (const [name, keys] of Object.entries(roles)) {
    await prisma.role.upsert({
      where: { name },
      update: { permissions: { set: [], connect: keys.map((k) => ({ key: k })) } },
      create: { name, permissions: { connect: keys.map((k) => ({ key: k })) } },
    });
  }

  // Optionally create the first admin account — ONLY if you explicitly set
  // these env vars yourself. Nothing is fabricated by default; without them
  // this block is skipped entirely and no AdminUser row is created.
  const adminEmail = process.env.ADMIN_SEED_EMAIL;
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  const adminRoleName = process.env.ADMIN_SEED_ROLE || 'super_admin';

  if (adminEmail && adminPassword) {
    const role = await prisma.role.findUnique({ where: { name: adminRoleName } });
    if (!role) {
      console.warn(`ADMIN_SEED_ROLE "${adminRoleName}" not found — skipping admin creation.`);
    } else {
      const existing = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
      if (existing) {
        console.log(`Admin ${adminEmail} already exists — leaving it untouched.`);
      } else {
        await prisma.adminUser.create({
          data: { email: adminEmail, passwordHash: hashPassword(adminPassword), fullName: 'Admin', roleId: role.id },
        });
        console.log(`Created admin account for ${adminEmail} with role ${adminRoleName}.`);
      }
    }
  } else {
    console.log('ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD not set — no admin account created. Set them in .env to create one.');
  }

  console.log('Seeded roles and permissions. No fake investor users, balances, or transactions were created.');
}

main().finally(() => prisma.$disconnect());
