// lib/plans.ts
export type PlanKey = 'free' | 'starter' | 'growth' | 'business' | 'pro';

export const PLANS: Record<PlanKey, {
  label: string; priceId?: string; price: string;
  limits: { max_projects: number; max_systems: number; max_subsystems_per_system: number }
}> = {
  free:     { label: 'Gratuit (essai)', price: '0 € / mois',
              limits: { max_projects: 1,  max_systems: 1,  max_subsystems_per_system: 2 } },
  starter:  { label: 'Starter',   priceId: process.env.STRIPE_PRICE_STARTER!,  price: '19,99 € / mois',
              limits: { max_projects: 1,  max_systems: 5,  max_subsystems_per_system: 5 } },
  growth:   { label: 'Growth',    priceId: process.env.STRIPE_PRICE_GROWTH!,   price: '49,99 € / mois',
              limits: { max_projects: 2,  max_systems: 10, max_subsystems_per_system: 10 } },
  business: { label: 'Business',  priceId: process.env.STRIPE_PRICE_BUSINESS!, price: '199,99 € / mois',
              limits: { max_projects: 3,  max_systems: 20, max_subsystems_per_system: 15 } },
  pro:      { label: 'Pro',       priceId: process.env.STRIPE_PRICE_PRO!,      price: '999,90 € / mois',
              limits: { max_projects: 5,  max_systems: 25, max_subsystems_per_system: 25 } },
};
