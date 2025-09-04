// app/lib/mailer.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

type SendMailOptions = {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  from?: string
}

function htmlToText(html: string) {
  // petit fallback lisible si tu fournis seulement du HTML
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export async function sendMail(opts: SendMailOptions) {
  const from = opts.from ?? process.env.EMAIL_FROM ?? 'Precom <onboarding@resend.dev>'

  // text: toujours une string pour satisfaire les types de Resend
  const textBody =
    opts.text ??
    (opts.html ? htmlToText(opts.html) : '') // fallback si tu n'as fourni que du HTML

  const base = { from, to: opts.to, subject: opts.subject }

  const payload =
    opts.html
      ? { ...base, html: opts.html, text: textBody }
      : { ...base, text: textBody }

  const { data, error } = await resend.emails.send(payload as any)
  if (error) throw error
  return data
}
