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

  // Auth form
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // New project form
  const [newName, setNewName] = useState('');

  // --- Auth state tracking
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      if (s) fetchProjects();
      else setProjects([]);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // --- Charger les projets de l’utilisateur connecté
  async function fetchProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('id,name')
      .order('created_at', { ascending: false });

    if (!error && data) setProjects(data as Project[]);
  }

  useEffect(() => {
    if (session && !projectId) fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, projectId]);

  // --- Auth: créer un compte ou se connecter
  async function handleAuth() {
    setBusy(true);
    const fn =
      authMode === 'signup'
        ? supabase.auth.signUp
        : supabase.auth.signInWithPassword;

    const { data, error } = await fn({ email, password });
    setBusy(false);

    if (error) {
      alert(error.message);
      return;
    }

    if (authMode === 'signup' && !data.user) {
      // Selon vos paramètres Supabase, l’email peut devoir être confirmé.
      alert('Vérifiez votre e‑mail pour confirmer votre compte.');
    }
  }

  // --- Créer un projet pour l’utilisateur courant
  async function createProject() {
    if (!newName.trim()) return;
    setBusy(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      setBusy(false);
      alert('Veuillez vous connecter.');
      return;
    }

    // Insertion directe (RLS attend tenant_id = auth.uid())
    const { data, error } = await supabase
      .from('projects')
      .insert({ name: newName, tenant_id: user.id })
      .select('id')
      .single();

    setBusy(false);

    if (error || !data) {
      alert(error?.message ?? 'Création de projet impossible');
      return;
    }

    router.replace(`/signup?plan=${encodeURIComponent(plan)}&project=${data.id}`);
  }

  // --- Utiliser un projet existant
  function chooseExisting(id: string) {
    router.replace(`/signup?plan=${encodeURIComponent(plan)}&project=${id}`);
  }

  // --- Étape 2: plan + project présents -> poursuivre l’inscription
  if (projectId) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <h1 className="text-3xl font-semibold mb-4">Inscription</h1>
        <p className="mb-6">
          Plan : <b>{plan}</b> • Projet :{' '}
          <code className="px-2 py-1 bg-slate-800 rounded">{projectId}</code>
        </p>

        {/* TODO : branchez ici votre suite (création compte, paiement ultérieur, ou redirection) */}
        <p className="text-slate-300">
          Votre projet est sélectionné. Vous pouvez maintenant créer vos systèmes ou importer votre Excel.
        </p>
      </div>
    );
  }

  // --- Étape 0: authentification
  if (!session) {
    return (
      <div className="max-w-md mx-auto py-12">
        <h1 className="text-3xl font-semibold mb-3">Choisissez un projet</h1>
        <p className="text-slate-300 mb-6">
          Plan sélectionné : <b>{plan}</b>. Commencez par vous connecter ou créer un compte.
        </p>

        <div className="rounded border border-slate-700 p-4">
          <div className="flex gap-2 mb-4">
            <button
              className={`px-3 py-1 rounded ${authMode === 'signup' ? 'bg-sky-600' : 'bg-slate-700'}`}
              onClick={() => setAuthMode('signup')}
            >
              Créer un compte
            </button>
            <button
              className={`px-3 py-1 rounded ${authMode === 'signin' ? 'bg-sky-600' : 'bg-slate-700'}`}
              onClick={() => setAuthMode('signin')}
            >
              Se connecter
            </button>
          </div>

          <label className="block mb-2 text-sm">E‑mail</label>
          <input
            className="w-full mb-3 bg-slate-800 border border-slate-600 rounded px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            placeholder="vous@exemple.com"
          />
          <label className="block mb-2 text-sm">Mot de passe</label>
          <input
            className="w-full mb-4 bg-slate-800 border border-slate-600 rounded px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
          />

          <button
            onClick={handleAuth}
            disabled={busy}
            className="w-full px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
          >
            {busy ? 'En cours…' : authMode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
          </button>
        </div>
      </div>
    );
  }

  // --- Étape 1: utilisateur connecté -> choisir ou créer un projet
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-3xl font-semibold mb-3">Choisissez un projet</h1>
      <p className="text-slate-300 mb-8">
        Plan sélectionné : <b>{plan}</b>. Sélectionnez un projet existant ou créez‑en un nouveau.
      </p>

      {projects.length > 0 && (
        <>
          <h2 className="font-medium mb-2">Projets existants</h2>
          <ul className="space-y-2 mb-8">
            {projects.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded border border-slate-700 p-3">
                <span>{p.name}</span>
                <button
                  onClick={() => chooseExisting(p.id)}
                  className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500"
                >
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
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom du projet"
            className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2"
          />
          <button
            onClick={createProject}
            disabled={busy}
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
          >
            {busy ? 'Création…' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}
