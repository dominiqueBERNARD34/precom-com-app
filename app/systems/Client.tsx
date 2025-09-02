'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

type System = { id: string; code: string | null; name: string };

export default function SystemsPage() {
  const qs = useSearchParams();
  const router = useRouter();
  const projectId = qs.get('project');

  const [systems, setSystems] = useState<System[]>([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [projects, setProjects] = useState<{id: string; name: string}[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('projects').select('id,name').order('created_at', { ascending: false });
      setProjects(data ?? []);
    })();
  }, []);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      const { data, error } = await supabase
        .from('systems')
        .select('id, code, name')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (!error) setSystems((data ?? []) as System[]);
    })();
  }, [projectId]);

  async function createSystem() {
    if (!projectId || !name.trim()) return;
    setBusy(true);
    const { data, error } = await supabase.rpc('create_system', {
      p_project_id: projectId, p_code: code || null, p_name: name
    });
    setBusy(false);
    if (error || !data) {
      alert(error?.message ?? 'Impossible de créer le système');
      return;
    }
    setCode(''); setName('');
    router.refresh();
  }

  if (!projectId) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-2xl font-semibold mb-4">Systèmes</h1>
        <p className="mb-4">Choisissez un projet :</p>
        <ul className="space-y-2">
          {projects.map(p => (
            <li key={p.id} className="flex items-center justify-between border border-slate-700 rounded p-3">
              <span>{p.name}</span>
              <button
                onClick={() => router.replace(`/systems?project=${p.id}`)}
                className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500">Ouvrir</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-4">Systèmes</h1>
      <p className="text-slate-300 mb-6">Projet : <code>{projectId}</code></p>

      <div className="mb-8 border border-slate-700 rounded p-4">
        <h2 className="font-medium mb-3">Nouveau système</h2>
        <div className="flex gap-2">
          <input placeholder="Code (A, B, …)" className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2"
                 value={code} onChange={e => setCode(e.target.value)} />
          <input placeholder="Nom (ELECTRICITE, DCS, …)" className="flex-[2] bg-slate-800 border border-slate-600 rounded px-3 py-2"
                 value={name} onChange={e => setName(e.target.value)} />
          <button onClick={createSystem} disabled={busy}
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50">
            {busy ? 'Création…' : 'Créer'}
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        {systems.map(s => (
          <li key={s.id} className="flex items-center justify-between border border-slate-700 rounded p-3">
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-slate-400 text-sm">Code : {s.code ?? '—'}</div>
            </div>
            <a href={`/subsystems?system=${s.id}`} className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500">Sous‑systèmes</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
