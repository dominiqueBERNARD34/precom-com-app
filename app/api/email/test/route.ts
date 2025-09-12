// app/api/email/test/route.ts
import { NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'

export const runtime = 'nodejs' // ⚠️ important pour Resend (SDK Node)

export async function GET(req: Request) {
  const url = new URL(req.url)
  const to = url.searchParams.get('to') || process.env.MAIL_TEST_TO || ''
  const subject = url.searchParams.get('subject') || 'Test precom-com ✅'

  if (!to) {
    return NextResponse.json(
      { ok: false, error: 'Missing ?to=address' },
      { status: 400 }
    )
  }

  const result = await sendMail({
    to,
    subject,
    text: 'Email de test via Resend (texte).',
    html: '<p>Email de test via <b>Resend</b> (HTML).</p>',
  })

  const status = result.ok ? 200 : result.skipped ? 200 : 500
  return NextResponse.json(result, { status })
}
