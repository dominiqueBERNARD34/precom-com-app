// app/lib/mailer.ts
import { Resend } from 'resend'
import type { CreateEmailOptions } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

type MailInput = {
  to: string | string[]
  subject: string
  html?: string
  text?: string
}

/** Transforme du HTML en texte brut simple (fallback correct pour Resend) */
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export async function sendMail(opts: MailInput) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY manquant (variable d’environnement).')
  }

  const from = process.env.EMAIL_FROM || 'Precom <onboarding@resend.dev>'

  // **Point clé** : text doit être une string (jamais undefined)
  const safeText: string =
    typeof opts.text === 'string'
      ? opts.text
      : (opts.html ? htmlToText(opts.html) : 'Message automatique Precom')

  const payload: CreateEmailOptions = {
    from,
    to: opts.to,
    subject: opts.subject,
    text: safeText,
    // html peut rester optionnel — on l’ajoute seulement s’il est fourni
    ...(opts.html ? { html: opts.html } : {})
  }

  const { data, error } = await resend.emails.send(payload)
  if (error) throw error
  return data
}
