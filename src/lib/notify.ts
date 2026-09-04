import { prisma } from './prisma';
import { SandboxEmailProvider, SandboxTelegramProvider } from './providers/sandbox';

const emailProvider = new SandboxEmailProvider();
const telegramProvider = new SandboxTelegramProvider();

// Fans a single notification out to in-app + email (+ Telegram if linked).
// Always writes the in-app row first so the notification center is the
// source of truth even if an outbound channel fails.
export async function notifyUser(params: {
  userId: string;
  category: string;
  title: string;
  body: string;
  email?: string;
  telegramId?: string;
}) {
  await prisma.notification.create({
    data: { userId: params.userId, channel: 'in_app', category: params.category, title: params.title, body: params.body },
  });

  if (params.email) {
    await emailProvider.send({ to: params.email, subject: params.title, body: params.body }).catch(() => {});
  }
  if (params.telegramId) {
    await telegramProvider.notifyUser(params.telegramId, `${params.title}: ${params.body}`).catch(() => {});
  }
}
