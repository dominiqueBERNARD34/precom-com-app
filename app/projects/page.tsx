'use client';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';

type Project = { id: string; name: string };

export default function ProjectsPage() {
  const [list, setList] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState<string>();

  async function load() {
    await supabase.rpc('ensure_profile'); // crée profil si besoin
    const { data, error } = await supabase.from('projects').select('id,name').order('created_at');
    if (error) setMsg(error.message); else setList(data || []);
  }

  useEffect(() => { load(); }, []);

  async function add() {
    if (!name.trim()) return;
    const { error } = await supabase.from('projects').insert({ name, owner: (await supabase.auth.getUser()).data.user?.id });
    if (error) { setMsg(error.message); return; }
    setName(''); load();
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Mes projets</h1>

      <div className="flex gap-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nom du projet"
               className="border rounded px-3 py-2 flex-1" />
        <button onClick={add} className="px-4 py-2 rounded bg-cyan-600 text-white">Créer</button>
      </div>
   
      {msg && <p className="text-sm text-red-600">{msg}</p>}

      <ul className="divide-y border rounded">
        {list.map(p => (
          <li key={p.id} className="p-3 flex items-center justify-between">
            <span>{p.name}</span>
            <a className="text-cyan-600 underline" href={`/systems?project=${p.id}`}>Ouvrir</a>
          </li>
        ))}
        {list.length === 0 && <li className="p-3 text-sm text-slate-500">Aucun projet</li>}
      </ul>
    </main>
  );
}
