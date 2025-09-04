// app/lib/mailer.ts
import 'server-only'
import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
if (!apiKey) {
  // Alerte claire au runtime si oubli d'ENV
  throw new Error('RESEND_API_KEY manquante dans les variables Vercel')
}

const resend = new Resend(apiKey)

export async function sendMail(opts: {
  to: string
  subject: string
  text?: string
  html?: string
}) {
  const from = process.env.EMAIL_FROM || 'Precom <onboarding@resend.dev>'
  const { data, error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  })
  if (error) throw error
  return data
}
