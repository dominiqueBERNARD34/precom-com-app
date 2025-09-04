'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Permet d’arriver sur /login?next=/systems (ou autre)
  const sp = useSearchParams()
  const nextAfterLogin = sp.get('next') ?? '/systems'
  const origin =
    typeof window !== 'undefined' ? window.location.origin : ''

  const signInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // <— exactement ce que montre ta capture
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextAfterLogin)}`
      }
    })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  const signInWithGoogle = async () => {
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // <— idem que sur la capture
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextAfterLogin)}`
      }
    })
    setLoading(false)
    if (error) setError(error.message)
    // En OAuth, l’utilisateur est redirigé immédiatement vers Google
  }

  return (
    <div style={{ maxWidth: 420, margin: '24px auto' }}>
      <h1>Connexion</h1>
      <p style={{ color:'#64748b' }}>
        Identifiez‑vous par email (lien magique) ou via Google.
      </p>

      <form onSubmit={signInWithEmail} style={{ display:'grid', gap:8 }}>
        <label>Email</label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          required placeholder="vous@exemple.com"
          style={{ padding:8, border:'1px solid #e5e7eb', borderRadius:8 }}
        />
        <button disabled={loading} type="submit"
                style={{ padding:10, border:'1px solid #e5e7eb', borderRadius:8, cursor:'pointer' }}>
          Envoyer le lien de connexion
        </button>
      </form>

      <div style={{ margin: '12px 0', textAlign:'center' }}>— ou —</div>

      <button onClick={signInWithGoogle} disabled={loading}
              style={{ padding:10, width:'100%', border:'1px solid #e5e7eb', borderRadius:8, cursor:'pointer' }}>
        Continuer avec Google
      </button>

      {sent && (
        <p style={{ marginTop:12, color:'#16a34a' }}>
          Email envoyé. Ouvre le lien reçu pour te connecter.
        </p>
      )}
      {error && <p style={{ marginTop:12, color:'#dc2626' }}>{error}</p>}
    </div>
  )
}
