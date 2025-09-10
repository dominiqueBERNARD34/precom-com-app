// precom-com-app/app/api/stripe/checkout/route.ts
import Stripe from 'stripe'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Stripe nécessite Node.js (pas Edge runtime)
export const runtime = 'nodejs'

// Instancie Stripe avec ta clé secrète (env requise)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

type LineItemInput =
  | { priceId: string; quantity?: number } // le plus sûr (prix créés côté Stripe)
  | {
      // option "montant libre" (minor units = centimes)
      amount: number
      currency?: string // ex: 'eur'
      name: string
      description?: string
      image?: string
      quantity?: number
    }

type CheckoutBody = {
  mode?: 'payment' | 'subscription'    // défaut: 'payment'
  items: LineItemInput[]               // requis
  customerEmail?: string               // facultatif
  clientReferenceId?: string           // facultatif
  metadata?: Record<string, string>    // facultatif (max 50 clés)
  successPath?: string                 // défaut: '/checkout/success'
  cancelPath?: string                  // défaut: '/checkout/cancelled'
  locale?: string                      // ex: 'fr', 'auto'…
}

function getBaseUrl(req: NextRequest): string {
  // 1) priorité à une URL explicite définie en env
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  if (fromEnv) return fromEnv.replace(/\/$/, '')

  // 2) sinon on reconstruit depuis les en-têtes de la requête
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000'
  return `${proto}://${host}`.replace(/\/$/, '')
}

function badRequest(message: string, details?: any) {
  return NextResponse.json({ error: message, details }, { status: 400 })
}

export async function POST(req: NextRequest) {
  try {
    const baseUrl = getBaseUrl(req)
    const body = (await req.json()) as CheckoutBody

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return badRequest('Le corps de la requête doit contenir un tableau "items" non vide.')
    }

    // Construit les line_items pour Stripe
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    for (const raw of body.items) {
      // Chemin 1 : via priceId (recommandé)
      if ('priceId' in raw && raw.priceId) {
        line_items.push({
          price: raw.priceId,
          quantity: Math.max(1, raw.quantity ?? 1),
          adjustable_quantity: { enabled: true, minimum: 1 },
        })
        continue
      }

      // Chemin 2 : via amount + name (montant en "minor units" ex. 1500 = 15,00 €)
      if ('amount' in raw) {
        const amount = Number(raw.amount)
        if (!Number.isInteger(amount) || amount <= 0) {
          return badRequest('Chaque item "amount" doit être un entier positif (centimes).', { item: raw })
        }
        const currency = (raw.currency || 'eur').toLowerCase()
        if (!raw.name) {
          return badRequest('Chaque item avec "amount" doit avoir un "name".', { item: raw })
        }

        line_items.push({
          quantity: Math.max(1, raw.quantity ?? 1),
          price_data: {
            currency,
            unit_amount: amount,
            product_data: {
              name: raw.name,
              description: raw.description,
              images: raw.image ? [raw.image] : undefined,
            },
          },
          adjustable_quantity: { enabled: true, minimum: 1 },
        })
        continue
      }

      return badRequest('Chaque item doit contenir soit "priceId", soit "amount" + "name".', { item: raw })
    }

    // Défauts raisonnables
    const mode = body.mode ?? 'payment'
    const successPath = body.successPath || '/checkout/success'
    const cancelPath = body.cancelPath || '/checkout/cancelled'
    const success_url = `${baseUrl}${successPath}?session_id={CHECKOUT_SESSION_ID}`
    const cancel_url = `${baseUrl}${cancelPath}`

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items,
      success_url,
      cancel_url,
      // Options utiles
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      locale: body.locale || 'fr',
      customer_email: body.customerEmail,
      client_reference_id: body.clientReferenceId,
      metadata: body.metadata,
      // Exemples d’options supplémentaires (décommente si besoin)
      // shipping_address_collection: { allowed_countries: ['FR', 'BE', 'CH'] },
      // automatic_tax: { enabled: true },
    })

    return NextResponse.json({ id: session.id, url: session.url }, { status: 201 })
  } catch (err: any) {
    // Tu peux logger plus finement ici
    console.error('[stripe/checkout] error:', err)
    const message = err?.message || 'Erreur interne lors de la création de la session Checkout.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Répond proprement aux méthodes non supportées
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405, headers: { Allow: 'POST' } })
}
