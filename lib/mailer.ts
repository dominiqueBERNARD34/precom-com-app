cat > lib/mailer.ts <<'TS'
import 'server-only'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'Precom <onboarding@resend.dev>'

export type MailInput = {
  to: string
  subject: string
  text?: string
  html?: string
}

/**
 * Envoi d'email via Resend.
 * - RESEND_API_KEY et EMAIL_FROM doivent être posés dans les variables d'env Vercel
 * - text est toujours fourni (Resend TS l'exige) : si html est donné, on fabrique un "text" basique.
 */
export async function sendMail({ to, subject, text, html }: MailInput) {
  if (!process.env.RESEND_API_KEY) {
    // En local ou si la clé n'est pas posée : on ne bloque pas, on log et on "skip".
    console.warn('RESEND_API_KEY manquante — envoi sauté.')
    return { ok: true, skipped: true }
  }

  const res = await resend.emails.send({
    from: FROM,
    to,
    subject,
    text: text ?? (html ? stripHtml(html) : ' '),
    ...(html ? { html } : {}),
  })

  if (res.error) {
    throw new Error(res.error.message)
  }

  return res.data
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
TS
