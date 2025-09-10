export type PlanSlug = 'basic' | 'pro' | 'enterprise'

export function normalizePlan(input: string | { slug?: string } | null | undefined): PlanSlug {
  const raw = typeof input === 'string' ? input : (input?.slug ?? '')
  const s = raw.toLowerCase()
  if (s === 'pro' || s === 'professional') return 'pro'
  if (s === 'enterprise' || s === 'ent') return 'enterprise'
  return 'basic'
}

export function planBySlug(slug: string) {
  const s = normalizePlan(slug)
  return {
    slug: s,
    name: s === 'basic' ? 'Basic' : s === 'pro' ? 'Pro' : 'Enterprise',
  }
}

// Optionnel : export par défaut pratique
export default { normalizePlan, planBySlug }
