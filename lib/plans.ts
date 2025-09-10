// /lib/plans.ts
export type PlanSlug = 'free' | 'starter' | 'growth' | 'business' | 'pro';

export type Plan = {
  slug: PlanSlug;
  name: string;
  price: number; // € / mois (affichage)
  badge?: 'Populaire';
  limits: { projects: number; systemsPerProject: number; subsPerSystem: number };
  // Pour Stripe (facultatif côté UI, requis côté checkout pour les offres payantes)
  priceId?: string;
};

// Les IDs de prix Stripe (pas secrets). On lit les variables d'env une fois ici.
const PRICE_IDS = {
  FREE: process.env.STRIPE_PRICE_FREE,
  STARTER: process.env.STRIPE_PRICE_STARTER,
  GROWTH: process.env.STRIPE_PRICE_GROWTH,
  BUSINESS: process.env.STRIPE_PRICE_BUSINESS,
  PRO: process.env.STRIPE_PRICE_PRO,
} as const;

export const PLANS: Record<PlanSlug, Plan> = {
  free: {
    slug: 'free',
    name: 'Gratuit (essai)',
    price: 0,
    limits: { projects: 1, systemsPerProject: 1, subsPerSystem: 2 },
    // free: pas de checkout Stripe (laisse priceId vide/undefined)
  },
  starter: {
    slug: 'starter',
    name: 'Starter',
    price: 19.99,
    limits: { projects: 1, systemsPerProject: 5, subsPerSystem: 5 },
    priceId: PRICE_IDS.STARTER, // si tu veux payer Starter
  },
  growth: {
    slug: 'growth',
    name: 'Growth',
    price: 49.99,
    badge: 'Populaire',
    limits: { projects: 2, systemsPerProject: 10, subsPerSystem: 10 },
    priceId: PRICE_IDS.GROWTH,
  },
  business: {
    slug: 'business',
    name: 'Business',
    price: 199.99,
    limits: { projects: 3, systemsPerProject: 20, subsPerSystem: 15 },
    priceId: PRICE_IDS.BUSINESS,
  },
  pro: {
    slug: 'pro',
    name: 'Pro',
    price: 999.90,
    limits: { projects: 5, systemsPerProject: 25, subsPerSystem: 25 },
    priceId: PRICE_IDS.PRO,
  },
};

// Tableau prêt pour .map() dans /formules
export const allPlans: Plan[] = Object.values(PLANS);

// Normalise un texte d'URL en slug valide (fallback 'starter')
export function normalizePlan(input?: string | null): PlanSlug {
  const v = (input ?? '').toLowerCase();
  if (v === 'free' || v === 'starter' || v === 'growth' || v === 'business' || v === 'pro') {
    return v as PlanSlug;
  }
  return 'starter';
}

// Sélection robuste depuis un slug d’URL (fallback 'starter')
export function planBySlug(slug?: string | null): Plan {
  return PLANS[normalizePlan(slug)];
}
