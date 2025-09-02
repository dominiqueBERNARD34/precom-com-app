'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function Client() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL;

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    setBusy(false);
    setMessage(
      error
        ? `Erreur : ${error.message}`
        : 'Merci ! Vérifiez votre e‑mail pour confirmer votre compte.'
    );
  }

  async function signInWithGoogle() {
    setBusy(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${origin}/auth/callback` },
    });
    setBusy(false);
  }

  return (
    <>
      <button
        onClick={signInWithGoogle}
        disabled={busy}
        className="mb-5 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        {/* simple G */}
        <span className="inline-grid size-5 place-items-center rounded bg-white text-slate-900">G</span>
        Continuer avec Google
      </button>

      <div className="relative my-3 text-center">
        <span className="bg-transparent px-3 text-xs text-slate-400">ou</span>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block text-slate-300">E‑mail</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-slate-300">Mot de passe</span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Au moins 6 caractères"
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-brand-500 px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-brand-400 disabled:opacity-60"
        >
          Créer mon compte
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-slate-300">{message}</p>}

      <p className="mt-6 text-center text-sm text-slate-400">
        Déjà un compte ?{' '}
        <a href="/login" className="font-medium text-brand-400 hover:underline">
          Se connecter
        </a>
      </p>
    </>
  );
}
