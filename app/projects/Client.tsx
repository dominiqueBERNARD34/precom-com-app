'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import Link from 'next/link';

type Project = { id: string; name: string; created_at: string };

export default function ProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setMsg(null);
    const { data, error } = await supabase
      .from('projects')
      .select('id,name,created_at')
      .order('created_at', { ascending: false });
    if (error) setMsg(error.message);
    else setProjects(data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    // Récupère l’utilisateur courant pour alimenter tenant_id
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMsg('Veuillez vous connecter.'); setLoading(false); return; }

    const { data, error } = await supabase
      .from('projects')
      .insert({ name: newName || 'Projet', tenant_id: user.id })
      .select('id')
      .single();

    setLoading(false);
    if (error) setMsg(error.message);
    else window.location.href = `/import?project=${data!.id}`;
  }

  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold">Mes projets</h1>
        <p className="text-slate-400 mt-2">Créez un projet puis importez systèmes / sous‑systèmes.</p>
      </div>

      <form onSubmit={createProject} className="flex gap-2">
        <input
          value={newName} onChange={e=>setNewName(e.target.value)}
          placeholder="Nom du projet"
          className="flex-1 border rounded px-3 py-2 bg-white/90 text-black"
        />
        <button disabled={loading} className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white">
          {loading ? 'Création...' : 'Créer'}
        </button>
      </form>
      {msg && <p className="text-red-400">{msg}</p>}

      <ul className="divide-y divide-white/10">
        {projects.map(p => (
          <li key={p.id} className="py-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-slate-400">{new Date(p.created_at).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              <Link className="underline" href={`/import?project=${p.id}`}>Importer</Link>
              <Link className="underline" href={`/systems?project=${p.id}`}>Systèmes</Link>
            </div>
          </li>
        ))}
        {projects.length === 0 && <li className="py-6 text-slate-400">Aucun projet.</li>}
      </ul>
    </div>
  );
}
