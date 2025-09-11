// app/api/email/test/route.ts
import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/mailer';

// Resend nécessite le runtime Node
export const runtime = 'nodejs';

/**
 * GET /api/email/test?to=adresse@example.com
 * (pratique depuis le navigateur)
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const to =
    url.searchParams.get('to') || process.env.MAIL_TEST_TO || '';

  if (!to) {
    return NextResponse.json(
      { ok: false, error: 'Paramètre "to" manquant' },
      { status: 400 }
    );
  }

  const result = await sendMail({
    to,
    subject: 'Test precom-com ✅',
    text: 'Email de test (GET) via Resend.',
    html: '<p>Email de test <strong>via Resend</strong> (GET).</p>',
  });

  return NextResponse.json(result, {
    status: result.ok || result.skipped ? 200 : 500,
  });
}

/**
 * POST /api/email/test
 * body: { "to": "adresse@example.com", "subject": "..." }
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const to = body?.to || process.env.MAIL_TEST_TO || '';
  const subject = body?.subject || 'Test precom-com ✅';

  if (!to) {
    return NextResponse.json(
      { ok: false, error: 'Champ "to" manquant' },
      { status: 400 }
    );
  }

  const result = await sendMail({
    to,
    subject,
    text: 'Email de test (POST) via Resend.',
    html: '<p>Email de test <strong>via Resend</strong> (POST).</p>',
  });

  return NextResponse.json(result, {
    status: result.ok || result.skipped ? 200 : 500,
  });
}
