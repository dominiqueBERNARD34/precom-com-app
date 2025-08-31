'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';

const QUOTAS: Record<string, {max_projects:number; max_systems:number; max_ss:number}> = {
  free:     { max_projects: 1, max_systems: 1,  max_ss: 2  },
  starter:  { max_projects: 1, max_systems: 5,  max_ss: 5  },
  growth:   { max_projects: 2, max_systems: 10, max_ss: 10 },
  business: { max_projects: 3, max_systems: 20, max_ss: 15 },
  pro:      { max_projects: 5, max_systems: 25, max_ss: 25 },
};

export default function SignupPage() {
  const params = useSearchParams();
  const plan = (params.get('plan') || 'free').toLowerCase();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [msg, setMsg] = useState<string>();

  async function ensureProfileAndPlan() {
    // crée/MAJ profil + applique quotas
    const { error: e1 } = await supabase.rpc('ensure_profile');
    if (e1) throw e1;

    const q = QUOTAS[plan] ?? QUOTAS.free;
    const { error: e2 } = await supabase
      .from('profiles')
      .update({
        plan,
        max_projects: q.max_projects,
        max_systems: q.max_systems,
        max_subsystems_per_system: q.max_ss,
        billing_required: false, // on activera Stripe plus tard
      })
      .eq('id', (await supabase.auth.getUser()).data.user?.id);
    if (e2) throw e2;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('Création du compte…');

    const { data, error } = await supabase.auth.signUp({ email, password: pwd });
    if (error) { setMsg('Erreur: ' + error.message); return; }

    // session peut nécessiter validation email suivant ta conf
    await ensureProfileAndPlan();

    setMsg('Compte créé. Redirection…');
    router.push('/projects');        // on enchaîne directement sur les projets
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Inscription</h1>
      <p className="text-sm mt-1">Plan sélectionné : <b>{plan}</b></p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input required type="email" placeholder="Email"
               className="w-full border rounded px-3 py-2"
               value={email} onChange={e=>setEmail(e.target.value)} />
        <input required type="password" placeholder="Mot de passe"
               className="w-full border rounded px-3 py-2"
               value={pwd} onChange={e=>setPwd(e.target.value)} />
        <button className="px-4 py-2 rounded bg-cyan-600 text-white">Créer mon compte</button>
      </form>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </main>
  );
}
