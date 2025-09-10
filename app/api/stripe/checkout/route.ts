// /app/api/stripe/checkout/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { planBySlug, type PlanSlug } from '@/lib/plans';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  // Lecture du plan depuis le body JSON { plan: 'growth' | ... }
  const { plan: planSlug } = (await request.json()) as { plan?: PlanSlug };

  const plan = planBySlug(planSlug);
  // On refuse le checkout si pas d'ID prix (ex: 'free')
  if (!plan.priceId) {
    return NextResponse.json(
      { error: 'Offre invalide ou gratuite' },
      { status: 400 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL ||
    'http://localhost:3000';

  const success_url = `${baseUrl}/onboarding?plan=${plan.slug}&session_id={CHECKOUT_SESSION_ID}`;
  const cancel_url = `${baseUrl}/formules?canceled=1&plan=${plan.slug}`;

  // Session de paiement Stripe (subscription par défaut ici)
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription', // mets 'payment' si tu veux du one‑shot
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    success_url,
    cancel_url,
    // locale: 'fr', // optionnel — décommente si souhaité
    // allow_promotion_codes: true, // optionnel
  });

  return NextResponse.json({ id: session.id, url: session.url });
}
