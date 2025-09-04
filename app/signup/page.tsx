// src/app/signup/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { normalizePlan, planBySlug, PlanSlug } from '@/lib/plans'

export const dynamic = 'force-dynamic'  // anti-cache

export default function SignupPage() {
  const sp = useSearchParams()
  const [plan, setPlan] = useState<PlanSlug>('starter')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string>('')

  useEffect(() => {
    const q = normalizePlan(sp.get('plan'))
    let finalPlan = q
    if (!sp.get('plan')) {
      try { finalPlan = normalizePlan(sessionStorage.getItem('selected_plan')) } catch {}
    }
    setPlan(finalPlan)
    try { sessionStorage.setItem('selected_plan', finalPlan) } catch {}
  }, [sp])

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setMsg('Envoi…')
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        // très utile pour Supabase : où revenir après clic dans l’email
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
        data: { selected_plan: plan }
      }
    })
    if (error) { setMsg(`Erreur : ${error.message}`); return }
    if (!data.user) { setMsg('Inscription initiée.'); return }
    setMsg('Compte créé — vérifie tes emails.')
  }

  async function resend() {
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    setMsg(error ? `Erreur renvoi : ${error.message}` : 'Email de confirmation renvoyé.')
  }

  const p = planBySlug[plan]
  return (
    <div style={{maxWidth:560,margin:'24px auto',padding:16}}>
      <h1>Inscrivez-vous à PRECOM-COM</h1>
      <p>Plan sélectionné : <b>{p.name}</b> &nbsp; <Link prefetch={false} href="/pricing">Changer</Link></p>

      <form onSubmit={handleSignup} style={{display:'grid',gap:10}}>
        <input type="email" required placeholder="E‑mail" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" required placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Créer mon compte</button>
      </form>

      {!!msg && <p style={{marginTop:8}}>{msg} {msg.includes('vérifie tes emails') && (
        <button onClick={resend} style={{marginLeft:8}}>Renvoyer l’email</button>
      )}</p>}
    </div>
  )
}
