'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

type Subsystem = { id: string; code: string | null; name: string };

export default function SubsystemsPage() {
  const qs = useSearchParams();
  const systemId = qs.get('system');

  const [subs, setSubs] = useState<Subsystem[]>([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!systemId) return;
    const { data, error } = await supabase
      .from('subsystems')
      .select('id, code, name')
      .eq('system_id', systemId)
      .order('created_at', { ascending: false });
    if (!error) setSubs((data ?? []) as Subsystem[]);
  }

  useEffect(() => { load(); }, [systemId]);

  async function createSub() {
    if (!systemId || !name.trim()) return;
    setBusy(true);
    const { error } = await supabase.rpc('create_subsystem', {
      p_system_id: systemId, p_code: code || null, p_name: name
    });
    setBusy(false);
    if (error) { alert(error.message); return; }
    setCode(''); setName('');
    await load();
  }

  if (!systemId) return <div className="max-w-3xl mx-auto py-10">Paramètre <code>?system=…</code> manquant.</div>;

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-4">Sous‑systèmes</h1>
      <p className="text-slate-300 mb-6">Système : <code>{systemId}</code></p>

      <div className="mb-8 border border-slate-700 rounded p-4">
        <h2 className="font-medium mb-3">Nouveau sous‑système</h2>
        <div className="flex gap-2">
          <input placeholder="Code (A01.0, A02.0, …)" className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2"
                 value={code} onChange={e => setCode(e.target.value)} />
          <input placeholder="Nom (HTA‑HTB, BT, DCS, …)" className="flex-[2] bg-slate-800 border border-slate-600 rounded px-3 py-2"
                 value={name} onChange={e => setName(e.target.value)} />
          <button onClick={createSub} disabled={busy}
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50">
            {busy ? 'Création…' : 'Créer'}
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        {subs.map(s => (
          <li key={s.id} className="flex items-center justify-between border border-slate-700 rounded p-3">
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-slate-400 text-sm">Code : {s.code ?? '—'}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
