import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendMail({ to, subject, text, html }:{to:string;subject:string;text?:string;html?:string}) {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY manquant')
  await resend.emails.send({
    from: 'noreply@precom-com.com',
    to, subject,
    text, html: html ?? (text ? `<p>${text}</p>` : undefined)
  })
}
