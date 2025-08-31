'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

type System = { id: string; name: string; project_id: string };

export default function Client() {
  const params = useSearchParams();
  const projectId = params.get('project'); // si vous filtrez par projet
  const [rows, setRows] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;

    async function run() {
      setLoading(true);
      const query = supabase
        .from('systems')
        .select('id,name,project_id')
        .order('name', { ascending: true });

      const { data, error } = await query;
      if (!canceled) {
        if (!error) setRows(data ?? []);
        setLoading(false);
      }
    }
    run();
    return () => { canceled = true; };
  }, [projectId]);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Systèmes</h1>
      {loading ? <p>Chargement…</p> : (
        <ul className="space-y-2">
          {rows.map(s => (
            <li key={s.id} className="border rounded px-3 py-2">{s.name}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
