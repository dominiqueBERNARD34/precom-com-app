import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = headers().get('stripe-signature');

  // Tant que Stripe n’est pas branché, on no-op proprement
  if (!process.env.STRIPE_SECRET_KEY || !whSecret || !sig) {
    return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
  }

  const rawBody = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
    // TODO: gérer vos events ici (customer.subscription.updated, etc.)
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
}
