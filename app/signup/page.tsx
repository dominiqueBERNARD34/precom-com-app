'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type PlanKey = 'starter' | 'pro' | 'enterprise'
const PLANS: Record<PlanKey, { label: string }> = {
  starter:    { label: 'starter' },
  pro:        { label: 'pro' },
  enterprise: { label: 'entreprise' }
}

function normalizePlan(p: string | null): PlanKey {
  const k = (p ?? '').toLowerCase()
  if (k === 'starter' || k === 'pro' || k === 'enterprise') return k
  return 'starter'
}

export default function SignupPage() {
  const sp = useSearchParams()
  const [plan, setPlan] = useState<PlanKey>('starter')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  // ---- Sélection du plan : URL > localStorage > défaut
  useEffect(() => {
    const fromQuery = sp.get('plan')
    if (fromQuery) {
      const p = normalizePlan(fromQuery)
      setPlan(p)
      try { localStorage.setItem('selectedPlan', p) } catch {}
      return
    }
    try {
      const fromLS = localStorage.getItem('selectedPlan') as PlanKey | null
      if (fromLS && (fromLS in PLANS)) setPlan(fromLS)
    } catch {}
  }, [sp])

  async function onGoogle() {
    setBusy(true); setMsg(null)
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?plan=${plan}`,
          queryParams: { prompt: 'consent' }
        }
      })
    } catch (e: any) {
      setMsg(e?.message || 'Erreur Google OAuth')
      setBusy(false)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setMsg(null)
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?plan=${plan}`,
          data: { plan } // user_metadata.plan
        }
      })
      if (error) throw error
      setMsg("Vérifie ta boîte mail pour confirmer ton compte.")
    } catch (e: any) {
      setMsg(e?.message || 'Erreur inscription')
    } finally {
      setBusy(false)
    }
  }

  // ---- Styles “fenêtre agréable” (fond clair, carte blanche)
  const page: React.CSSProperties = {
    minHeight: '100dvh',
    display: 'grid',
    alignItems: 'center',
    justifyItems: 'center',
    padding: 16,
    background: 'linear-gradient(180deg,#f8fafc 0%,#eef2f7 100%)',
    color: '#0f172a'
  }
  const card: React.CSSProperties = {
    width: 360,
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 12px 30px rgba(15,23,42,.08)',
    padding: 20
  }
  const input: React.CSSProperties = {
    width: '100%',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '10px 12px'
  }
  const button: React.CSSProperties = {
    width: '100%',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '10px 12px',
    cursor: 'pointer',
    background: '#0f172a',
    color: '#fff'
  }

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={{margin:'0 0 8px'}}>Inscrivez‑vous à <span style={{fontWeight:700}}>PRECOM‑COM</span></h1>
        <div style={{margin:'6px 0 14px', fontSize:14, color:'#475569'}}>
          Plan sélectionné&nbsp;: <b>{PLANS[plan].label}</b>
          <span style={{marginLeft:8}}>
            <a href="/pricing" style={{color:'#0f172a'}}>Changer</a>
          </span>
        </div>

        <button onClick={onGoogle} disabled={busy} style={{...button, background:'#fff', color:'#0f172a'}}>
          G Continuer avec Google
        </button>

        <div style={{margin:'10px 0', textAlign:'center', color:'#94a3b8', fontSize:12}}>ou</div>

        <form onSubmit={onSubmit} style={{display:'grid', gap:10}}>
          <label style={{fontSize:14}}>E‑mail</label>
          <input style={input} type="email" required
                 placeholder="votre@email.com"
                 value={email} onChange={e=>setEmail(e.target.value)} />

          <label style={{fontSize:14}}>Mot de passe</label>
          <input style={input} type="password" required minLength={6}
                 placeholder="Au moins 6 caractères"
                 value={password} onChange={e=>setPassword(e.target.value)} />

          <button type="submit" disabled={busy} style={button}>
            Créer mon compte
          </button>
        </form>

        <div style={{marginTop:10, fontSize:14}}>
          Déjà un compte ? <a href="/login" style={{color:'#0f172a'}}>Se connecter</a>
        </div>

        {msg && (
          <div style={{marginTop:12, padding:10, background:'#f1f5f9', borderRadius:8, fontSize:14}}>
            {msg}
          </div>
        )}
      </div>
    </div>
  )
}
