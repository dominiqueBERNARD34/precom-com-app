// app/api/email-smoke/route.ts
import { NextResponse } from 'next/server'

// ⬇️ CHOISIS 1 des 2 imports selon l’emplacement de mailer.ts
import { sendMail } from '@/app/lib/mailer'   // si mailer.ts est dans app/lib
// import { sendMail } from '@/lib/mailer'    // si tu déplaces mailer.ts dans lib/

export const runtime = 'nodejs' // nodemailer nécessite le runtime Node, pas Edge

export async function POST(req: Request) {
  try {
    const { to, subject, text, html, from, replyTo } = await req.json()
    if (!to || !subject) {
      return NextResponse.json({ error: 'Champs requis: to, subject' }, { status: 400 })
    }
    const result = await sendMail({ to, subject, text, html, from, replyTo })
    return NextResponse.json({ ok: true, result })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 })
  }
}

// Petit GET pratique pour tester vite depuis le navigateur:
// /api/email-smoke?to=dest@exemple.com&subject=Smoke&text=Hello
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const to = searchParams.get('to')
  const subject = searchParams.get('subject') ?? 'precom-com smoke'
  const text = searchParams.get('text') ?? 'Smoke test OK.'
  if (!to) return NextResponse.json({ error: 'Paramètre ?to= requis' }, { status: 400 })

  try {
    const result = await sendMail({ to, subject, text })
    return NextResponse.json({ ok: true, result })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 })
  }
}
