// lib/mailer.ts
import 'server-only'
import { Resend } from 'resend'

export type MailInput = {
  to: string | string[]
  subject: string
  text: string
  html?: string
}

const RESEND_API_KEY = process.env.RESEND_API_KEY
// Utilise *ton* domaine vérifié chez Resend :
const FROM = process.env.EMAIL_FROM || 'Precom <contact@precom-com.com>'

export async function sendMail(input: MailInput) {
  // Pas de clé = on ne plante pas, mais on le signale
  if (!RESEND_API_KEY) {
    return { ok: false as const, skipped: true as const, reason: 'Missing RESEND_API_KEY' }
  }

  const resend = new Resend(RESEND_API_KEY)

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: input.to,
      subject: input.subject,
      text: input.text,                 // ← toujours présent (exigé par les types)
      ...(input.html ? { html: input.html } : {}),
    })

    if (error) {
      console.error('[mailer] Resend error:', error)
      return { ok: false as const, error: String(error) }
    }

    return { ok: true as const, id: data?.id ?? null }
  } catch (e: any) {
    console.error('[mailer] exception:', e)
    return { ok: false as const, error: e?.message ?? 'unknown' }
  }
}
