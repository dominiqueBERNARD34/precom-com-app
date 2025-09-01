'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import supabase from '@/lib/supabaseClient'; // votre client côté navigateur

type Project = { id: string; name: string };

export default function Client() {
  const router = useRouter();
  const params = useSearchParams();

  const plan = params.get('plan') ?? 'free';
  const projectId = params.get('project');

  const [projects, setProjects] = useState<Project[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  // Charger la liste des projets de l'utilisateur si aucun projet n'est passé en query
  useEffect(() => {
    if (!projectId) {
      supabase
        .from('projects')
        .select('id,name')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) setProjects(data as Project[]);
        });
    }
  }, [projectId]);

  async function createProject() {
    if (!newName.trim()) return;
    setLoading(true);

    // Récupère l'utilisateur pour alimenter tenant_id si nécessaire
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) {
      alert('Veuillez vous connecter.');
      setLoading(false);
      return;
    }

    // Si votre table projects a tenant_id, on le renseigne
    const { data, error } = await supabase
      .from('projects')
      .insert({ name: newName, tenant_id: user.id })
      .select('id')
      .single();

    setLoading(false);

    if (error || !data) {
      alert(error?.message ?? 'Création de projet impossible');
      return;
    }
    router.replace(`/signup?plan=${encodeURIComponent(plan)}&project=${data.id}`);
  }

  function useExistingProject(id: string) {
    router.replace(`/signup?plan=${encodeURIComponent(plan)}&project=${id}`);
  }

  // --- Étape 1 : choisir/créer un projet ---
  if (!projectId) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <h1 className="text-3xl font-semibold mb-3">Choisissez un projet</h1>
        <p className="text-slate-300 mb-8">
          Plan sélectionné : <b>{plan}</b>. Sélectionnez un projet existant ou créez‑en un nouveau.
        </p>

        {projects.length > 0 && (
          <>
            <h2 className="font-medium mb-2">Projets existants</h2>
            <ul className="space-y-2 mb-8">
              {projects.map(p => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded border border-slate-700 p-3"
                >
                  <span>{p.name}</span>
                  <button
                    onClick={() => useExistingProject(p.id)}
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
              onChange={e => setNewName(e.target.value)}
              placeholder="Nom du projet"
              className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2"
            />
            <button
              onClick={createProject}
              disabled={loading}
              className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? 'Création…' : 'Créer'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Étape 2 : l'URL contient plan + project -> on poursuit l’inscription ---
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-3xl font-semibold mb-4">Inscription</h1>
      <p className="mb-6">
        Plan sélectionné : <b>{plan}</b> • Projet :{' '}
        <code className="px-2 py-1 bg-slate-800 rounded">{projectId}</code>
      </p>

      {/* Mettez ici votre suite d’inscription / création de compte */}
      <p className="text-slate-300">
        (Suite de l’inscription ici… ou redirection vers la création de systèmes / import Excel.)
      </p>
    </div>
  );
}
