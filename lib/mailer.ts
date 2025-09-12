// lib/mailer.ts
import 'server-only'
import { Resend } from 'resend'

export type MailInput = {
  to: string
  subject: string
  text: string
  html?: string
}

const API_KEY = process.env.RESEND_API_KEY || ''
const FROM =
  process.env.MAIL_FROM ||
  process.env.EMAIL_FROM ||
  'Precom <onboarding@resend.dev>' // OK pour les tests

const resend = new Resend(API_KEY)

export async function sendMail(
  input: MailInput
): Promise<{ ok: true; id: string } | { ok: false; error: string; skipped?: boolean }> {
  if (!API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY missing', skipped: true }
  }

  // Resend exige toujours au moins "text" ou "html".
  const payload = {
    from: FROM,
    to: input.to,
    subject: input.subject,
    text: input.text,
    ...(input.html ? { html: input.html } : {}),
  } as const

  try {
    // Typage souple pour éviter les erreurs de versions de @types
    const { data, error } = (await resend.emails.send(payload as any)) as any
    if (error) {
      return { ok: false, error: String(error) }
    }
    return { ok: true, id: data!.id as string }
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Unknown error' }
  }
}
