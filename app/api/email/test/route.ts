cat > app/api/email/test/route.ts <<'TS'
import { NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const to = url.searchParams.get('to') || process.env.MAIL_TEST_TO
  const from = process.env.EMAIL_FROM
  if (!to) {
    return NextResponse.json({ ok: false, error: 'Missing "to" param or MAIL_TEST_TO env' }, { status: 400 })
  }
  if (!from) {
    return NextResponse.json({ ok: false, error: 'EMAIL_FROM not set on server' }, { status: 500 })
  }
  try {
    const res = await sendMail({
      to,
      subject: 'Test Resend via precom-com ✅',
      text: 'Hello from precom-com',           // texte simple requis par les types Resend
      html: '<p>Hello from <b>precom-com</b></p>',
    })
    return NextResponse.json({ ok: true, provider: res })
  } catch (e: any) {
    // expose le vrai message retourné par Resend (pour ton 403)
    return NextResponse.json(
      { ok: false, message: e?.message, code: e?.code, data: e?.response?.data },
      { status: 500 }
    )
  }
}
TS
