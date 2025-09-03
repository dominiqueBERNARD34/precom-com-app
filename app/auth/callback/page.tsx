'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // Échange le "code" renvoyé par Supabase contre une session persistée (localStorage)
    supabase.auth.exchangeCodeForSession(window.location.href)
      .then(({ error }) => {
        if (error) console.error('exchangeCodeForSession', error)
        router.replace('/systems') // ou '/' selon ta préférence
      })
  }, [router])

  return <p style={{ padding: 24 }}>Connexion en cours…</p>
}
