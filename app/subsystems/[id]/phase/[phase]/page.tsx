'use client'
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import Back from '@/components/Back';
import ElementImport from '@/components/ElementImport';

const CATS: Record<string, {label:string, cats: ('conformity'|'static'|'functional'|'operational'|'reserve')[]}> = {
  precomm: { label: 'Pré‑commissioning', cats: ['conformity','static'] },
  comm:    { label: 'Commissioning',     cats: ['functional','operational'] },
  reserve: { label: 'Réserves',          cats: ['reserve'] }
};
const LABEL: Record<string,string> = {
  conformity:'Contrôle conformité',
  static:'Essais statiques',
  functional:'Tests fonctionnels',
  operational:'Mise en service opérationnel',
  reserve:'Réserves'
};

export default function PhasePage() {
  const { id, phase } = useParams<{id:string, phase:'precomm'|'comm'|'reserve'}>();
  const [sub, setSub] = useState<any>(null);
  const [elements, setElements] = useState<any[]>([]);

  const refresh = async () => {
    const { data: sb } = await supabase
      .from('subsystems').select('*, systems!inner(id,name)').eq('id', id).single();
    setSub(sb);
    const { data: el } = await supabase
      .from('elements').select('*').eq('subsystem_id', id).eq('phase', phase)
      .order('category', { ascending: true }).order('physical_tag');
    setElements(el ?? []);
  };

  useEffect(() => { refresh(); }, [id, phase]);
  if (!sub) return null;

  const cats = CATS[phase].cats;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Back href={`/subsystems/${id}`} />
      <h1 className="text-2xl font-semibold mt-2">
        {CATS[phase].label} — {sub.code ?? sub.name}
      </h1>

      {cats.map(cat => (
        <section key={cat} className="mt-6 border rounded p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{LABEL[cat]}</h2>
            <ElementImport subsystemId={id} systemId={sub.system_id} phase={phase} category={cat}/>
          </div>

          <ul className="mt-4 space-y-1">
            {elements.filter(e => e.category === cat).map(e => (
              <li key={e.id} className="border rounded px-3 py-2 flex justify-between">
                <span className="font-mono">{e.physical_tag}</span>
                <span className="flex-1 mx-3 truncate">{e.denomination}</span>
                {e.cancelled && <span className="text-xs text-red-600">annulé</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
