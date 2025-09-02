'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function Client() {
  const search = useSearchParams();
  const plan = (search.get('plan') || 'free') as 'free' | 'starter' | 'growth' | 'business' | 'pro';

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabase = supabaseBrowser;

  async function handleGoogle() {
    setMessage(null);
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?plan=${plan}`,
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      });
      // Redirection gérée par Supabase → callback
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message ?? 'Échec de la connexion Google.' });
      setLoading(false);
    }
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!email || !password) {
      setMessage({ type: 'error', text: 'Veuillez renseigner e‑mail et mot de passe.' });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?plan=${plan}`
        }
      });
      if (error) throw error;

      setMessage({
        type: 'success',
        text: "Vérifiez votre e‑mail pour confirmer votre compte. Vous serez ensuite redirigé pour créer votre premier projet."
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message ?? "Échec de l'inscription." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-10">
      <div className="mx-auto grid max-w-7xl place-items-center">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur">
          {/* Titre */}
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Inscrivez‑vous à <span className="text-cyan-400">PRECOM‑COM</span>
          </h1>

          {/* Badge plan */}
          <div className="mt-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">
              Plan sélectionné : <span className="font-semibold capitalize">{plan}</span>
            </span>
          </div>

          {/* Messages */}
          {message && (
            <div
              className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                message.type === 'success'
                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                  : 'border-rose-400/30 bg-rose-400/10 text-rose-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Bouton Google */}
          <div className="mt-6">
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="group inline-flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white text-slate-900 px-4 py-3 font-medium shadow hover:bg-white/90 disabled:cursor-not-allowed"
              aria-label="Continuer avec Google"
            >
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.3 32.4 29 35 24 35c-6.6 0-12-5.4-12-12S17.4 11 24 11c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 12.3 3 3 12.3 3 24s9.3 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.1-2.7-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.9C14.8 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 16 3 9 7.6 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 45c5.4 0 10.4-2.1 14.1-5.9l-6.5-5.3C29.5 35.1 26.9 36 24 36c-5 0-9.3-3.2-10.8-7.6l-6.7 5.2C9.1 41.8 16 45 24 45z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.2 3.5-4.1 6.3-7.7 7.3l6.5 5.3C37.3 37.4 41 31.6 41 24c0-1.3-.1-2.7-.4-3.5z"/>
              </svg>
              <span>Continuer avec Google</span>
            </button>
          </div>

          {/* Séparateur */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px w-full bg-white/10" />
            <span className="text-xs uppercase tracking-widest text-white/50">ou</span>
            <div className="h-px w-full bg-white/10" />
          </div>

          {/* Formulaire e-mail */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-white/80">
                E‑mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none ring-0 focus:border-cyan-400/50"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-white/80">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                placeholder="Au moins 6 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none ring-0 focus:border-cyan-400/50"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-900 shadow hover:bg-cyan-400 disabled:cursor-not-allowed"
            >
              {loading ? 'En cours…' : 'Créer mon compte'}
            </button>
          </form>

          {/* Texte d’aide */}
          <p className="mt-5 text-sm text-white/60">
            Après confirmation de votre e‑mail, vous serez redirigé pour créer votre premier projet.
          </p>

          {/* Lien connexion */}
          <p className="mt-6 text-sm text-white/70">
            Déjà un compte ?{' '}
            <Link href="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
