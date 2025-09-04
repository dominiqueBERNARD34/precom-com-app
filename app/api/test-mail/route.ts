// src/app/api/test-mail/route.ts
export const runtime = 'nodejs' // important: nodemailer ne fonctionne pas en Edge

import { NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'

export async function GET() {
  try {
    const info = await sendMail({
      to: process.env.SMTP_TO_TEST ?? process.env.SMTP_FROM!,
      subject: 'Test precom-com ✅',
      text: 'Hello depuis precom-com (route /api/test-mail).',
    })
    return NextResponse.json({ ok: true, messageId: info.messageId })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}
