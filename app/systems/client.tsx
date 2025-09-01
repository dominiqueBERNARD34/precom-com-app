'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

type System = { id: string; name: string };

export default function SystemsClient() {
  const sp = useSearchParams();
  const project = sp.get('project');
  const [items, setItems] = useState<System[]>([]);

  useEffect(() => {
    if (!project) return;
    supabase.from('systems').select('id,name').eq('project_id', project).order('name')
      .then(({ data }) => setItems(data ?? []));
  }, [project]);

  if (!project) return <p className="text-slate-400">Ajoutez `?project=...` dans l’URL ou passez par la page Projets.</p>;

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Systèmes</h1>
      <ul className="space-y-2">
        {items.map(s => <li key={s.id} className="px-3 py-2 rounded bg-white/5">{s.name}</li>)}
        {items.length === 0 && <li className="text-slate-400">Aucun système pour ce projet.</li>}
      </ul>
    </div>
  );
}
