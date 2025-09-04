// src/lib/plans.ts
export type PlanSlug = 'starter' | 'pro' | 'business'

export const PLANS = [
  { slug: 'starter',  name: 'Essai (Starter)', price: 0 },
  { slug: 'pro',      name: 'Pro',             price: 49 },
  { slug: 'business', name: 'Business',        price: 199 },
] as const

export const planBySlug: Record<PlanSlug, typeof PLANS[number]> =
  Object.fromEntries(PLANS.map(p => [p.slug, p])) as any

export function normalizePlan(input?: string | null): PlanSlug {
  const s = (input ?? '').toLowerCase().trim()
  if ((['starter','essai','trial','free'] as string[]).includes(s)) return 'starter'
  if ((['pro','professional'] as string[]).includes(s))             return 'pro'
  if ((['business','biz','entreprise'] as string[]).includes(s))    return 'business'
  return (['starter','pro','business'].includes(s) ? s : 'starter') as PlanSlug
}
