'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type Mode = 'signup' | 'signin';
export default function AuthDialog({ mode = 'signup' }: { mode?: Mode }) {
  const router = useRouter();
  const search = useSearchParams();
  const plan = (search.get('plan') || 'free') as 'free'|'starter'|'growth'|'business'|'pro';

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  const supabase = supabaseBrowser;

  async function withGoogle() {
    setMsg(null);
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?plan=${plan}`,
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      });
    } catch (e: any) {
      setMsg(e?.message ?? 'Échec Google');
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(`/auth/callback?plan=${plan}`);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?plan=${plan}`
          }
        });
        if (error) throw error;
        setMsg('Vérifiez votre e‑mail pour confirmer votre compte.');
      }
    } catch (e: any) {
      setMsg(e?.message ?? "Erreur d'authentification");
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
        className="mb-4 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white px-4 py-3 font-medium text-slate-900 shadow hover:bg-white/90"
      >
        <span>Continuer avec Google</span>
      </button>

      <div className="my-4 h-px w-full bg-white/10" />

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-cyan-400/50"
          autoComplete="email"
        />
        <input
          type="password"
          placeholder={mode === 'signup' ? 'Au moins 6 caractères' : 'Mot de passe'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-cyan-400/50"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-900 shadow hover:bg-cyan-400 disabled:cursor-not-allowed"
        >
          {loading ? 'En cours…' : mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
