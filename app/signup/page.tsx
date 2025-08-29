// app/signup/page.tsx
'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SignupPage() {
  const params = useSearchParams();
  const plan = params.get('plan') || 'free';
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [email,setEmail] = useState(''); const [password,setPassword]=useState('');
  const [msg,setMsg] = useState<string>();

  async function onSubmit(e:FormEvent) {
    e.preventDefault();
    setMsg('Création du compte…');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return setMsg(error.message);

    // Si gratuit -> profil déjà "free" via trigger → aller au dashboard
    if (plan === 'free') return router.replace('/dashboard');

    // Paid : lancer Checkout (server route)
    const res = await fetch('/api/stripe/checkout', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ plan })
    });
    const { url, error:err } = await res.json();
    if (err) return setMsg(err);
    window.location.href = url; // Stripe Checkout
  }

  return (
    <main className="p-8 max-w-md mx-auto">
      <h1 className="text-xl font-bold">Créer un compte</h1>
      <p className="text-slate-600 mt-2">Offre sélectionnée : <b>{plan}</b></p>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input className="border rounded w-full p-2" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="border rounded w-full p-2" placeholder="Mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="px-4 py-2 border rounded">Continuer</button>
      </form>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </main>
  );
}
