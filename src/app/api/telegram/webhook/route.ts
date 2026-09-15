import { NextRequest, NextResponse } from 'next/server';

// Handles incoming updates from the Telegram Bot API. Verify the request
// came from Telegram (secret token header) before trusting it in production.
// This bot ONLY sends messages/links it does not and must not expose any
// endpoint that changes investment balances (spec section 17).
export async function POST(req: NextRequest) {
  const secretHeader = req.headers.get('x-telegram-bot-api-secret-token');
  if (process.env.NODE_ENV === 'production' && secretHeader !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid webhook secret.' }, { status: 401 });
  }

  const update = await req.json();
  const message = update.message;
  if (!message) return NextResponse.json({ ok: true });

  const text: string = message.text ?? '';
  const telegramId: string = String(message.from?.id ?? '');

  if (text === '/start') {
    // Real implementation: send a welcome message + link-account deep link.
    console.log(`[telegram] /start from ${telegramId}`);
  } else if (text === '/support') {
    console.log(`[telegram] ${telegramId} asked for support routing`);
  }

  return NextResponse.json({ ok: true });
}
