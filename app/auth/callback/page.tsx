'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()
  const sp = useSearchParams()
  const [msg, setMsg] = useState('Validation du lien…')

  useEffect(() => {
    const next = sp.get('next') || '/systems'

    const run = async () => {
      try {
        // v2: /auth/callback?code=...
        const code = sp.get('code')
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          router.replace(next)
          return
        }

        // v1: hash fragment (#access_token, #error, etc.)
        if (typeof window !== 'undefined' && window.location.hash) {
          // Essayez d'abord de consommer le hash
          const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true })
          if (error) throw error
          router.replace(next)
          return
        }

        // Si on arrive ici, pas de code ni de hash → rien à valider
        setMsg('Lien invalide. Veuillez redemander un e‑mail de connexion.')
      } catch (e: any) {
        // Cas typique: otp_expired (lien scanné/consommé)
        const hash = typeof window !== 'undefined' ? window.location.hash : ''
        const errorDesc = new URLSearchParams(hash.replace(/^#/, '')).get('error_description') || e?.message
        setMsg(`Impossible de vérifier le lien (${errorDesc}). Renvoyez un lien depuis la page de connexion.`)
      }
    }

    run()
  }, [router, sp])

  return (
    <div style={{ maxWidth: 520, margin: '80px auto', lineHeight: 1.5 }}>
      <h1>Connexion</h1>
      <p>{msg}</p>
    </div>
  )
}
