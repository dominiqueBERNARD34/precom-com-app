'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState('Connexion en cours…');

  useEffect(() => {
    // termine la session avec le code présent dans l’URL
    supabase.auth.exchangeCodeForSession(window.location.href)
      .then(({ error }) => {
        if (error) setMsg(`Erreur: ${error.message}`);
        else router.replace('/import'); // redirige où vous voulez
      });
  }, [router]);

  return <main className="p-6"><p>{msg}</p></main>;
}
