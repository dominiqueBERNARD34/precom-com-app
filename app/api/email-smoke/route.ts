// src/app/api/email-smoke/route.ts
import { NextResponse } from 'next/server';
import { transporter } from '@/lib/mailer';

export const runtime = 'nodejs'; // crucial pour SMTP

export async function POST(req: Request) {
  try {
    const { to } = await req.json();
    if (!to) return NextResponse.json({ ok: false, error: 'Paramètre "to" manquant.' }, { status: 400 });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM!,
      to,
      subject: 'Test SMTP precom-com',
      text: 'Message de test SMTP (precom-com).',
    });

    return NextResponse.json({ ok: true, messageId: info.messageId });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
