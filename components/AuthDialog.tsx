'use client';

import { useMemo, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabaseBrowser';
import { useRouter } from 'next/navigation';

type Mode = 'signup' | 'signin';

export default function AuthDialog({
  open,
  onClose,
  plan,
  defaultMode = 'signup',
}: {
  open: boolean;
  onClose: () => void;
  plan: string;
  defaultMode?: Mode;
}) {
  const supabase = useMemo(() => createSupabaseBrowser(), []);
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  if (!open) return null;

  const site = typeof window !== 'undefined' ? window.location.origin : '';
  const next = `/projects/new?plan=${encodeURIComponent(plan || 'free')}`;
  const redirectTo = `${site}/auth/callback?next=${encodeURIComponent(next)}`;

  async function handleSignup() {
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.auth.signUp({
      email,
      password: pwd,
      options: {
        emailRedirectTo: redirectTo,
        data: { plan, preferred_language: 'fr' },
      },
    });
    setLoading(false);
    if (error) return setMsg(error.message);
    setMsg("✔️ Vérifiez votre e‑mail pour confirmer votre compte.");
  }

  async function handleSignin() {
    setLoading(true);
    setMsg(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pwd,
    });
    setLoading(false);
    if (error) return setMsg(error.message);
    if (data.session) {
      // Connecté → on part créer le projet
      router.replace(next);
      onClose();
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    setLoading(false);
    if (error) setMsg(error.message);
    // redirection externe gérée par Supabase
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
      <div
        className="w-full max-w-[520px] rounded-2xl bg-[#07121f] text-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-xl font-semibold">
            {mode === 'signup' ? "Inscription" : "Connexion"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1 text-sm text-white/70 hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-6">
          <div className="text-sm text-white/70">
            Plan sélectionné&nbsp;:
            <span className="ml-2 rounded-full bg-teal-500/20 px-2 py-0.5 text-teal-300">
              {plan || 'free'}
            </span>
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium hover:bg-white/10 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="-ml-1">
              <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.4-1.7 4.1-5.4 4.1-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.8 3.6 14.6 2.7 12 2.7 6.9 2.7 2.7 6.9 2.7 12s4.2 9.3 9.3 9.3c5.4 0 8.9-3.8 8.9-9.2 0-.6-.1-1.1-.1-1.6H12z"/>
            </svg>
            Continuer avec Google
          </button>

          <div className="relative my-2 flex items-center">
            <div className="h-px flex-1 bg-white/10" />
            <span className="px-3 text-xs text-white/40">ou</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid gap-4">
            <label className="grid gap-1 text-sm">
              <span className="text-white/70">E‑mail</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 outline-none ring-0 placeholder:text-white/40 focus:border-teal-400"
                placeholder="vous@domaine.com"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-white/70">Mot de passe</span>
              <input
                type="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 outline-none ring-0 placeholder:text-white/40 focus:border-teal-400"
                placeholder="Au moins 6 caractères"
              />
            </label>

            {msg && (
              <div className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-teal-200">
                {msg}
              </div>
            )}

            {mode === 'signup' ? (
              <button
                onClick={handleSignup}
                disabled={loading || !email || !pwd}
                className="rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-teal-400 disabled:opacity-60"
              >
                {loading ? 'Enregistrement…' : "Enregistrement"}
              </button>
            ) : (
              <button
                onClick={handleSignin}
                disabled={loading || !email || !pwd}
                className="rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-teal-400 disabled:opacity-60"
              >
                {loading ? 'Connexion…' : "Connexion"}
              </button>
            )}

            <p className="text-center text-xs text-white/50">
              {mode === 'signup' ? (
                <>
                  Déjà un compte ?{' '}
                  <button
                    onClick={() => setMode('signin')}
                    className="text-teal-300 underline-offset-2 hover:underline"
                  >
                    Se connecter
                  </button>
                </>
              ) : (
                <>
                  Nouveau ici ?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-teal-300 underline-offset-2 hover:underline"
                  >
                    Créer un compte
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
