'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import supabase from '@/lib/supabaseClient';

export default function Client() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = params.get('plan') ?? 'free';

  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);

  const callbackUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/auth/callback?plan=${plan}`;
  }, [plan]);

  async function signInWithGoogle() {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: { prompt: 'select_account' }
        }
      });
      if (error) throw error;
    } catch (e: any) {
      alert(e.message ?? 'Erreur Google');
      setLoading(false);
    }
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password: pwd,
        options: { emailRedirectTo: callbackUrl }
      });
      if (error) throw error;
      alert('Vérifiez votre e‑mail pour confirmer votre compte.');
    } catch (e: any) {
      alert(e.message ?? 'Inscription impossible');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-start md:items-center justify-center py-10 md:py-16">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/60 ring-1 ring-white/10 backdrop-blur px-6 py-7 shadow-2xl">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-1">
          Inscrivez‑vous à <span className="text-primary">PRECOM‑COM</span>
        </h1>

        <p className="text-sm text-slate-300 mb-6">
          Plan sélectionné : <span className="font-medium text-primary">{plan}</span>
        </p>

        {/* Bouton Google façon “Maestra” */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-white/10 bg-white text-slate-900 hover:bg-slate-50 active:scale-[.99] py-3 font-medium transition disabled:opacity-60"
          aria-label="Continuer avec Google"
        >
          {/* G icon */}
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.3 29.3 35 24 35c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.6 3 29.6 1 24 1 11.8 1 2 10.8 2 23s9.8 22 22 22c11 0 21-8 21-22 0-1.5-.2-2.9-.4-4.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.5 18.9 14 24 14c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.6 3 29.6 1 24 1 15.1 1 7.4 6.2 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 45c5.2 0 10.2-1.9 14-5.3l-6.5-5.3C29.3 35 26.8 36 24 36c-5.2 0-9.6-3.5-11.2-8.3l-6.6 5.1C7.3 40.8 15.1 45 24 45z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.3-6 7-11.3 7-5.2 0-9.6-3.5-11.2-8.3l-6.6 5.1C7.3 40.8 15.1 45 24 45c11 0 21-8 21-22 0-1.5-.2-2.9-.4-4.5z"/>
          </svg>
          Continuer avec Google
        </button>

        {/* séparateur */}
        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-slate-400">ou</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        {/* Formulaire email / mot de passe */}
        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-200">E‑mail</label>
            <input
              type="email"
              required
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-200">Mot de passe</label>
            <input
              type="password"
              minLength={6}
              required
              placeholder="Au moins 6 caractères"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary hover:bg-primary/90 py-2.5 font-semibold text-slate-900 shadow-lg shadow-primary/20 transition disabled:opacity-60"
          >
            {loading ? 'Enregistrement…' : 'Enregistrement'}
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-400">
          Après confirmation de votre e‑mail, vous serez redirigé pour créer votre premier projet
          (<span className="text-primary">{plan}</span>).
        </p>

        <div className="mt-6 text-center text-sm">
          <span className="text-slate-400">Déjà un compte ? </span>
          <a href="/login" className="font-medium text-primary hover:underline">Se connecter</a>
        </div>
      </div>
    </main>
  );
}
