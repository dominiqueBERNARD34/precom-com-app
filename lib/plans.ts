// /lib/plans.ts
export type PlanSlug = 'free' | 'starter' | 'growth' | 'business' | 'pro';

export type Plan = {
  slug: PlanSlug;
  name: string;
  price: number; // €/mois
  badge?: 'Populaire';
  limits: { projects: number; systemsPerProject: number; subsPerSystem: number };
};

export const PLANS: Record<PlanSlug, Plan> = {
  free: {
    slug: 'free',
    name: 'Gratuit (essai)',
    price: 0,
    limits: { projects: 1, systemsPerProject: 1, subsPerSystem: 2 },
  },
  starter: {
    slug: 'starter',
    name: 'Starter',
    price: 19.99,
    limits: { projects: 1, systemsPerProject: 5, subsPerSystem: 5 },
  },
  growth: {
    slug: 'growth',
    name: 'Growth',
    price: 49.99,
    badge: 'Populaire',
    limits: { projects: 2, systemsPerProject: 10, subsPerSystem: 10 },
  },
  business: {
    slug: 'business',
    name: 'Business',
    price: 199.99,
    limits: { projects: 3, systemsPerProject: 20, subsPerSystem: 15 },
  },
  pro: {
    slug: 'pro',
    name: 'Pro',
    price: 999.90,
    limits: { projects: 5, systemsPerProject: 25, subsPerSystem: 25 },
  },
};

// 👉 La fonction dont on parle :
export function planBySlug(slug?: string | null): Plan {
  const key = (slug ?? 'starter').toLowerCase() as PlanSlug;
  return PLANS[key] ?? PLANS.starter;
}
