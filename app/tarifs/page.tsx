'use client'

import Link from 'next/link'

const TARGET = '/onboarding' // ⇦ change en '/checkout' ou '/signup' si tu veux

export default function TarifsPage() {
  const wrap: React.CSSProperties = { maxWidth: 1100, margin: '24px auto', padding: 16 }
  const grid: React.CSSProperties = { display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }
  const card: React.CSSProperties = { border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }
  const cta: React.CSSProperties = { display: 'inline-block', padding: '10px 14px', border: '1px solid #0f172a', borderRadius: 8, textDecoration: 'none' }

  return (
    <div style={wrap}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Tarifs</h1>
      <p style={{ color: '#64748b', marginTop: 0 }}>Choisis un plan, nous pré‑remplissons l’étape suivante via un paramètre d’URL.</p>

      <div style={grid}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Growth</h3>
          <p>Pour démarrer et croître.</p>
          <Link
            href={{ pathname: TARGET, query: { plan: 'growth' } }}
            style={cta}
          >
            Choisir Growth
          </Link>
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Business</h3>
          <p>Pour les équipes et projets avancés.</p>
          <Link
            href={{ pathname: TARGET, query: { plan: 'business' } }}
            style={cta}
          >
            Choisir Business
          </Link>
        </div>
      </div>
    </div>
  )
}
