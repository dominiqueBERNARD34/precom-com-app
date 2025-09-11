// lib/mailer.ts
import 'server-only';
import { Resend } from 'resend';

export type MailInput = {
  to: string;
  subject: string;
  text: string;      // toujours une string non vide
  html?: string;
  replyTo?: string;
};

export type MailResult = {
  ok: boolean;
  skipped: boolean;
  id: string | null;
  error?: string;
};

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM =
  process.env.EMAIL_FROM || 'Precom <onboarding@resend.dev>';

/**
 * Envoi d’email via Resend (Node runtime uniquement).
 * - Si RESEND_API_KEY est absente, on renvoie skipped=true (pour ne pas planter le build).
 */
export async function sendMail(input: MailInput): Promise<MailResult> {
  if (!RESEND_KEY) {
    return {
      ok: true,
      skipped: true,
      id: null,
      error: 'RESEND_API_KEY manquant — envoi ignoré',
    };
  }

  const resend = new Resend(RESEND_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: input.to,
      subject: input.subject,
      text: input.text || '',         // Resend exige "text" si pas de "react"
      ...(input.html ? { html: input.html } : {}),
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    });

    if (error) {
      return {
        ok: false,
        skipped: false,
        id: null,
        error: error.message || 'Erreur Resend',
      };
    }

    return {
      ok: true,
      skipped: false,
      id: data?.id ?? null,
    };
  } catch (e: any) {
    return {
      ok: false,
      skipped: false,
      id: null,
      error: e?.message ?? String(e),
    };
  }
}

