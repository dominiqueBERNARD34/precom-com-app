import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || '')
const FROM = process.env.RESEND_FROM || 'precom-com <onboarding@resend.dev>'

// GET /api/email/test?to=dest@exemple.com
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const to = searchParams.get('to') || process.env.RESEND_TEST_TO

  if (!to) {
    return NextResponse.json({ error: 'Missing "to" query param or RESEND_TEST_TO' }, { status: 400 })
  }

  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Test precom-com ✅',
    html: '<p>Mail de test OK.</p>',
  })

  if (error) {
    // `error` est typé (ResendError) : on renvoie le message clair
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Nouveau contrat Resend : l’identifiant est sous `data?.id`
  return NextResponse.json({ id: data?.id ?? null })
}
