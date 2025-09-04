import { NextResponse } from 'next/server';
import { PLANS, type PlanSlug } from '@/lib/plans';

export async function POST(request: Request) {
  const { plan } = (await request.json()) as { plan: PlanSlug };

  const priceId = PLANS[plan]?.priceId;
  if (!priceId) {
    return NextResponse.json({ error: 'Offre invalide' }, { status: 400 });
  }

  // ... logique Stripe (création CheckoutSession etc.)
}
