// app/api/stripe/portal/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { stripe } from '@/lib/stripe';

export async function POST() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error:'Non authentifié' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).single();
  const portal = await stripe.billingPortal.sessions.create({
    customer: profile!.stripe_customer_id!,
    return_url: `${process.env.APP_URL}/dashboard`
  });
  return NextResponse.json({ url: portal.url });
}
