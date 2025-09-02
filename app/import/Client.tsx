'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import supabase from '@/lib/supabaseClient';

type Row = {
  system_code?: string; system_name?: string;
  subsystem_code?: string; subsystem_name?: string;
};

export default function ImportPage() {
  const qs = useSearchParams();
  const router = useRouter();
  const projectId = qs.get('project');

  const [projects, setProjects] = useState<{id: string; name: string}[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('projects').select('id,name').order('created_at',{ascending:false});
      setProjects(data ?? []);
    })();
  }, []);

  function addLog(s: string) { setLog(prev => [...prev, s]); }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const wb = XLSX.read(reader.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<any>(ws, { defval: '' }) as any[];
      // normaliser les colonnes
      const norm = (k: string) => k.trim().toLowerCase();
      const mapped: Row[] = json.map(o => {
        const m: any = {};
        for (const [k, v] of Object.entries(o)) m[norm(k)] = (v ?? '').toString().trim();
        return {
          system_code: m['system_code'] ?? m['code_system'] ?? m['systeme_code'],
          system_name: m['system_name'] ?? m['nom_system'] ?? m['systeme_nom'],
          subsystem_code: m['subsystem_code'] ?? m['code_subsystem'] ?? m['sous_systeme_code'],
          subsystem_name: m['subsystem_name'] ?? m['nom_subsystem'] ?? m['sous_systeme_nom'],
        };
      }).filter(r => r.system_name && r.subsystem_name);
      setRows(mapped);
      setLog([]);
    };
    reader.readAsArrayBuffer(f);
  }

  const systemsByCode = useMemo(() => {
    const map = new Map<string,string>(); // code -> id après création
    return map;
  }, []);

  async function runImport() {
    if (!projectId) { alert('Choisissez d’abord un projet'); return; }
    if (!rows.length) { alert('Chargez un fichier Excel'); return; }

    setRunning(true); setLog([]);
    try {
      // 1) Créer tous les systèmes uniques
      const sysKey = (r: Row) => (r.system_code ?? r.system_name ?? '').trim();
      const unique = Array.from(new Map(
        rows.map(r => [sysKey(r), r])
      ).values());

      addLog(`Création des systèmes (uniques): ${unique.length}`);
      for (const r of unique) {
        const code = r.system_code || null;
        const name = r.system_name || '(Sans nom)';
        const { data, error } = await supabase.rpc('create_system', {
          p_project_id: projectId, p_code: code, p_name: name
        });
        if (error) { addLog(`❌ Système "${name}" : ${error.message}`); continue; }
        const id = (Array.isArray(data) ? data[0]?.id : (data as any)?.id) as string;
        if (id) systemsByCode.set(sysKey(r), id);
        addLog(`✅ Système "${name}"`);
      }

      // 2) Créer les sous-systèmes
      addLog(`Création des sous-systèmes: ${rows.length}`);
      for (const r of rows) {
        const key = sysKey(r);
        const systemId = systemsByCode.get(key);
        if (!systemId) { addLog(`❌ Pas d’id système pour ${r.system_name}`); continue; }
        const code = r.subsystem_code || null;
        const name = r.subsystem_name || '(Sans nom)';
        const { error } = await supabase.rpc('create_subsystem', {
          p_system_id: systemId, p_code: code, p_name: name
        });
        if (error) { addLog(`❌ Sous-système "${name}" : ${error.message}`); continue; }
        addLog(`✅ Sous-système "${name}"`);
      }

      addLog('🎉 Import terminé');
    } finally {
      setRunning(false);
    }
  }

  if (!projectId) {
    return (
      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-2xl font-semibold mb-4">Import Excel</h1>
        <p className="mb-4">Choisissez un projet :</p>
        <ul className="space-y-2">
          {projects.map(p => (
            <li key={p.id} className="flex items-center justify-between border border-slate-700 rounded p-3">
              <span>{p.name}</span>
              <button
                onClick={() => router.replace(`/import?project=${p.id}`)}
                className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500">Ouvrir</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-2">Import Excel</h1>
      <p className="text-slate-300 mb-6">Projet : <code>{projectId}</code></p>

      <div className="mb-6 border border-slate-700 rounded p-4">
        <p className="mb-2 text-sm text-slate-300">
          Colonnes attendues : <code>system_code</code>, <code>system_name</code>, <code>subsystem_code</code>, <code>subsystem_name</code>.
        </p>
        <input type="file" accept=".xlsx,.xls" onChange={onFile}
               className="block w-full text-sm file:mr-4 file:py-2 file:px-3 file:rounded file:border-0 file:bg-sky-600 file:text-white" />
      </div>

      <div className="mb-6 flex gap-2">
        <button onClick={runImport} disabled={running || rows.length===0}
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50">
          {running ? 'Import…' : 'Importer'}
        </button>
        <span className="text-slate-400 text-sm self-center">
          {rows.length ? `${rows.length} lignes prêtes` : 'Aucun fichier chargé'}
        </span>
      </div>

      <pre className="bg-slate-900 p-3 rounded text-sm whitespace-pre-wrap">
        {log.join('\n')}
      </pre>
    </div>
  );
}
