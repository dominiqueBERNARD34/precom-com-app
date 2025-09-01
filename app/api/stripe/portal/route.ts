import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
  }

  // TODO: code du portal Stripe (quand on activera les paiements)
  return NextResponse.json({ ok: true }, { status: 200 });
}
