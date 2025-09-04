import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // évite toute tentative de pré-render

export async function POST(req: Request) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Ne casse pas le build: renvoie une 500 propre à l'exécution
    return NextResponse.json(
      { ok: false, error: 'RESEND_API_KEY manquante côté serveur' },
      { status: 500 }
    );
  }

  // Import dynamique pour éviter tout souci au bundle
  const { Resend } = await import('resend');
  const resend = new Resend(key);

  try {
    const body = await req.json().catch(() => ({} as any));
    const to = body?.to ?? 'you@example.com';

    const { data, error } = await resend.emails.send({
      from: 'Precom-Com <onboarding@resend.dev>',
      to,
      subject: 'Smoke test',
      html: '<p>OK ✅ – email envoyé par precom-com</p>',
    });

    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
