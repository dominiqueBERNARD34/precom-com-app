'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

type Plan = 'growth' | 'business'

export default function OnboardingPage() {
  const sp = useSearchParams()

  // Récupération + sécurisation de la valeur ?plan=
  const initialPlan: Plan = useMemo(() => {
    const p = (sp.get('plan') || '').toLowerCase()
    return p === 'business' ? 'business' : 'growth'
  }, [sp])

  const [plan, setPlan] = useState<Plan>(initialPlan)

  const wrap: React.CSSProperties = { maxWidth: 900, margin: '24px auto', padding: 16 }
  const radio: React.CSSProperties = { display: 'flex', gap: 12, margin: '12px 0' }

  return (
    <div style={wrap}>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>Onboarding</h1>
      <p style={{ color: '#64748b', marginTop: 0 }}>
        Plan pré‑sélectionné depuis l’URL : <b>{plan}</b>
      </p>

      <div style={radio}>
        <label>
          <input
            type="radio"
            name="plan"
            value="growth"
            checked={plan === 'growth'}
            onChange={() => setPlan('growth')}
          />
          &nbsp;Growth
        </label>
        <label>
          <input
            type="radio"
            name="plan"
            value="business"
            checked={plan === 'business'}
            onChange={() => setPlan('business')}
          />
          &nbsp;Business
        </label>
      </div>

      {/* Suite de ton flux : formulaire, récap, paiement, etc. */}
      <div style={{ marginTop: 16, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <p style={{ margin: 0 }}><b>Étape suivante :</b> ici tu peux afficher les options du plan choisi,
        pré‑remplir un formulaire ou envoyer vers un checkout.</p>
      </div>
    </div>
  )
}
