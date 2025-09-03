// components/AuthDialog.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseBrowser'; // <-- adapte ce chemin si besoin

type Mode = 'signup' | 'signin';
type Plan = 'free' | 'starter' | 'growth' | 'business' | 'pro';

export default function AuthDialog({ mode = 'signup' }: { mode?: Mode }) {
  const router = useRouter();
  const search = useSearchParams();

  // Valide proprement le plan reçu en query
  const planParam = (search.get('plan') || 'free').toLowerCase();
  const plan: Plan = (['free', 'starter', 'growth', 'business', 'pro'].includes(planParam)
    ? planParam
    : 'free') as Plan;

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  // Instancie le client Supabase (très important : appeler la factory)
  const supabase = React.useMemo(() => supabaseBrowser(), []);

  // URL de retour standardisée
  const callbackUrl = React.useMemo(
    () => `${window.location.origin}/auth/callback?plan=${plan}`,
    [plan]
  );

  function normalize(s: string) {
    return s.trim();
  }

  async function withGoogle() {
    setMsg(null);
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      });
      // Redirection prise en charge par Supabase/Google
    } catch (e: any) {
      setMsg(e?.message ?? 'Échec de la connexion avec Google.');
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const mail = normalize(email);
    const pass = password;

    if (!mail) {
      setMsg('Veuillez saisir une adresse e‑mail.');
      return;
    }
    if (mode === 'signup' && (!pass || pass.length < 6)) {
      setMsg('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (mode === 'signin' && !pass) {
      setMsg('Veuillez saisir votre mot de passe.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email: mail, password: pass });
        if (error) throw error;
        // Si la connexion réussit, on enchaîne sur le callback
        router.replace(`/auth/callback?plan=${plan}`);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: mail,
          password: pass,
          options: { emailRedirectTo: callbackUrl }
        });
        if (error) throw error;

        // Selon les policies Supabase :
        // - si "Confirm email" est désactivé, une session peut déjà exister -> on route.
        // - sinon, on demande la confirmation e-mail.
        if (data?.session) {
          router.replace(`/auth/callback?plan=${plan}`);
        } else {
          setMsg('Vérifiez votre e‑mail pour confirmer votre compte (lien d’activation envoyé).');
        }
      }
    } catch (e: any) {
      // Messages d’erreurs “propres”
      const message =
        e?.message?.includes('Invalid login credentials')
          ? 'Identifiants invalides.'
          : e?.message?.includes('User already registered')
          ? 'Un compte existe déjà avec cet e‑mail.'
          : e?.message ?? "Erreur d'authentification.";
      setMsg(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {msg && (
        <div className="mb-4 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
          {msg}
        </div>
      )}

      <button
        onClick={withGoogle}
        disabled={loading}
        className="mb-4 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white px-4 py-3 font-medium text-slate-900 shadow hover:bg-white/90 disabled:cursor-not-allowed"
      >
        <span>Continuer avec Google</span>
      </button>

      <div className="my-4 h-px w-full bg-white/10" />

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          name="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-cyan-400/50 disabled:opacity-60"
          autoComplete="email"
          disabled={loading}
          required
        />
        <input
          type="password"
          name="password"
          placeholder={mode === 'signup' ? 'Au moins 6 caractères' : 'Mot de passe'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-cyan-400/50 disabled:opacity-60"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          disabled={loading}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-900 shadow hover:bg-cyan-400 disabled:cursor-not-allowed"
        >
          {loading ? 'En cours…' : mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
        </button>
      </form>

      {/* Astuce: si tu veux un lien "Mot de passe oublié", ajoute la route /auth/reset et décommente :
      <div className="mt-3 text-center text-sm text-white/70">
        <a className="underline hover:text-white" href="/auth/reset">Mot de passe oublié ?</a>
      </div>
      */}
    </div>
  );
}
