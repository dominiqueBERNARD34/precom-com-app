mkdir -p app/api/email/test
cat > app/api/email/test/route.ts <<'TS'
import { NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'

export async function GET() {
  const to = process.env.MAIL_TEST_TO || process.env.MAIL_FROM
  if (!to) {
    return NextResponse.json(
      { error: 'Définis MAIL_TEST_TO ou MAIL_FROM dans Vercel.' },
      { status: 400 }
    )
  }

  try {
    const data = await sendMail({
      to,
      subject: 'Test Resend — precom-com',
      text: 'Email de test envoyé via Resend depuis /api/email/test.',
    })
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message }, { status: 500 })
  }
}
TS
