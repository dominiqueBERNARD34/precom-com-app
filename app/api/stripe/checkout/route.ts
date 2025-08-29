// app/api/stripe/checkout/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { PLANS } from '@/lib/plans';

export async function POST(request: Request) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { plan } = await request.json() as { plan: keyof typeof PLANS };
  const priceId = PLANS[plan]?.priceId;
  if (!priceId) return NextResponse.json({ error: 'Offre invalide' }, { status: 400 });

  // Récupérer / créer le customer Stripe (stocké dans profiles)
  const { data: profile } = await supabase.from('profiles').select('stripe_customer_id,email').eq('id', user.id).single();

  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email ?? profile?.email ?? undefined, metadata: { user_id: user.id }});
    customerId = customer.id;
    await supabase.from('profiles').update({ stripe_customer_id: customerId, email: user.email }).eq('id', user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.APP_URL}/welcome`,
    cancel_url: `${process.env.APP_URL}/billing?cancelled=1`,
    metadata: { user_id: user.id, plan },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
