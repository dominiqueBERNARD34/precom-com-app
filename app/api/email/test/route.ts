// app/api/email/test/route.ts
import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/mailer';

export const runtime = 'nodejs'; // Important pour l'SDK Resend

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const to = body.to || process.env.TEST_TO || 'contact@precom-com.com';

  try {
    const data = await sendMail({
      to,
      subject: 'Test Resend ✅',
      html: `<p>Bonjour,</p><p>Ceci est un test Resend depuis <b>precom-com</b>.</p>`,
    });
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'send error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ use: 'POST /api/email/test { "to": "you@example.com" }' });
}
