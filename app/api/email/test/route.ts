// app/api/email/test/route.ts
import { NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'

export const runtime = 'nodejs' // exécution côté serveur

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const to = url.searchParams.get('to') || process.env.MAIL_TEST_TO
    const subject = url.searchParams.get('sub') || 'Test precom-com ✅'

    if (!to) {
      return NextResponse.json(
        { ok: false, error: 'Missing ?to= or MAIL_TEST_TO' },
        { status: 400 },
      )
    }

    const { id } = await sendMail({
      to,
      subject,
      text: 'Email de test via Resend (texte).',
      html: '<p>Email de test via <b>Resend</b> (HTML).</p>',
    })

    return NextResponse.json({ ok: true, id })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'send failed' },
      { status: 500 },
    )
  }
}
