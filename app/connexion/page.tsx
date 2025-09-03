'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Connexion() {
  const router = useRouter()
  const sp = useSearchParams()
  const plan = sp.get('plan') || 'pro'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const onConnect = async () => {
    setBusy(true); setErr(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      await supabase.auth.updateUser({ data: { plan_source: plan } })
      router.push(`/onboarding?plan=${encodeURIComponent(plan)}`)
    } catch(e:any) {
      setErr(e?.message || String(e))
    } finally { setBusy(false) }
  }

  return (
    <div style={{maxWidth:380, margin:'48px auto'}}>
      <h1 style={{marginBottom:8}}>Connexion</h1>
      <p style={{marginTop:0, color:'#64748b'}}>Plan en cours : <b>{plan}</b></p>

      <label style={{display:'grid', gap:6, marginTop:8}}>
        <span>E‑mail</span>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} />
      </label>
      <label style={{display:'grid', gap:6, marginTop:8}}>
        <span>Mot de passe</span>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      </label>
      <button onClick={onConnect} disabled={busy || !email || !password}
              style={{marginTop:12, padding:'10px 12px', borderRadius:8}}>
        {busy ? '…' : 'Continuer'}
      </button>

      {err && <div style={{marginTop:10, color:'#b91c1c'}}>{err}</div>}
    </div>
  )
}
