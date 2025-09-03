'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type Billing = 'monthly' | 'annual'
type PlanKey = 'free'|'starter'|'growth'|'business'|'pro'
type Plan = {
  key: PlanKey
  title: string
  baseMonthly: number // prix mensuel affiché en mode Mensuel
  badge?: string
  limits: { projects: number; systemsPerProject: number; subsPerSystem: number }
}

const PLANS: Plan[] = [
  { key:'free',     title:'Gratuit (essai)', baseMonthly: 0,      limits:{ projects:1, systemsPerProject:1,  subsPerSystem:2  }},
  { key:'starter',  title:'Starter',         baseMonthly: 19.99,  limits:{ projects:1, systemsPerProject:5,  subsPerSystem:5  }},
  { key:'growth',   title:'Growth',          baseMonthly: 49.99,  badge:'Populaire', limits:{ projects:2, systemsPerProject:10, subsPerSystem:10 }},
  { key:'business', title:'Business',        baseMonthly:199.99,  limits:{ projects:3, systemsPerProject:20, subsPerSystem:15 }},
  { key:'pro',      title:'Pro',             baseMonthly:999.90,  limits:{ projects:5, systemsPerProject:25, subsPerSystem:25 }},
]

// ~20% de remise en annuel
const DISCOUNT_FACTOR = 0.80

export default function PricingPage() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const [billing, setBilling] = useState<Billing>('monthly')

  // Lire l’éventuel ?billing= depuis l’URL au premier rendu
  useEffect(() => {
    const b = sp.get('billing')
    if (b === 'annual' || b === 'monthly') setBilling(b)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Quand on change Mensuel/Annuel, refléter dans l’URL (remplace l’historique)
  const setBillingAndSync = (b: Billing) => {
    setBilling(b)
    const next = new URLSearchParams(sp.toString())
    next.set('billing', b)
    router.replace(`${pathname}?${next.toString()}`)
  }

  const formatEUR = (n: number) =>
    new Intl.NumberFormat('fr-FR', { minimumFractionDigits:2, maximumFractionDigits:2 }).format(n)

  const priceOf = (p: Plan) => billing === 'annual' ? p.baseMonthly * DISCOUNT_FACTOR : p.baseMonthly
  const annualTotal = (p: Plan) => p.baseMonthly * 12 * DISCOUNT_FACTOR
  const annualSaving = (p: Plan) => Math.max(0, p.baseMonthly * 12 - annualTotal(p))

  const hint = useMemo(() => billing === 'annual' ? 'Économisez ~20%' : undefined, [billing])

  const choose = (plan: Plan) => {
    // A brancher sur ton vrai checkout; route “/checkout” suggérée
    router.push(`/checkout?plan=${plan.key}&billing=${billing}`)
  }

  // Styles (dark, sobres)
  const pageWrap: React.CSSProperties = { background:'#0b1220', minHeight:'100vh', color:'#e2e8f0', padding:'32px 16px' }
  const container: React.CSSProperties = { maxWidth:1160, margin:'0 auto' }
  const cardsGrid: React.CSSProperties = {
    display:'grid',
    gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',
    gap:12
  }

  return (
    <div style={pageWrap}>
      <div style={container}>
        {/* Header compact */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontWeight:700, color:'#9aa4b2' }}>precom-com</div>
          {/* Ajoute un lien Sign in/Sign up si tu veux */}
        </div>

        <h1 style={{ fontSize:40, textAlign:'center', marginTop:24, marginBottom:8 }}>
          Choisissez votre formule
        </h1>
        <p style={{ textAlign:'center', color:'#9aa4b2', marginTop:0 }}>
          Passez de l’essai gratuit à la version pro quand vous voulez.
        </p>

        {/* Toggle Mensuel / Annuel (URL-sync + a11y) */}
        <div style={{ display:'flex', justifyContent:'center', gap:8, margin:'16px 0 28px' }} role="tablist" aria-label="Facturation">
          <button
            role="tab" aria-selected={billing==='monthly'} aria-pressed={billing==='monthly'}
            onClick={()=>setBillingAndSync('monthly')}
            style={{
              padding:'8px 12px', borderRadius:10, border:'1px solid #263043',
              background: billing==='monthly' ? '#1f2a44' : 'transparent',
              color:'#e2e8f0', cursor:'pointer', minWidth:110
            }}>
            Mensuel
          </button>
          <button
            role="tab" aria-selected={billing==='annual'} aria-pressed={billing==='annual'}
            onClick={()=>setBillingAndSync('annual')}
            style={{
              padding:'8px 12px', borderRadius:10, border:'1px solid #263043',
              background: billing==='annual' ? '#1f2a44' : 'transparent',
              color:'#e2e8f0', cursor:'pointer', display:'flex', alignItems:'center', gap:8, minWidth:110
            }}>
            Annuel
            {hint && <span style={{
              background:'#123b2a', color:'#34d399', border:'1px solid #2e7a5b',
              padding:'2px 8px', borderRadius:999, fontSize:12
            }}>{hint}</span>}
          </button>
        </div>

        {/* Cartes */}
        <div style={cardsGrid}>
          {PLANS.map(plan => {
            const price = priceOf(plan)
            const isPopular = plan.badge === 'Populaire'
            const showAnnualExtras = billing==='annual' && plan.baseMonthly>0
            return (
              <div key={plan.key}
                   style={{
                     background:'#0f172a', border:'1px solid #1e293b',
                     borderRadius:12, padding:16, position:'relative', display:'grid', gap:8
                   }}>
                {isPopular && (
                  <span aria-label="Plan populaire" style={{
                    position:'absolute', top:10, right:10, fontSize:12,
                    background:'#123b2a', color:'#34d399', border:'1px solid #2e7a5b',
                    padding:'2px 8px', borderRadius:999
                  }}>Populaire</span>
                )}

                <div style={{ color:'#cbd5e1', fontWeight:600 }}>{plan.title}</div>

                <div style={{ display:'grid', alignItems:'baseline', gap:2 }}>
                  <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
                    <div style={{ fontSize:34, fontWeight:800 }}>{formatEUR(price)}</div>
                    <div style={{ color:'#94a3b8' }}>€ / mois</div>
                  </div>
                  {showAnnualExtras && (
                    <div style={{ color:'#9aa4b2', fontSize:13 }}>
                      soit <b>{formatEUR(annualTotal(plan))} € / an</b> (facturé 1×) ·
                      <span style={{ color:'#34d399' }}> économisez {formatEUR(annualSaving(plan))} € / an</span>
                    </div>
                  )}
                </div>

                <ul style={{ listStyle:'none', padding:0, margin:'8px 0', color:'#9aa4b2', display:'grid', gap:6 }}>
                  <li>✅ Projets : {plan.limits.projects}</li>
                  <li>✅ Systèmes / projet : {plan.limits.systemsPerProject}</li>
                  <li>✅ Sous-systèmes / système : {plan.limits.subsPerSystem}</li>
                </ul>

                <button
                  onClick={() => choose(plan)}
                  style={{
                    width:'100%', padding:'10px 12px', borderRadius:10,
                    background:'#1f2a44', border:'1px solid #263043', color:'#e2e8f0', cursor:'pointer'
                  }}>
                  {plan.baseMonthly === 0 ? 'Démarrer gratuitement' : 'Choisir'}
                </button>
              </div>
            )
          })}
        </div>

        <p style={{ textAlign:'center', color:'#9aa4b2', marginTop:18 }}>
          Paiement sécurisé • Annulation à tout moment • Assistance par e‑mail.
        </p>
      </div>
    </div>
  )
}
