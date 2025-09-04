'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const PLANS = ['starter', 'growth', 'business'] as const
type Plan = typeof PLANS[number]

export default function SignupPage() {
  const sp = useSearchParams()
  const fromQuery = (sp.get('plan') || '').toLowerCase()

  // normalise et sécurise le plan
  const initialPlan: Plan = useMemo(() => {
    const q = PLANS.find(p => p === fromQuery)
    const stored = (typeof window !== 'undefined'
      ? (localStorage.getItem('precom:plan') || '').toLowerCase()
      : '') as Plan
    return (q ?? (PLANS.find(p => p === stored) as Plan) ?? 'starter')
  }, [fromQuery])

  const [plan, setPlan] = useState<Plan>(initialPlan)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    // mémorise pour conserver le plan si l’utilisateur revient en arrière
    localStorage.setItem('precom:plan', plan)
  }, [plan])

  const signUpWithEmail = async () => {
    setMsg(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // on enregistre le plan choisi dans les métadonnées utilisateur
        data: { selected_plan: plan }
      }
    })
    setMsg(error ? `Erreur: ${error.message}` : 'Compte créé — vérifie tes emails')
  }

  const signInWithGoogle = async () => {
    // IMPORTANT : on propage aussi le plan dans le retour OAuth
    const origin = window.location.origin
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${origin}/auth/callback?plan=${plan}` }
    })
  }

  return (
    <div style={{ maxWidth: 420, margin: '24px auto' }}>
      <h1>Inscrivez‑vous à <b>PRECOM‑COM</b></h1>

      <p style={{ marginTop: 8 }}>
        Plan sélectionné : <b>{plan}</b>{' '}
        <a href="/pricing" style={{ marginLeft: 8 }}>Changer</a>
      </p>

      <button onClick={signInWithGoogle} style={{ width:'100%', padding:10 }}>
        G Continuer avec Google
      </button>

      <div style={{ textAlign:'center', color:'#64748b', margin: '12px 0' }}>ou</div>

      <label>E‑mail</label>
      <input value={email} onChange={e=>setEmail(e.target.value)}
             placeholder="votre@email.com" style={{ width:'100%', padding:8 }} />

      <label style={{ marginTop:8, display:'block' }}>Mot de passe</label>
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
             placeholder="Au moins 6 caractères" style={{ width:'100%', padding:8 }} />

      <button onClick={signUpWithEmail} style={{ width:'100%', padding:10, marginTop:12 }}>
        Créer mon compte
      </button>

      {msg && <p style={{ marginTop:10 }}>{msg}</p>}
    </div>
  )
}
