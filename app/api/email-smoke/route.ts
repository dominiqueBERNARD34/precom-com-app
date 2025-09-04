// app/api/email-smoke/route.ts
import { NextResponse } from 'next/server'
import { sendMail } from '@/app/lib/mailer'

// Resend marche bien en Node.js runtime ; on le force par sécurité
export const runtime = 'nodejs'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const to = url.searchParams.get('to')
  if (!to) return NextResponse.json({ error: 'Paramètre ?to= manquant' }, { status: 400 })

  await sendMail({ to, subject: 'Smoke test', text: 'Email OK ✅' })
  return NextResponse.json({ ok: true })
}

export async function POST(req: Request) {
  const { to, subject, text, html } = await req.json()
  if (!to) return NextResponse.json({ error: 'Champ to requis' }, { status: 400 })

  await sendMail({ to, subject: subject || 'Smoke test', text, html })
  return NextResponse.json({ ok: true })
}
