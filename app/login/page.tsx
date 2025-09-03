'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const redirectTo = `${origin}/auth/callback`

  const signInWithGoogle = async () => {
    setBusy(true); setMsg(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,                             // ← retour chez toi après OAuth
        queryParams: { access_type: 'offline', prompt: 'consent' } // refresh_token
      }
    })
    if (error) { setMsg(`Google: ${error.message}`); setBusy(false) }
  }

  const signInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true); setMsg(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }   // ← retour après clic sur le lien reçu
    })
    setBusy(false)
    setMsg(error ? `Email: ${error.message}` : `Lien envoyé à ${email}.`)
  }

  return (
    <div style={{ maxWidth: 480, margin: '24px auto' }}>
      <h1>Connexion</h1>

      <button onClick={signInWithGoogle} disabled={busy}
              style={{ padding: '8px 12px', marginBottom: 12 }}>
        Se connecter avec Google
      </button>

      <form onSubmit={signInWithEmail}
            style={{ display:'grid', gap:8, border:'1px solid #eee', padding:12, borderRadius:8 }}>
        <label>
          Email
          <input type="email" required value={email}
                 onChange={e=>setEmail(e.target.value)}
                 style={{ width:'100%', padding:8, marginTop:4 }} />
        </label>
        <button type="submit" disabled={busy} style={{ padding:'8px 12px' }}>
          Recevoir un lien magique
        </button>
      </form>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  )
}
