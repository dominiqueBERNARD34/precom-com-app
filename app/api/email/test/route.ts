// app/api/email/test/route.ts
import { NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const to = searchParams.get('to') || process.env.MAIL_TEST_TO
    if (!to) {
      return NextResponse.json({ ok: false, error: 'missing "to"' }, { status: 400 })
    }

    await sendMail({
      to,
      subject: 'Test precom-com ✅',
      text: 'Salut ! Cet e-mail a été envoyé depuis /api/email/test.',
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 })
  }
}
