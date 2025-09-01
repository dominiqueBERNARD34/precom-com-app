'use client';
  
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import supabase from '@/lib/supabaseClient';

export default function SignupClient() {
  const params = useSearchParams();
  const plan = params.get('plan') ?? 'free';

  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password: pwd,
      options: { data: { plan } } // on stocke le plan choisi dans user metadata
    });
    setLoading(false);
    setMsg(error ? `Erreur: ${error.message}` : 'Email d’inscription envoyé. Vérifiez votre boîte mail.');
  }

  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-4xl font-extrabold tracking-tight">Inscription</h1>
      <p className="mt-2">Plan sélectionné : <b>{plan}</b></p>

      <form onSubmit={onSignup} className="mt-8 space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          className="w-full border rounded px-3 py-2 bg-white/90 text-black"
          value={email} onChange={e=>setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          placeholder="Mot de passe"
          className="w-full border rounded px-3 py-2 bg-white/90 text-black"
          value={pwd} onChange={e=>setPwd(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          {loading ? 'Envoi...' : 'Créer mon compte'}
        </button>
      </form>

      {msg && <p className="mt-4">{msg}</p>}
    </div>
  );
}
