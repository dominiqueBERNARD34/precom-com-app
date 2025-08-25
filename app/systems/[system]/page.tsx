'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

type SS = { id: string; name: string; count: number };

export default function SystemDetail({ params }: { params: { system: string } }) {
  const system = decodeURIComponent(params.system);
  const [list, setList] = useState<SS[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('elements')
        .select('id, system_name, subsystem_id, subsystems(id,name), is_cancelled')
        .eq('system_name', system);

      if (error) {
        console.error(error);
        setList([]);
        setLoading(false);
        return;
      }

      const map = new Map<string, SS>();

      for (const r of data ?? []) {
        // Si tu veux exclure les éléments annulés du comptage :
        if ((r as any).is_cancelled === true) continue;

        const rel = (r as any).subsystems as { id: string; name: string } | null;
        const key = rel?.id ?? '__none__';
        const label = rel?.name ?? 'Sans sous‑système';

        if (!map.has(key)) map.set(key, { id: key, name: label, count: 0 });
        map.get(key)!.count++;
      }

      setList(Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    })();
  }, [system]);

  return (
    <div style={{ padding: 16 }}>
      <h1>Système {system}</h1>

      {loading ? (
        <p>Chargement…</p>
      ) : list.length === 0 ? (
        <p>Aucun sous‑système.</p>
      ) : (
        <ul>
          {list.map(ss => (
            <li key={ss.id} style={{ margin: '8px 0' }}>
              <a href={`/subsystems/${ss.id}?system=${encodeURIComponent(system)}`}>
                {ss.name} <span style={{ opacity: 0.6 }}>({ss.count})</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
