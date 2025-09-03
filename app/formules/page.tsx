'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

const Card: React.FC<{
  title: string; price: string; features: string[]; plan: string
}> = ({ title, price, features, plan }) => (
  <div style={{
    border:'1px solid #1f2937', borderRadius:16, padding:20,
    background:'#0b1220', color:'#e5e7eb', display:'grid', gap:12
  }}>
    <div style={{fontSize:18, fontWeight:700}}>{title}</div>
    <div style={{fontSize:26, fontWeight:800}}>{price}</div>
    <ul style={{margin:0, paddingLeft:18, color:'#9ca3af'}}>
      {features.map((f,i)=><li key={i}>{f}</li>)}
    </ul>
    <a href={`/inscription?plan=${encodeURIComponent(plan)}`}
       style={{
         marginTop:8, textAlign:'center', padding:'10px 14px',
         borderRadius:10, background:'#22c55e', color:'#0b1220',
         fontWeight:700, textDecoration:'none'
       }}>
      Choisir {title}
    </a>
  </div>
);

export default function Pricing() {
  const sp = useSearchParams()
  const highlight = sp.get('h') // optionnel pour mettre en avant un plan

  const cards = useMemo(()=>[
    { title:'Starter', price:'Gratuit', plan:'starter',
      features:['1 projet','Import Excel','Arbo pré-com/Com'] },
    { title:'Pro', price:'29 € / mois', plan:'pro',
      features:['Projets illimités','Réserves & fiches','Exports avancés'] },
    { title:'Entreprise', price:'Sur devis', plan:'entreprise',
      features:['SSO & rôles','Support prioritaire','Intégrations (ERP, CMMS)'] },
  ],[])

  return (
    <div style={{maxWidth:980, margin:'24px auto', color:'#e5e7eb'}}>
      <h1 style={{fontSize:28, margin:'0 0 8px'}}>Formules PRECOM‑COM</h1>
      <p style={{marginTop:0, color:'#9ca3af'}}>
        Choisissez une formule pour démarrer. L’étape suivante vous demandera simplement de vous identifier.
      </p>
      <div style={{
        display:'grid', gap:16,
        gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))'
      }}>
        {cards.map(c=>(
          <div key={c.plan}
               style={{outline: highlight===c.plan ? '2px solid #22c55e' : 'none', borderRadius:18}}>
            <Card {...c}/>
          </div>
        ))}
      </div>
    </div>
  )
}
