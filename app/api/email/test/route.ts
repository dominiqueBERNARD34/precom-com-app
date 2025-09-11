mkdir -p app/api/email/test
cat > app/api/email/test/route.ts <<'TS'
import { NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const to = searchParams.get('to') ?? process.env.MAIL_TEST_TO
  const subject = searchParams.get('subject') ?? 'Test precom-com ✅'

  if (!to) {
    return NextResponse.json({ error: 'Paramètre "to" manquant.' }, { status: 400 })
  }

  const result = await sendMail({
    to,
    subject,
    text: 'Email de test via Resend (texte).',
    html: '<p>Email de test <b>Resend</b> (HTML)</p>',
  })

  // garde‑fou si jamais le code était modifié
  if (!result || !('ok' in result)) {
    return NextResponse.json({ error: 'Unexpected mailer result.' }, { status: 500 })
  }

  if (result.ok === false) {
    // vraie erreur d’envoi
    return NextResponse.json(result, { status: 500 })
  }

  if ('skipped' in result) {
    // pas de clé RESEND_API_KEY en env → on n’échoue pas
    return NextResponse.json(result, { status: 200 })
  }

  // succès
  return NextResponse.json({ id: result.id }, { status: 200 })
}
TS

