'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';
import * as XLSX from 'xlsx';

type Row = { system_name: string; subsystem_code?: string; subsystem_name?: string };
type Project = { id: string; name: string };

const NO_SS_CODE = '__NO_SS__';
const NO_SS_NAME = 'Sans sous-système';

const ALIASES: Record<string, string[]> = {
  system_name:    ['system','système','sys','system name','nom systeme', 'systeme'],
  subsystem_code: ['sub-system','subsystem','sous-système','ss','code ss','ss code','code'],
  subsystem_name: ['sub-system name','subsystem name','nom ss','libellé ss','libelle ss']
};

const norm = (s:any) => String(s ?? '').trim().toLowerCase();
const mapHeader = (h: string) => {
  const k = norm(h);
  for (const [dst, list] of Object.entries(ALIASES)) {
    if ((list as string[]).some((x) => norm(x) === k)) return dst;
  }
  return k;
};

export default function ImportPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // charge projets
    supabase.from('projects').select('id,name').order('created_at', { ascending: false })
      .then(({ data }) => setProjects(data ?? []));
    // sélection automatique depuis ?project=...
    const sp = new URLSearchParams(window.location.search);
    const p = sp.get('project');
    if (p) setProjectId(p);
  }, []);

  async function read(f: File) {
    const buf = await f.arrayBuffer();
    const wb  = XLSX.read(buf, { type:'array' });
    const ws  = wb.Sheets[wb.SheetNames[0]];
    const js  = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });

    const mapped = js.map(r => {
      const o: Record<string, any> = {};
      Object.entries(r).forEach(([k,v]) => o[mapHeader(k)] = v);
      return o;
    }).map(r => ({
      system_name:    String(r.system_name || '').trim(),
      subsystem_code: String(r.subsystem_code || '').trim(),
      subsystem_name: String(r.subsystem_name || '').trim()
    })).filter(r => r.system_name);

    // Normalisation
    mapped.forEach(r => {
      if (!r.subsystem_code && !r.subsystem_name) {
        r.subsystem_code = NO_SS_CODE;
        r.subsystem_name = NO_SS_NAME;
      }
      if (r.subsystem_code && !r.subsystem_name) r.subsystem_name = r.subsystem_code;
    });

    setRows(mapped); setMsg(null);
  }

  async function importNow() {
    if (!projectId) return setMsg('Choisissez un projet.');
    if (!rows.length) return setMsg('Aucune ligne lue.');

    setLoading(true); setMsg('Import en cours…');

    // 1) upsert systems
    const systemsList = Array.from(new Set(rows.map(r => r.system_name)))
      .map(name => ({ project_id: projectId, name }));

    const { error: e1 } = await supabase
      .from('systems')
      .upsert(systemsList, { onConflict: 'project_id,name', ignoreDuplicates: true });
    if (e1) { setLoading(false); return setMsg('Erreur systèmes: ' + e1.message); }

    const { data: systems } = await supabase
      .from('systems').select('id,name').eq('project_id', projectId);
    const byName = new Map(systems?.map(s => [s.name, s.id]));

    // 2) upsert subsystems
    const subsPayload = Array.from(new Map(rows.map(r => {
      const key = `${r.system_name}__${r.subsystem_name}`;
      return [key, {
        project_id: projectId,
        system_id:  byName.get(r.system_name)!,
        name:       r.subsystem_name!,
        code:       r.subsystem_code || null
      }];
    })).values());

    const { error: e2 } = await supabase
      .from('subsystems')
      .upsert(subsPayload, { onConflict: 'project_id,system_id,name', ignoreDuplicates: true });

    setLoading(false);
    if (e2) return setMsg('Erreur sous-systèmes: ' + e2.message);
    setMsg(`OK – ${systemsList.length} système(s) et ${subsPayload.length} sous‑système(s) mis à jour.`);
  }

  return (
    <main className="max-w-4xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Import Systèmes / Sous‑systèmes</h1>

      <label className="block">
        <span className="text-sm text-slate-400">Projet</span>
        <select
          className="mt-1 w-full border rounded px-3 py-2 bg-white/90 text-black"
          value={projectId} onChange={e=>setProjectId(e.target.value)}
        >
          <option value="">— Sélectionner —</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>

      <label className="inline-block px-3 py-2 border rounded cursor-pointer">
        Choisir un fichier Excel
        <input type="file" className="hidden" accept=".xlsx,.xls"
               onChange={(e)=> e.target.files && read(e.target.files[0])}/>
      </label>

      {!!rows.length && (
        <>
          <button
            onClick={importNow}
            disabled={loading}
            className="px-4 py-2 border rounded bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {loading ? 'Import…' : 'Importer'}
          </button>

          <details className="mt-3">
            <summary className="cursor-pointer">Voir les 10 premières lignes</summary>
            <pre className="text-xs bg-slate-900/40 p-2 rounded mt-2 overflow-auto">
{JSON.stringify(rows.slice(0,10), null, 2)}
            </pre>
          </details>
        </>
      )}

      {msg && <p className="mt-3">{msg}</p>}
    </main>
  );
}
