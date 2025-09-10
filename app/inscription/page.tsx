// /app/inscription/page.tsx  (SERVER)
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { planBySlug } from '@/lib/plans'

// Ton AuthDialog est un composant Client qui utilise window / searchParams.
// On le charge côté client uniquement pour éviter les erreurs de prerender.
const AuthDialog = dynamic(() => import('@/components/AuthDialog'), { ssr: false })

export const dynamic = 'force-dynamic' // évite la tentative de pré-rendu statique

export default function Page({ searchParams }: { searchParams: { plan?: string } }) {
  // 👉 C'EST ICI la ligne clé :
  const selected = planBySlug(searchParams.plan)

  return (
    <main style={{minHeight:'100vh', display:'grid', placeItems:'center', background:'#0b1220', color:'#e2e8f0', padding:16}}>
      <div style={{ width: 380, background:'#0f172a', border:'1px solid #1e293b', borderRadius:12, padding:20 }}>
        <h1 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>
          Inscription — {selected.name}
        </h1>
        <p style={{ marginTop:0, marginBottom:16, color:'#9aa4b2' }}>
          Plan sélectionné : <b>{selected.slug}</b>
        </p>

        <Suspense fallback={<p>Chargement…</p>}>
          {/* Ton form existant : email + mot de passe + Google, etc. */}
          <AuthDialog mode="signup" />
        </Suspense>
      </div>
    </main>
  )
}
