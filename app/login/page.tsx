// app/login/page.tsx
'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [email,setEmail] = useState(''); const [password,setPassword]=useState('');
  const [msg,setMsg] = useState<string>();

  async function onSubmit(e:FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setMsg(error.message);
    router.replace('/dashboard');
  }

  return (
    <main className="p-8 max-w-md mx-auto">
      <h1 className="text-xl font-bold">Connexion</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input className="border rounded w-full p-2" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="border rounded w-full p-2" placeholder="Mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="px-4 py-2 border rounded">Se connecter</button>
      </form>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </main>
  );
}
