// /app/inscription/page.tsx  (SERVER)
import { Suspense } from 'react'
import NextDynamic from 'next/dynamic'   // <-- renommé
import { planBySlug } from '@/lib/plans'

// Charge le composant client sans SSR pour éviter les soucis de prerender
const AuthDialog = NextDynamic(() => import('@/components/AuthDialog'), { ssr: false })

// Laisse Next savoir que cette page est dynamique (pas de pré-rendu statique)
export const dynamic = 'force-dynamic'

export default function Page({ searchParams }: { searchParams: { plan?: string } }) {
  // 🔑 C'est la ligne dont on parlait : on lit ?plan=... et on récupère le vrai plan
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
          {/* Ton formulaire existant d’AuthDialog (client) */}
          <AuthDialog mode="signup" />
        </Suspense>
      </div>
    </main>
  )
}
