// precom-com-app/components/Pricing.tsx
import Link from 'next/link'
import { allPlans } from '@/lib/plans'

export default function Pricing() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12,
      }}
    >
      {allPlans.map((p) => (
        <div
          key={p.slug}
          style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: 12,
            padding: 16,
            color: '#e2e8f0',
            position: 'relative',
          }}
        >
          {p.badge && (
            <span
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                fontSize: 12,
                background: '#123b2a',
                color: '#34d399',
                border: '1px solid #2e7a5b',
                padding: '2px 8px',
                borderRadius: 999,
              }}
            >
              {p.badge}
            </span>
          )}

          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>{p.name}</h3>

          <p style={{ margin: 0, color: '#94a3b8' }}>
            {p.price === 0
              ? 'Gratuit'
              : `${p.price.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} € / mois`}
          </p>

          <ul style={{ marginTop: 12, paddingLeft: 18, lineHeight: 1.6 }}>
            <li>Projets : {p.limits.projects}</li>
            <li>Systèmes / projet : {p.limits.systemsPerProject}</li>
            <li>Sous-systèmes / système : {p.limits.subsPerSystem}</li>
          </ul>

          <Link
            href={`/inscription?plan=${p.slug}`}
            style={{
              display: 'block',
              marginTop: 12,
              textAlign: 'center',
              width: '100%',
              padding: '10px 12px',
              borderRadius: 10,
              background: '#1f2a44',
              border: '1px solid #263043',
              color: '#e2e8f0',
              textDecoration: 'none',
            }}
          >
            Choisir
          </Link>
        </div>
      ))}
    </div>
  )
}
