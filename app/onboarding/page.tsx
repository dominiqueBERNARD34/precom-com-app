'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Onboarding() {
  const sp = useSearchParams()
  const plan = sp.get('plan') || 'pro'
  const [email, setEmail] = useState<string | null>(null)

  useEffect(()=>{
    supabase.auth.getUser().then(({data})=>{
      setEmail(data.user?.email ?? null)
    })
  },[])

  return (
    <div style={{
      display:'grid', placeItems:'center', minHeight:'calc(100dvh - 64px)',
      background:'radial-gradient(80% 80% at 50% 0%, #0b1220 0%, #0a0f1c 100%)'
    }}>
      <div style={{
        width:'min(720px, 92vw)', background:'#0b1220', border:'1px solid #1f2937',
        borderRadius:18, padding:24, color:'#e5e7eb', textAlign:'center'
      }}>
        <div style={{fontSize:30, fontWeight:900}}>Bienvenue sur PRECOM‑COM</div>
        <div style={{marginTop:6, color:'#9ca3af'}}>
          {email ? `Connecté en tant que ${email}` : 'Vérifiez votre e‑mail si vous venez de créer un compte.'}
        </div>
        <div style={{marginTop:12}}>
          Plan sélectionné : <b style={{textTransform:'capitalize'}}>{plan}</b>
        </div>
        <div style={{marginTop:22, display:'flex', gap:10, justifyContent:'center'}}>
          <a href="/systems" style={{
            padding:'10px 14px', borderRadius:10, background:'#22c55e', color:'#0b1220',
            textDecoration:'none', fontWeight:800
          }}>
            Ouvrir l’arborescence
          </a>
          <a href="/tab-lab" style={{
            padding:'10px 14px', borderRadius:10, border:'1px solid #334155',
            color:'#e5e7eb', textDecoration:'none'
          }}>
            Importer des repères
          </a>
        </div>
      </div>
    </div>
  )
}
