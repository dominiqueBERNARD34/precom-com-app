'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallbackPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const next = sp.get('next') ?? '/systems'
  const [msg, setMsg] = useState('Connexion en cours…')

  useEffect(() => {
    const run = async () => {
      // Récupère le "code" présent dans l’URL et crée la session locale
      const { error } = await supabase.auth.exchangeCodeForSession(
        typeof window !== 'undefined' ? window.location.href : ''
      )
      if (error) {
        setMsg(`Erreur d’authentification : ${error.message}`)
        return
      }
      setMsg('Connecté ! Redirection…')
      router.replace(next)
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ maxWidth: 420, margin: '24px auto' }}>
      <h1>Callback Auth</h1>
      <p>{msg}</p>
    </div>
  )
}
