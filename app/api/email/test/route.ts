// app/api/email/test/route.ts
import { NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'

export const runtime = 'nodejs' // Resend nécessite Node (pas Edge)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const to = searchParams.get('to') || process.env.MAIL_TEST_TO

  if (!to) {
    return NextResponse.json(
      { ok: false, error: 'Provide ?to=… or define MAIL_TEST_TO env var' },
      { status: 400 },
    )
  }

  const result = await sendMail({
    to,
    subject: 'Test precom-com ✅',
    text: 'E-mail de test via Resend.',
    html: '<p><b>Bonjour</b>, ceci est un e‑mail de test via Resend.</p>',
  })

  // résultat toujours non null → on gère les codes correctement
  if (!result.ok) {
    // si manquait la clé, on a { skipped: true } → 200 pour ne pas casser le build
    const status = (result as any).skipped ? 200 : 500
    return NextResponse.json(result, { status })
  }

  return NextResponse.json({ ok: true, id: result.id, to })
}
