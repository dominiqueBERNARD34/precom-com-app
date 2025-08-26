'use client'
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import Back from '@/components/Back';

export default function NewSubsystem() {
  const sp = useSearchParams();
  const preSystem = sp.get('system_id') ?? '';
  const [systems, setSystems] = useState<any[]>([]);
  const [systemId, setSystemId] = useState(preSystem);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const router = useRouter();

  useEffect(() => { (async () => {
    const { data } = await supabase.from('systems').select('id,name').order('name');
    setSystems(data ?? []);
  })(); }, []);

  const save = async () => {
    if (!systemId || !name.trim()) return;
    const row = { system_id: systemId, name: name.trim(), code: code.trim() || null };
    const { data, error } = await supabase.from('subsystems').insert(row).select().single();
    if (!error && data) router.push(`/systems/${systemId}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Back href={systemId ? `/systems/${systemId}` : '/systems'} />
      <h1 className="text-2xl font-semibold mt-2">Nouveau sous‑système</h1>

      <label className="block mt-4 text-sm">Système</label>
      <select className="border rounded px-3 py-2 w-full" value={systemId}
              onChange={e=>setSystemId(e.target.value)}>
        <option value="">— Choisir —</option>
        {systems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      <label className="block mt-4 text-sm">Libellé sous‑système</label>
      <input className="border rounded px-3 py-2 w-full" value={name}
             onChange={e=>setName(e.target.value)} placeholder="ex. BT"/>

      <label className="block mt-4 text-sm">Code (optionnel)</label>
      <input className="border rounded px-3 py-2 w-full" value={code}
             onChange={e=>setCode(e.target.value)} placeholder="ex. A01‑0"/>

      <button onClick={save} className="mt-4 px-4 py-2 border rounded">Enregistrer</button>
    </div>
  );
}
