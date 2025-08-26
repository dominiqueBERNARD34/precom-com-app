'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import Back from '@/components/Back';

export default function NewSystem() {
  const [name, setName] = useState('');
  const router = useRouter();

  const save = async () => {
    if (!name.trim()) return;
    const { data, error } = await supabase.from('systems')
      .insert({ name: name.trim() }).select().single();
    if (!error && data) router.push(`/systems/${data.id}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Back href="/systems" />
      <h1 className="text-2xl font-semibold mt-2">Nouveau système</h1>
      <input className="border rounded px-3 py-2 w-full mt-4"
             value={name} onChange={e=>setName(e.target.value)} placeholder="Nom du système"/>
      <button onClick={save} className="mt-4 px-4 py-2 border rounded">Enregistrer</button>
    </div>
  );
}
