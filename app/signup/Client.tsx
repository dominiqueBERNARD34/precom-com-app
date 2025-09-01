'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import supabase from '@/lib/supabaseClient';

type Project = { id: string; name: string };

export default function Client() {
  const router = useRouter();
  const qs = useSearchParams();
  const plan = qs.get('plan') ?? 'free';
  const projectId = qs.get('project');

  const [session, setSession] = useState<Session | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [busy, setBusy] = useState(false);

  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newName, setNewName] = useState('');

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Quand connecté : appliquer la formule + charger projets
  useEffect(() => {
    (async () => {
      if (!session) return;
      await supabase.rpc('set_user_plan', { p_plan: plan as any }); // inoffensif si déjà fait
      await fetchProjects();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function fetchProjects() {
    const { data } = await supabase.from('projects').select('id,name').order('created_at', { ascending: false });
    setProjects((data ?? []) as Project[]);
  }

  // Auth
  async function handleAuth() {
    setBusy(true);
    try {
      if (authMode === 'signup') {
        const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/signup?plan=${plan}`)}`;
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo }
        });
        if (error) throw error;
        alert('Vérifiez votre e‑mail pour confirmer votre compte.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: any) {
      alert(e.message ?? 'Erreur d’authentification');
    } finally {
      setBusy(false);
    }
  }

  // Création projet avec quota côté base
  async function createProject() {
    if (!newName.trim()) return;
    setBusy(true);
    const { data, error } = await supabase.rpc('create_project', { p_name: newName });
    setBusy(false);
    if (error || !data) {
      alert(error?.message ?? 'Création impossible (quota atteint ?)');
      return;
    }
    const id = (Array.isArray(data) ? data[0]?.id : (data as any).id) as string;
    router.replace(`/signup?plan=${encodeURIComponent(plan)}&project=${id}`);
  }

  function chooseExisting(id: string) {
    router.replace(`/signup?plan=${encodeURIComponent(plan)}&project=${id}`);
  }

  // Suite (project sélectionné)
  if (projectId) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <h1 className="text-3xl font-semibold mb-4">Inscription</h1>
        <p className="mb-6">
          Plan : <b>{plan}</b> • Projet :{' '}
          <code className="px-2 py-1 bg-slate-800 rounded">{projectId}</code>
        </p>
        <p className="text-slate-300">
          ✅ Compte validé & quotas appliqués. Vous pouvez maintenant créer vos systèmes
          ou importer votre Excel (menu <b>Systèmes</b> / <b>Import</b>).
        </p>
      </div>
    );
  }

  // Auth requis
  if (!session) {
    return (
      <div className="max-w-md mx-auto py-12">
        <h1 className="text-3xl font-semibold mb-3">Choisissez un projet</h1>
        <p className="text-slate-300 mb-6">Plan sélectionné : <b>{plan}</b></p>

        <div className="rounded border border-slate-700 p-4">
          <div className="flex gap-2 mb-4">
            <button className={`px-3 py-1 rounded ${authMode === 'signup' ? 'bg-sky-600' : 'bg-slate-700'}`}
                    onClick={() => setAuthMode('signup')}>Créer un compte</button>
            <button className={`px-3 py-1 rounded ${authMode === 'signin' ? 'bg-sky-600' : 'bg-slate-700'}`}
                    onClick={() => setAuthMode('signin')}>Se connecter</button>
          </div>

          <label className="block mb-2 text-sm">E‑mail</label>
          <input className="w-full mb-3 bg-slate-800 border border-slate-600 rounded px-3 py-2"
                 value={email} onChange={e => setEmail(e.target.value)} type="email" />

          <label className="block mb-2 text-sm">Mot de passe</label>
          <input className="w-full mb-4 bg-slate-800 border border-slate-600 rounded px-3 py-2"
                 value={password} onChange={e => setPassword(e.target.value)} type="password" />

          <button onClick={handleAuth} disabled={busy}
                  className="w-full px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50">
            {busy ? 'En cours…' : authMode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
          </button>
        </div>
      </div>
    );
  }

  // Choisir/créer un projet
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-3xl font-semibold mb-3">Choisissez un projet</h1>
      <p className="text-slate-300 mb-8">Plan sélectionné : <b>{plan}</b></p>

      {projects.length > 0 && (
        <>
          <h2 className="font-medium mb-2">Projets existants</h2>
          <ul className="space-y-2 mb-8">
            {projects.map(p => (
              <li key={p.id} className="flex items-center justify-between rounded border border-slate-700 p-3">
                <span>{p.name}</span>
                <button onClick={() => chooseExisting(p.id)} className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500">
                  Utiliser
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="rounded border border-slate-700 p-4">
        <h2 className="font-medium mb-3">Nouveau projet</h2>
        <div className="flex gap-2">
          <input className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2"
                 value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom du projet" />
          <button onClick={createProject} disabled={busy}
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50">
            {busy ? 'Création…' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}
