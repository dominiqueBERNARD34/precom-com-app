// app/signup/Client.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabaseBrowser';

const googleIcon = (
  <svg className="h-5 w-5" viewBox="0 0 533.5 544.3" aria-hidden="true">
    <path fill="#EA4335" d="M533.5 278.4c0-18.6-1.7-36.6-5-54H272.1v102.3h146.9c-6.3 34.1-25.4 63-54.2 82.1v68.2h87.5c51.3-47.3 81.2-117.2 81.2-198.6z"/>
    <path fill="#34A853" d="M272.1 544.3c73.2 0 134.7-24.2 179.6-65.3l-87.5-68.2c-24.3 16.3-55.5 25.9-92.1 25.9-70.8 0-130.8-47.7-152.3-111.7H29.9v70.1c44.6 88.2 136.1 149.2 242.2 149.2z"/>
    <path fill="#4A90E2" d="M119.8 324.9c-10.9-32.7-10.9-68.1 0-100.8V154H29.9c-41.9 83.8-41.9 183.6 0 267.3l89.9-96.4z"/>
    <path fill="#FBBC05" d="M272.1 106.9c39.8-.6 78.2 14.1 107.3 41.2l80.5-80.5C412.2 24.2 350.5-.1 272.1 0 166 0 74.5 61 29.9 149.1l89.9 70.1c21.6-64 81.6-112.1 152.3-112.3z"/>
  </svg>
);

type Props = { initialPlan?: string };

export default function Client({ initialPlan = 'free' }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowser(), []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const plan =
    ['free', 'starter', 'growth', 'business', 'pro'].includes(initialPlan)
      ? initialPlan
      : 'free';

  const redirectAfterAuth = () =>
    `${location.origin}/auth/callback?next=/projects/new?plan=${plan}`;

  async function onGoogle() {
    setBusy(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectAfterAuth() },
    });
    // Redirection faite par Supabase
  }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectAfterAuth() },
    });
    setBusy(false);
    if (error) {
      alert(error.message);
      return;
    }
    alert('Vérifiez votre e‑mail pour confirmer votre compte.');
    router.refresh();
  }

  return (
    <section className="mt-8 flex items-start justify-center">
      <div className="w-full max-w-md rounded-2xl bg-[#0E1A2C]/70 ring-1 ring-white/10 p-6 sm:p-8 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-white/70">
            Plan sélectionné : <span className="font-semibold text-white">{plan}</span>
          </p>
          <span className="inline-flex items-center rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand">
            Inscription
          </span>
        </div>

        <div className="space-y-4">
          <button
            onClick={onGoogle}
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white text-[#1F2937] hover:bg-gray-50 px-4 py-2.5 font-medium transition-colors disabled:opacity-60"
          >
            {googleIcon}
            Continuer avec Google
          </button>

          <div className="relative my-2 flex items-center">
            <span className="h-px flex-1 bg-white/10" />
            <span className="mx-3 text-xs uppercase tracking-wider text-white/40">
              ou
            </span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form className="space-y-3" onSubmit={onRegister}>
            <div>
              <label className="mb-1 block text-sm text-white/70">E‑mail</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-white/5 px-3 py-2 text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/70">
                Mot de passe
              </label>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-white/5 px-3 py-2 text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Au moins 6 caractères"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-lg bg-brand px-4 py-2.5 font-semibold text-[#06202A] hover:brightness-110 transition disabled:opacity-60"
            >
              Enregistrement
            </button>
          </form>

          <p className="pt-2 text-xs text-white/50">
            Après confirmation de votre e‑mail, vous serez redirigé pour créer
            votre premier projet ({plan}).
          </p>
        </div>
      </div>

      <aside className="ml-8 hidden lg:block text-sm text-white/50">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="mb-2 font-semibold text-white">Déjà un compte ?</p>
          <a
            href="/login"
            className="rounded-md border border-white/15 px-3 py-1.5 text-white/80 hover:bg-white/10"
          >
            Se connecter
          </a>
        </div>
      </aside>
    </section>
  );
}
