'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import Back from '@/components/Back';

type System = { id: string; name: string };
type Sub = { id: string; system_id: string; name: string; code: string|null };

export default function SystemsPage() {
  const [systems, setSystems] = useState<System[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);

  useEffect(() => { (async () => {
    const { data: sys } = await supabase.from('systems').select('id,name').order('name');
    const { data: sb }  = await supabase.from('subsystems').select('id,system_id,name,code').order('name');
    setSystems(sys ?? []); setSubs(sb ?? []);
  })(); }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Back href="/" />
      <h1 className="text-3xl font-bold mt-2">Systèmes</h1>

      <div className="space-y-6 mt-6">
        {systems.map(s => (
          <section key={s.id} className="border rounded p-4">
            <h2 className="font-semibold text-xl">{s.name}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {subs.filter(x => x.system_id === s.id).map(x => (
                <Link key={x.id} href={`/subsystems/${x.id}`}
                  className="px-3 py-1 rounded border hover:bg-slate-50">
                  {x.code ?? x.name}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 flex gap-3">
        <Link href="/systems/new" className="px-3 py-2 border rounded">
          + Ajouter un système
        </Link>
      </div>
    </div>
  );
}
