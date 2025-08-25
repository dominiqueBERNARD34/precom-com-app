'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

type Row = { id: string; physical_tag: string; denomination: string; system_name: string; is_cancelled?: boolean };

export default function SubsystemPage({ params }: { params: { id: string } }) {
  const id = params.id; // '__none__' = groupe "Sans sous‑système"
  const sp = useSearchParams();
  const system = sp.get('system') || undefined;

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let q = supabase
        .from('elements')
        .select('id, physical_tag, denomination, system_name, subsystem_id, is_cancelled');

      if (system) q = q.eq('system_name', system);
      if (id === '__none__') q = q.is('subsystem_id', null);
      else q = q.eq('subsystem_id', id);

      // Exclure les annulés de l'affichage (facultatif) :
      q = q.or('is_cancelled.is.null,is_cancelled.eq.false');

      const { data, error } = await q;
      if (error) console.error(error);

      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, [id, system]);

  return (
    <div style={{ padding: 16 }}>
      <h1>{id === '__none__' ? 'Sans sous‑système' : `Sous‑système ${id}`}</h1>
      {system && <p>Système : {system}</p>}

      {loading ? (
        <p>Chargement…</p>
      ) : rows.length === 0 ? (
        <p>Aucun élément.</p>
      ) : (
        <ul>
          {rows.map(r => (
            <li key={r.id}>
              <b>{r.physical_tag}</b> — {r.denomination}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
