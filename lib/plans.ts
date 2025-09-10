// src/lib/plans.ts

export type PlanId = 'free' | 'starter' | 'growth' | 'business' | 'pro'

export type Plan = {
  id: PlanId
  name: string
  // Nom de la variable d'env qui contient le Price ID Stripe (côté serveur)
  priceEnv?: string
  highlight?: string
}

export const PLANS: Plan[] = [
  { id: 'free',      name: 'Free' },
  { id: 'starter',   name: 'Starter',   priceEnv: 'STRIPE_PRICE_STARTER' },
  { id: 'growth',    name: 'Growth',    priceEnv: 'STRIPE_PRICE_GROWTH' },
  { id: 'business',  name: 'Business',  priceEnv: 'STRIPE_PRICE_BUSINESS' },
  { id: 'pro',       name: 'Pro',       priceEnv: 'STRIPE_PRICE_PRO' },
]

// Pour être tolérant avec d’anciens imports :
export default PLANS
export const plans = PLANS
