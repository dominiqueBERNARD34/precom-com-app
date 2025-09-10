// app/api/email/test/route.ts
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// Force Node runtime (SDK Resend côté Node)
export const runtime = 'nodejs'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.MAIL_FROM || 'Precom-com <noreply@precom-com.com>'
const DEFAULT_TO = process.env.MAIL_TEST_TO // facultatif

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const to = url.searchParams.get('to') || DEFAULT_TO
    if (!to) {
      return NextResponse.json(
        { ok: false, error: 'Paramètre "to" manquant (ou variable MAIL_TEST_TO non définie)' },
        { status: 400 }
      )
    }

    const { id } = await resend.emails.send({
      from: FROM,
      to,
      subject: 'Test precom-com ✅',
      html: `<p>Ça marche ✅ – environnement: ${process.env.VERCEL_ENV || 'local'}</p>`
    })

    return NextResponse.json({ ok: true, id })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const to = body.to || DEFAULT_TO
    if (!to) {
      return NextResponse.json(
        { ok: false, error: 'Champ "to" requis (ou définis MAIL_TEST_TO)' },
        { status: 400 }
      )
    }

    const { id } = await resend.emails.send({
      from: FROM,
      to,
      subject: body.subject || 'Test precom-com',
      html: body.html || '<p>Message de test.</p>',
      text: body.text
    })

    return NextResponse.json({ ok: true, id })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}
