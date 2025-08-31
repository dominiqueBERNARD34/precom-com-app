'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

type System = { id:string; name:string };
type Subsystem = { id:string; name:string; system_id:string };

export default function SystemsPage() {
  const projectId = useSearchParams().get('project')!;
  const [systems, setSystems] = useState<System[]>([]);
  const [subs, setSubs] = useState<Subsystem[]>([]);
  const [newSys, setNewSys] = useState('');
  const [newSub, setNewSub] = useState('');
  const [currentSys, setCurrentSys] = useState<string>('');
  const [msg, setMsg] = useState<string>();

  async function load() {
    const { data: s, error: e1 } = await supabase.from('systems').select('id,name').eq('project_id', projectId).order('created_at');
    if (e1) { setMsg(e1.message); return; }
    setSystems(s || []);
    if (s?.length && !currentSys) setCurrentSys(s[0].id);

    const { data: sub, error: e2 } = await supabase.from('subsystems').select('id,name,system_id').eq('project_id', projectId).order('created_at');
    if (e2) { setMsg(e2.message); return; }
    setSubs(sub || []);
  }

  useEffect(()=>{ if(projectId) load(); },[projectId]);

  async function addSystem() {
    const { error } = await supabase.from('systems').insert({ project_id: projectId, name: newSys });
    if (error) { setMsg(error.message); return; }
    setNewSys(''); load();
  }

  async function addSub() {
    if (!currentSys) return;
    const { error } = await supabase.from('subsystems').insert({ project_id: projectId, system_id: currentSys, name: newSub });
    if (error) { setMsg(error.message); return; }
    setNewSub(''); load();
  }

  const subsOfCurrent = useMemo(()=>subs.filter(s=>s.system_id===currentSys),[subs,currentSys]);

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Systèmes du projet</h1>
      {msg && <p className="text-sm text-red-600">{msg}</p>}

      <section className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold mb-2">Systèmes</h2>
          <div className="flex gap-2 mb-3">
            <input value={newSys} onChange={e=>setNewSys(e.target.value)} placeholder="Nom du système"
                   className="border rounded px-3 py-2 flex-1" />
            <button onClick={addSystem} className="px-4 py-2 rounded bg-cyan-600 text-white">Ajouter</button>
          </div>

          <ul className="divide-y border rounded">
            {systems.map(s=>(
              <li key={s.id} onClick={()=>setCurrentSys(s.id)}
                  className={`p-3 cursor-pointer ${currentSys===s.id?'bg-cyan-50':''}`}>{s.name}</li>
            ))}
            {systems.length===0 && <li className="p-3 text-sm text-slate-500">Aucun système</li>}
          </ul>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Sous‑systèmes</h2>
          <div className="flex gap-2 mb-3">
            <input value={newSub} onChange={e=>setNewSub(e.target.value)} placeholder="Nom du sous‑système"
                   className="border rounded px-3 py-2 flex-1" />
            <button onClick={addSub} className="px-4 py-2 rounded bg-cyan-600 text-white">Ajouter</button>
          </div>

          <ul className="divide-y border rounded">
            {subsOfCurrent.map(ss=>(
              <li key={ss.id} className="p-3">{ss.name}</li>
            ))}
            {subsOfCurrent.length===0 && <li className="p-3 text-sm text-slate-500">Aucun sous‑système</li>}
          </ul>
        </div>
      </section>

      <div className="mt-8">
        <a className="text-cyan-600 underline" href={`/import?project=${projectId}`}>
          Importer systèmes / sous‑systèmes (Excel)
        </a>
      </div>
    </main>
  );
}
