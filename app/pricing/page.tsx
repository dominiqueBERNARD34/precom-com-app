// src/app/pricing/page.tsx
'use client'
import Link from 'next/link'
import { PLANS } from '@/lib/plans'

export const dynamic = 'force-dynamic'  // anti-cache
export default function PricingPage() {
  return (
    <div style={{maxWidth:720,margin:'24px auto',padding:16,display:'grid',gap:12}}>
      {PLANS.map(p => (
        <div key={p.slug} style={{border:'1px solid #e5e7eb',borderRadius:12,padding:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <b>{p.name}</b><span>{p.price === 0 ? 'Gratuit' : `${p.price} €/mois`}</span>
          </div>
          <Link
            prefetch={false}
            href={`/signup?plan=${p.slug}`}
            onClick={() => { try { sessionStorage.setItem('selected_plan', p.slug) } catch {} }}
            style={{display:'inline-block',marginTop:10,padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:8}}
          >
            Choisir {p.slug === 'starter' ? 'l’essai' : p.name}
          </Link>
        </div>
      ))}
    </div>
  )
}
