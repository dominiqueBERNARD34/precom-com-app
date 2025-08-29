// app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { PLANS } from '@/lib/plans';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // suffisant pour update si RLS autorise service ? 
  // ⚠️ idéalement utilisez une SERVICE ROLE KEY (sécurité). Si vous l'avez, remplacez ici.
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get('stripe-signature')!;
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err:any) {
    return NextResponse.json({ error: `Webhook signature: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const s = event.data.object as any;
      const planKey = s.metadata?.plan as keyof typeof PLANS | undefined;
      const userId = s.metadata?.user_id as string | undefined;
      const subscriptionId = s.subscription as string | undefined;
      const customerId = s.customer as string | undefined;

      if (!planKey || !userId) break;
      const limits = PLANS[planKey].limits;

      // Maj profil : plan + quotas + stripe ids
      await supabase
        .from('profiles')
        .update({
          plan: planKey,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          max_projects: limits.max_projects,
          max_systems: limits.max_systems,
          max_subsystems_per_system: limits.max_subsystems_per_system
        })
        .eq('id', userId);
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as any;
      // vous pouvez remettre le plan à 'free' si annulé, etc.
      break;
    }
  }
  return NextResponse.json({ received: true });
}
