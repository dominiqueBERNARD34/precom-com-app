// /app/formules/page.tsx  (SERVER)
import Link from 'next/link';
import { allPlans } from '@/lib/plans';

export default function Page() {
  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontSize: 40, textAlign: 'center', marginBottom: 8 }}>
        Choisissez votre formule
      </h1>
      <p style={{ textAlign: 'center', color: '#9aa4b2', marginTop: 0 }}>
        Passez de l’essai gratuit à la version pro quand vous voulez.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(220px, 1fr))',
          gap: 12,
          marginTop: 24,
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
              position: 'relative',
              color: '#e2e8f0',
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

            <div style={{ color: '#cbd5e1', fontWeight: 600, marginBottom: 8 }}>
              {p.name}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <div style={{ fontSize: 34, fontWeight: 800 }}>
                {p.price.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div style={{ color: '#94a3b8' }}>€ / mois</div>
            </div>

            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '12px 0',
                color: '#9aa4b2',
                display: 'grid',
                gap: 6,
              }}
            >
              <li>✅ Projets : {p.limits.projects}</li>
              <li>✅ Systèmes / projet : {p.limits.systemsPerProject}</li>
              <li>✅ Sous-systèmes / système : {p.limits.subsPerSystem}</li>
            </ul>

            <Link
              href={`/inscription?plan=${p.slug}`}
              style={{
                display: 'block',
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

      <p style={{ textAlign: 'center', color: '#9aa4b2', marginTop: 18 }}>
        Paiement sécurisé • Annulation à tout moment • Assistance par e‑mail.
      </p>
    </div>
  );
}
