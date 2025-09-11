// app/inscription/page.tsx  (SERVER)
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { planBySlug } from '@/lib/plans'

// Charger le composant client sans SSR pour éviter les soucis au build
const AuthDialog = dynamic(() => import('@/components/AuthDialog'), { ssr: false })

// Indique à Next que la page est dynamique (pas de pré-rendu)
export const dynamic = 'force-dynamic'

export default function Page({ searchParams }: { searchParams: { plan?: string } }) {
  // 🔑 lit ?plan=... et sélectionne un plan valide (fallback starter)
  const selected = planBySlug(searchParams.plan)

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0b1220',
        color: '#e2e8f0',
        padding: 16,
      }}
    >
      <div
        style={{
          width: 380,
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: 12,
          padding: 20,
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          Inscription — {selected.name}
        </h1>
        <p style={{ marginTop: 0, marginBottom: 16, color: '#9aa4b2' }}>
          Plan sélectionné : <b>{selected.slug}</b>
        </p>

        <Suspense fallback={<p>Chargement…</p>}>
          <AuthDialog mode="signup" />
        </Suspense>
      </div>
    </main>
  )
}
