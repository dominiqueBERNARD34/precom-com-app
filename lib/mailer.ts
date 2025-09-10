// lib/mailer.ts
import 'server-only';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');

export type MailInput = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  from?: string; // optionnel pour override ponctuel
};

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function sendMail(opts: MailInput) {
  // Sécurise le "from" (utilise la variable d'env ou la valeur fournie)
  const from =
    opts.from ||
    process.env.EMAIL_FROM ||
    'Precom <onboarding@resend.dev>';

  // Évite les crashs en build si la clé manque (ex: preview sans secrets)
  if (!process.env.RESEND_API_KEY) {
    console.warn('[sendMail] RESEND_API_KEY manquante – envoi ignoré.');
    return { skipped: true };
  }

  const text = opts.text || (opts.html ? stripHtml(opts.html).slice(0, 2000) : ' ');

  const { data, error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    text,
    ...(opts.html ? { html: opts.html } : {}),
    ...(opts.replyTo ? { reply_to: opts.replyTo } : {})
  });

  if (error) {
    console.error('[sendMail] Resend error:', error);
    throw error;
  }
  return data;
}
