// src/app/api/stripe/checkout/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: '2024-06-20', // optionnel : laisse vide si tu préfères prendre celle du dashboard
})

type Body = {
  // soit tu envoies directement un price (price_xxx), soit le nom de l'env (ex: 'STRIPE_PRICE_STARTER')
  price?: string
  priceEnv?: string
  mode?: 'payment' | 'setup' | 'subscription'
  quantity?: number
  successPath?: string
  cancelPath?: string
  locale?: string // on va le restreindre ci-dessous
}

const ALLOWED_LOCALES: Stripe.Checkout.SessionCreateParams.Locale[] = [
  'auto','bg','cs','da','de','el','en','es','et','fi','fr','hu','id','it','ja','lt','lv',
  'ms','mt','nb','nl','pl','pt','ro','ru','sk','sl','sv','th','tr','vi','zh','zh-HK','zh-TW'
]

export async function POST(req: Request) {
  try {
    const {
      price,
      priceEnv,
      mode = 'subscription',
      quantity = 1,
      successPath = '/pricing/success',
      cancelPath = '/pricing',
      locale: rawLocale = 'auto'
    } = (await req.json()) as Body

    // Récupère le Price ID Stripe de manière sûre (depuis une env serveur si besoin)
    const priceFromEnv = priceEnv
      ? process.env[priceEnv as keyof NodeJS.ProcessEnv]
      : undefined
    const stripePrice = price ?? priceFromEnv
    if (!stripePrice) {
      return NextResponse.json({ error: { message: 'Missing Stripe price' } }, { status: 400 })
    }

    // Restreint 'locale' aux valeurs permises (sinon 'auto')
    const locale = (ALLOWED_LOCALES.includes(rawLocale as any)
      ? (rawLocale as Stripe.Checkout.SessionCreateParams.Locale)
      : 'auto')

    // Restreint 'mode' au type attendu
    const safeMode: Stripe.Checkout.SessionCreateParams.Mode =
      (['payment', 'setup', 'subscription'] as const).includes(mode as any)
        ? (mode as Stripe.Checkout.SessionCreateParams.Mode)
        : 'subscription'

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.APP_URL ||
      'https://www.precom-com.com'

    const session = await stripe.checkout.sessions.create({
      mode: safeMode,
      line_items: [{ price: stripePrice, quantity }],
      success_url: `${baseUrl}${successPath}`,
      cancel_url: `${baseUrl}${cancelPath}`,
      locale, // désormais du bon type
      allow_promotion_codes: true,
    })

    return NextResponse.json({ id: session.id, url: session.url }, { status: 200 })
  } catch (err: any) {
    console.error('[stripe.checkout] error', err)
    return NextResponse.json({ error: { message: err?.message ?? 'Unknown error' } }, { status: 500 })
  }
}
