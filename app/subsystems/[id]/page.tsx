'use client'
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import supabase from '@/lib/supabaseClient';
import Back from '@/components/Back';

export default function SubsystemHub() {
  const { id } = useParams<{id:string}>();
  const [row, setRow] = useState<any>(null);

  useEffect(() => { (async () => {
    const { data } = await supabase
      .from('subsystems')
      .select('*, systems!inner(id,name)')
      .eq('id', id).single();
    setRow(data);
  })(); }, [id]);

  if (!row) return null;

  const display = row.code ?? row.name;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Back href={`/systems/${row.system_id}`} />
      <p className="text-sm text-slate-600 mt-2">Système : {row.systems?.name}</p>
      <h1 className="text-3xl font-bold">{display}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <Link href={`/subsystems/${id}/phase/precomm`} className="border rounded p-4 hover:bg-slate-50">
          <h3 className="font-semibold">Pré‑commissioning</h3>
          <p className="text-sm text-slate-600">Contrôle conformité, Essais statiques</p>
        </Link>
        <Link href={`/subsystems/${id}/phase/comm`} className="border rounded p-4 hover:bg-slate-50">
          <h3 className="font-semibold">Commissioning</h3>
          <p className="text-sm text-slate-600">Tests fonctionnels, Mise en service opérationnel</p>
        </Link>
        <Link href={`/subsystems/${id}/phase/reserve`} className="border rounded p-4 hover:bg-slate-50">
          <h3 className="font-semibold">Réserves</h3>
          <p className="text-sm text-slate-600">Saisie / import des réserves</p>
        </Link>
      </div>
    </div>
  );
}
