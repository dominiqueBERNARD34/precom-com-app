// lib/plans.ts
export type PlanSlug = 'free' | 'starter' | 'growth' | 'business' | 'pro'

export type Plan = {
  slug: PlanSlug
  name: string
  price: number          // prix mensuel en EUR
  priceId?: string       // Stripe price id pour Checkout
}

// aide lecture env
const env = (k: string) => process.env[k] ?? ''

export const PLANS: Record<PlanSlug, Plan> = {
  free:     { slug:'free',     name:'Gratuit (essai)', price:0 },
  starter:  { slug:'starter',  name:'Starter',         price:19.99,  priceId: env('STRIPE_PRICE_STARTER') },
  growth:   { slug:'growth',   name:'Growth',          price:49.99,  priceId: env('STRIPE_PRICE_GROWTH') },
  business: { slug:'business', name:'Business',        price:199.99, priceId: env('STRIPE_PRICE_BUSINESS') },
  pro:      { slug:'pro',      name:'Pro',             price:999.90, priceId: env('STRIPE_PRICE_PRO') },
}

export function planBySlug(slug?: string | null) {
  const s = String(slug ?? '').toLowerCase() as PlanSlug
  return PLANS[s] ?? PLANS.starter
}

export function normalizePlan(slug?: string | null) {
  const p = planBySlug(slug)
  return { slug: p.slug, name: p.name, monthly: p.price, isPaid: p.price > 0, priceId: p.priceId }
}
