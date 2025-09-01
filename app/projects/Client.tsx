// app/projects/Client.tsx
'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import Link from 'next/link';

type Project = { id: string; name: string; created_at: string };

export default function Client() {
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charge tenant_id depuis profiles -> puis charge les projets
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);

      const { data: userRes, error: errUser } = await supabase.auth.getUser();
      if (errUser) {
        setError(errUser.message);
        setLoading(false);
        return;
      }
      const user = userRes.user;
      if (!user) {
        setError("Vous n'êtes pas connecté.");
        setLoading(false);
        return;
      }

      const { data: profile, error: errProfile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (errProfile) {
        setError(errProfile.message);
        setLoading(false);
        return;
      }

      if (!profile) {
        setError("Profil introuvable. Connectez‑vous puis réessayez.");
        setLoading(false);
        return;
      }

      setTenantId(profile.tenant_id);

      const { data: projs, error: errProjs } = await supabase
        .from('projects')
        .select('id, name, created_at')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: true });

      if (errProjs) {
        setError(errProjs.message);
      } else {
        setProjects(projs ?? []);
      }
      setLoading(false);
    };
    run();
  }, []);

  const createProject = async () => {
    if (!tenantId) return;
    const name = newName.trim();
    if (!name) return;

    setCreating(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('projects')
      .insert([{ tenant_id: tenantId, name }])
      .select('id, name, created_at')
      .single();

    setCreating(false);

    if (err) {
      setError(err.message);
      return;
    }
    if (data) {
      setProjects((prev) => [...prev, data]);
      setNewName('');
    }
  };

  if (loading) {
    return <div className="opacity-70">Chargement…</div>;
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-900/30 border border-red-500 text-red-200 px-4 py-3">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-medium mb-4">Créer un projet</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-md border border-white/10 bg-black/30 px-3 py-2 outline-none"
            placeholder="Nom du projet"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            disabled={!tenantId || creating || !newName.trim()}
            onClick={createProject}
            className="rounded-md bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 px-4 py-2 text-black font-medium"
          >
            {creating ? 'Création…' : 'Créer'}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-medium mb-4">Mes projets</h2>
        {projects.length === 0 ? (
          <div className="opacity-70">Aucun projet pour l’instant.</div>
        ) : (
          <ul className="divide-y divide-white/10">
            {projects.map((p) => (
              <li key={p.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm opacity-60">
                    Créé le {new Date(p.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/systems?project=${p.id}`}
                    className="rounded-md bg-slate-700 hover:bg-slate-600 px-3 py-2 text-white text-sm"
                  >
                    Systèmes
                  </Link>
                  <Link
                    href={`/import?project=${p.id}`}
                    className="rounded-md bg-cyan-500 hover:bg-cyan-400 px-3 py-2 text-black text-sm font-medium"
                  >
                    Import Excel
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
