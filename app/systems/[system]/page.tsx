'use client'
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabaseClient';
import Back from '@/components/Back';

export default function SystemDetail() {
  const { system } = useParams<{system: string}>();
  const [sys, setSys] = useState<any>(null);
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => { (async () => {
    const { data: s }  = await supabase.from('systems').select('*').eq('id', system).single();
    const { data: sb } = await supabase.from('subsystems').select('*').eq('system_id', system).order('name');
    setSys(s); setSubs(sb ?? []);
  })(); }, [system]);

  if (!sys) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Back href="/systems" />
      <h1 className="text-3xl font-bold mt-2">{sys.name}</h1>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {subs.map(x => (
          <Link key={x.id} href={`/subsystems/${x.id}`} className="px-4 py-3 border rounded hover:bg-slate-50">
            {x.code ?? x.name}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Link href={`/subsystems/new?system_id=${sys.id}`} className="px-3 py-2 border rounded">
          + Ajouter un sous‑système
        </Link>
      </div>
    </div>
  );
}
