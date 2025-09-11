// /app/api/email/test/route.ts
import { NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'

export const runtime = 'nodejs'

// GET = pratique pour tester dans le navigateur
export async function GET() {
  const to =
    process.env.MAIL_TEST_TO ||
    process.env.MAIL_FROM ||
    process.env.EMAIL_FROM

  if (!to) {
    return NextResponse.json(
      { ok: false, error: 'MAIL_TEST_TO (ou MAIL_FROM/EMAIL_FROM) manquant' },
      { status: 400 }
    )
  }

  const result = await sendMail({
    to,
    subject: 'Test precom-com ✅',
    text: 'Email de test via Resend — (GET)',
    html: '<p>Email de test via <b>Resend</b> — (GET)</p>',
  })

  if (result.ok) return NextResponse.json(result, { status: 200 })
  if (result.skipped) return NextResponse.json(result, { status: 200 })
  return NextResponse.json(result, { status: 500 })
}

// POST = permet de passer {to, subject, text, html} dans le body
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any))
  const to: string | string[] | undefined = body.to || process.env.MAIL_TEST_TO
  const subject: string = body.subject || 'Test precom-com ✅ (POST)'

  if (!to) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Destinataire manquant. Fournis { "to": "adresse@..." } ou configure MAIL_TEST_TO.',
      },
      { status: 400 }
    )
  }

  const result = await sendMail({
    to,
    subject,
    text: body.text || 'Email de test via Resend — (POST)',
    html: body.html,
  })

  if (result.ok) return NextResponse.json(result, { status: 200 })
  if (result.skipped) return NextResponse.json(result, { status: 200 })
  return NextResponse.json(result, { status: 500 })
}
