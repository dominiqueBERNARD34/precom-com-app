// Types
export type PlanSlug = 'starter' | 'pro' | 'business'; // adapte si tu as plus de slugs

type PlanDef = {
  slug: PlanSlug;
  name: string;
  price: number;
  priceId?: string; // optionnel pour l’offre gratuite
};

// Dictionnaire "slug -> plan"
export const PLANS = {
  starter:  { slug: 'starter',  name: 'Essai (Starter)', price: 0 },
  pro:      { slug: 'pro',      name: 'Pro',             price: 49,  priceId: process.env.STRIPE_PRICE_PRO },
  business: { slug: 'business', name: 'Business',        price: 199, priceId: process.env.STRIPE_PRICE_BUSINESS },
} as const satisfies Record<PlanSlug, PlanDef>;
