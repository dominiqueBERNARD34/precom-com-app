'use client'
import { supabase } from '@/lib/supabaseClient'
export default function Logout() {
  return (
    <button onClick={() => supabase.auth.signOut().then(()=>location.href='/')}>
      Se déconnecter
    </button>
  )
}
