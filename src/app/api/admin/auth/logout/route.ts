import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  cookies().delete('bi_admin_session');
  return NextResponse.json({ ok: true });
}
