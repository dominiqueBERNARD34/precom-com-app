// src/components/PricingSection.tsx
'use client'
import { useState } from 'react'

type Billing = 'monthly'|'annual'
const plans = [
  { key:'free', title:'Gratuit (essai)',  price:0,     badge:'',         limits:{projects:1, systems:1,  subs:2} },
  { key:'starter', title:'Starter',       price:19.99, badge:'',         limits:{projects:1, systems:5,  subs:5} },
  { key:'growth',  title:'Growth',        price:49.99, badge:'Populaire',limits:{projects:2, systems:10, subs:10} },
  { key:'business',title:'Business',      price:199.99,badge:'',         limits:{projects:3, systems:20, subs:15} },
  { key:'pro',     title:'Pro',           price:999.90,badge:'',         limits:{projects:5, systems:25, subs:25} },
]
const fmt = (n:number)=> new Intl.NumberFormat('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)

export default function PricingSection(){
  const [billing, setBilling] = useState<Billing>('monthly')
  const factor = billing==='annual' ? .8 : 1
  return (
    <div>
      <div style={{ display:'flex', gap:8, margin:'8px 0 16px' }}>
        <button onClick={()=>setBilling('monthly')}
                style={{ padding:'6px 10px', borderRadius:8, border:'1px solid #334155',
                         background: billing==='monthly' ? '#1f2a44':'transparent', color:'#e2e8f0' }}>
          Mensuel
        </button>
        <button onClick={()=>setBilling('annual')}
                style={{ padding:'6px 10px', borderRadius:8, border:'1px solid #334155',
                         background: billing==='annual' ? '#1f2a44':'transparent', color:'#e2e8f0' }}>
          Annuel <span style={{ marginLeft:8, fontSize:12, color:'#34d399' }}>Économisez ~20%</span>
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, minmax(220px,1fr))', gap:12 }}>
        {plans.map(p=>(
          <div key={p.key} style={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:12, padding:16, position:'relative' }}>
            {p.badge && <span style={{
              position:'absolute', top:10, right:10, fontSize:12,
              background:'#123b2a', color:'#34d399', border:'1px solid #2e7a5b',
              padding:'2px 8px', borderRadius:999
            }}>{p.badge}</span>}

            <div style={{ color:'#cbd5e1', fontWeight:600, marginBottom:8 }}>{p.title}</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
              <div style={{ fontSize:32, fontWeight:800 }}>{fmt(p.price*factor)}</div>
              <div style={{ color:'#94a3b8' }}>€ / mois</div>
            </div>

            <ul style={{ listStyle:'none', padding:0, margin:'12px 0', color:'#9aa4b2', display:'grid', gap:6 }}>
              <li>✅ Projets : {p.limits.projects}</li>
              <li>✅ Systèmes / projet : {p.limits.systems}</li>
              <li>✅ Sous-systèmes / système : {p.limits.subs}</li>
            </ul>

            <button style={{ width:'100%', padding:'10px 12px', borderRadius:10,
                              background:'#1f2a44', border:'1px solid #263043', color:'#e2e8f0', cursor:'pointer' }}>
              Choisir
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
