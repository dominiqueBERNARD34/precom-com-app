// app/inscription/page.tsx
import { Suspense } from 'react'
// ⬇️ on RENOMME l'import pour ne pas entrer en conflit avec l'export `dynamic`
import NextDynamic from 'next/dynamic'
import { planBySlug } from '@/lib/plans'

export const dynamic = 'force-dynamic' // autorisé car l'import s'appelle NextDynamic

const AuthDialog = NextDynamic(() => import('@/components/AuthDialog'), { ssr: false })

export default function Page({ searchParams }: { searchParams: { plan?: string } }) {
  const selected = planBySlug(searchParams.plan)
  …
}
