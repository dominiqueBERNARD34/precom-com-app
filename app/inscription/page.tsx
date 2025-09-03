'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type PlanKey = 'starter'|'pro'|'entreprise'
const allowedPlans = new Set<PlanKey>(['starter','pro','entreprise'])

export default function Inscription() {
  const router = useRouter()
  const sp = useSearchParams()
  const plan = (sp.get('plan') || 'starter') as PlanKey

  // Si on arrive sans plan → redirige vers /formules
  useEffect(()=>{
    if (!allowedPlans.has(plan)) router.replace('/formules?h=pro')
  },[plan, router])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const redirectTo = useMemo(() => {
    // Après OAuth / sign‑up validé
    if (typeof window === 'undefined') return ''
    return `${location.origin}/onboarding?plan=${encodeURIComponent(plan)}`
  }, [plan])

  const onGoogle = async () => {
    setErr(null); setMsg(null)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    })
    // redirection par Supabase après auth Google
  }

  const onContinueEmail = async () => {
    setBusy(true); setErr(null); setMsg(null)
    try {
      // 1) tenter un signUp (crée le compte si nouveau)
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: redirectTo,
          data: { plan_source: plan }  // stocke le plan dans les metadata
        }
      })

      if (error && /registered/i.test(error.message)) {
        // 2) l'utilisateur existe déjà → simple connexion
        const { data: sIn, error: e2 } = await supabase.auth.signInWithPassword({ email, password })
        if (e2) throw e2
        // Met à jour la metadata (dernière intention de plan)
        await supabase.auth.updateUser({ data: { plan_source: plan } })
        router.push(`/onboarding?plan=${plan}`)
        return
      }

      if (error) throw error

      // Selon ta config Supabase : soit session directe, soit email de confirmation
      if (data.session) {
        router.push(`/onboarding?plan=${plan}`)
      } else {
        setMsg('Nous t’avons envoyé un e‑mail de confirmation. Ouvre‑le puis reviens ici, tu seras automatiquement connecté.')
      }
    } catch (e:any) {
      setErr(e?.message || String(e))
    } finally {
      setBusy(false)
    }
  }

  const NiceBox: React.FC<{children:React.ReactNode}> = ({children}) => (
    <div style={{
      width: 360, background:'#0b1220', color:'#e5e7eb',
      border:'1px solid #1f2937', borderRadius:16, padding:16
    }}>{children}</div>
  )

  return (
    <div style={{
      minHeight:'calc(100dvh - 64px)', // enlève la hauteur du header
      display:'grid', placeItems:'center',
      background:'#0a0f1c', padding:'24px 12px'
    }}>
      <div style={{
        display:'flex', gap:20, alignItems:'stretch',
        width:'min(980px, 96vw)'
      }}>
        {/* Colonne gauche (branding) */}
        <div style={{
          flex:1, minHeight:420, borderRadius:16,
          background:'linear-gradient(180deg, #0b1220 0%, #0a0f1c 100%)',
          border:'1px solid #1f2937', padding:24, color:'#e5e7eb'
        }}>
          <div style={{fontSize:32, fontWeight:800, lineHeight:1.1}}>
            Inscrivez‑vous à<br/>PRECOM‑COM
          </div>
          <div style={{marginTop:16, color:'#9ca3af'}}>
            Plan sélectionné : <b style={{color:'#e5e7eb', textTransform:'capitalize'}}>{plan}</b>
          </div>
          <ul style={{marginTop:16, color:'#9ca3af'}}>
            <li>Authentification simple (Google ou e‑mail)</li>
            <li>Arbo Systèmes → Sous‑systèmes → Fiches</li>
            <li>Import Excel “repères” en masse</li>
          </ul>
        </div>

        {/* Colonne droite (auth) */}
        <NiceBox>
          <button onClick={onGoogle}
                  style={{width:'100%', padding:'10px 12px', borderRadius:10,
                          border:'1px solid #334155', background:'#111827',
                          color:'#e5e7eb', cursor:'pointer', fontWeight:600}}>
            Continuer avec Google
          </button>

          <div style={{textAlign:'center', color:'#6b7280', fontSize:12, margin:'10px 0'}}>ou</div>

          <label style={{display:'grid', gap:6, marginTop:8}}>
            <span style={{fontSize:12, color:'#9ca3af'}}>E‑mail</span>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                   placeholder="votre@email.com"
                   style={{padding:'10px 12px', borderRadius:8, border:'1px solid #334155',
                           background:'#0a0f1c', color:'#e5e7eb'}}/>
          </label>

          <label style={{display:'grid', gap:6, marginTop:10}}>
            <span style={{fontSize:12, color:'#9ca3af'}}>Mot de passe</span>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                   placeholder="Au moins 6 caractères"
                   style={{padding:'10px 12px', borderRadius:8, border:'1px solid #334155',
                           background:'#0a0f1c', color:'#e5e7eb'}}/>
          </label>

          <button onClick={onContinueEmail} disabled={busy || !email || password.length<6}
                  style={{
                    marginTop:12, width:'100%', padding:'10px 12px', borderRadius:10,
                    background:'#22c55e', color:'#0b1220', fontWeight:800,
                    cursor: busy ? 'not-allowed' : 'pointer', border:'none'
                  }}>
            {busy ? '…' : 'Continuer'}
          </button>

          <div style={{marginTop:10, fontSize:12, color:'#9ca3af'}}>
            Déjà un compte ?&nbsp;
            <a href={`/connexion?plan=${plan}`} style={{color:'#93c5fd', textDecoration:'none'}}>
              Se connecter
            </a>
          </div>

          {err && (
            <div style={{marginTop:12, color:'#fecaca', background:'#7f1d1d', padding:8, borderRadius:8}}>
              {err}
            </div>
          )}
          {msg && (
            <div style={{marginTop:12, color:'#bbf7d0', background:'#064e3b', padding:8, borderRadius:8}}>
              {msg}
            </div>
          )}
        </NiceBox>
      </div>
    </div>
  )
}
