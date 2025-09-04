// app/lib/mailer.ts  (OK) 
// -- ou --
// lib/mailer.ts      (si tu préfères la convention "lib" à la racine)

import 'server-only'
import nodemailer from 'nodemailer'

export type MailInput = {
  to: string
  subject: string
  text?: string
  html?: string
  from?: string
  replyTo?: string
}

export async function sendMail(msg: MailInput) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
  } = process.env

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Variables SMTP manquantes (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS).')
  }
  const from = msg.from || SMTP_FROM
  if (!from) throw new Error('Adresse expéditeur manquante (from ou SMTP_FROM).')

  const port = Number(SMTP_PORT)
  const secure = port === 465 // 465 = SSL/TLS direct ; 587 = STARTTLS

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })

  // Vérif facultative (utile en phase “smoke”)
  await transporter.verify().catch(() => {})

  const info = await transporter.sendMail({
    from,
    to: msg.to,
    subject: msg.subject,
    text: msg.text,
    html: msg.html,
    replyTo: msg.replyTo,
  })

  return {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
  }
}
