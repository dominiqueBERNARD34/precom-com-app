// app/api/stripe/checkout/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { planBySlug } from '@/lib/plans'

export const runtime = 'nodejs'

/** Supporte:
 *  - POST JSON  { plan: "starter" }
 *  - POST form  (depuis <form> de la page pricing)
 */
export async function POST(req: Request) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.APP_URL ||
      'http://localhost:3000'

    // Accepte JSON ou form-encoded
    let planSlug: string | null = null
    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const body = (await req.json()) as { plan?: string }
      planSlug = body.plan ?? null
    } else {
      const form = await req.formData()
      planSlug = (form.get('plan') as string) ?? null
    }

    const plan = planBySlug(planSlug)
    if (!plan.priceId) {
      return NextResponse.json({ error: 'Offre invalide ou gratuite' }, { status: 400 })
    }

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${baseUrl}/billing/success?plan=${plan.slug}`,
      cancel_url: `${baseUrl}/billing/cancel?plan=${plan.slug}`,
      // tu peux ajouter customer_email si tu veux pré-remplir l’email
    }

    const session = await stripe.checkout.sessions.create(params)
    // En mode <form>, laisse Stripe faire la redirection via 303 + Location
    if (contentType.includes('application/x-www-form-urlencoded')) {
      return NextResponse.redirect(session.url!, { status: 303 })
    }
    // En mode fetch JSON, renvoie l’URL
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('checkout error', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
