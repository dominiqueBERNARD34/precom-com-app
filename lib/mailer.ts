// lib/mailer.ts
import 'server-only'
import nodemailer, { type Transporter } from 'nodemailer'

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!
      }
    })
  }
  return transporter
}

export type MailInput = {
  to: string
  subject: string
  text?: string
  html?: string
  from?: string
}

export async function sendMail({ to, subject, text, html, from }: MailInput) {
  const info = await getTransporter().sendMail({
    from: from ?? process.env.MAIL_FROM!,
    to,
    subject,
    text,
    html
  })
  return info.messageId
}
