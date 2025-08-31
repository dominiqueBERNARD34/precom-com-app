'use client';

import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import supabase from '@/lib/supabaseClient';

type Row = { system_name: string; subsystem_code?: string; subsystem_name?: string };
type Project = { id: string; name: string };

const NO_SS_CODE = '__NO_SS__';
const NO_SS_NAME = 'Sans sous-système';

const ALIASES: Record<string, string[]> = {
  system_name:    ['system','système','sys','system name','nom systeme'],
  subsystem_code: ['sub-system','subsystem','sous-système','ss','code ss','ss code','code'],
  subsystem_name: ['sub-system name','subsystem name','nom ss','libellé ss','libelle ss']
};

const norm = (s: any) => String(s ?? '').trim().toLowerCase();
const mapHeader = (h: string) => {
  const k = norm(h);
  for (const [dst, list] of Object.entries(ALIASES)) {
    if ((list as string[]).some((x: string) => norm(x) === k)) return dst;
  }
  return k;
};

export default function ImportByProject() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState<string>();

  // Charge la liste de projets du user connecté (via RLS owner = auth.uid())
  useEffect(() => {
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return;
      const { data: proj, error } = await supabase
        .from('projects')
        .select('id,name')
        .order('name');
      if (!error) setProjects(proj ?? []);
    })();
  }, []);

  async function readFile(f: File) {
    const buf = await f.arrayBuffer();
    const wb  = XLSX.read(buf, { type: 'array' });
    const ws  = wb.Sheets[wb.SheetNames[0]];
    const js  = XLSX.utils.sheet_to_json<any>(ws, { defval: '' });

    const mapped = js.map((r: any) => {
      const o: any = {};
      Object.entries(r).forEach(([k, v]) => o[mapHeader(k)] = v);
      return o;
    }).map((r: any) => ({
      system_name:    String(r.system_name || '').trim(),
      subsystem_code: String(r.subsystem_code || '').trim(),
      subsystem_name: String(r.subsystem_name || '').trim(),
    })).filter((r: Row) => r.system_name);

    // Sans SS → groupe "Sans sous-système"
    mapped.forEach((r: Row) => {
      if (!r.subsystem_code && !r.subsystem_name) {
        r.subsystem_code = NO_SS_CODE;
        r.subsystem_name = NO_SS_NAME;
      }
      if (r.subsystem_code && !r.subsystem_name) r.subsystem_name = r.subsystem_code;
    });

    setRows(mapped);
    setMsg(undefined);
  }

  async function importNow() {
    if (!projectId) return setMsg('Choisissez un projet.');
    if (!rows.length) return setMsg('Aucune ligne à importer.');

    setMsg('Import en cours…');

    // 1) Upsert des systèmes (unique: project_id, name)
    const systemNames = Array.from(new Set(rows.map(r => r.system_name)));
    const systemsPayload = systemNames.map(name => ({ project_id: projectId, name }));

    const { error: e1 } = await supabase
      .from('systems')
      .upsert(systemsPayload, { onConflict: 'project_id,name', ignoreDuplicates: true });
    if (e1) { setMsg('Erreur systèmes: ' + e1.message); return; }

    // 2) Récupère les ids des systèmes du projet
    const { data: systems, error: e2 } = await supabase
      .from('systems')
      .select('id,name')
      .eq('project_id', projectId)
      .in('name', systemNames);
    if (e2) { setMsg('Erreur lecture systèmes: ' + e2.message); return; }

    const idByName = new Map((systems ?? []).map(s => [s.name, s.id]));

    // 3) Upsert des sous-systèmes (unique: project_id, system_id, name)
    const subsPayload = rows
      .map(r => ({
        project_id: projectId,
        system_id: idByName.get(r.system_name)!,
        name: r.subsystem_name!,
        code: r.subsystem_code || null,
      }))
      .filter(x => x.system_id); // évite les systèmes non trouvés

    const { error: e3 } = await supabase
      .from('subsystems')
      .upsert(subsPayload, { onConflict: 'project_id,system_id,name', ignoreDuplicates: true });
    if (e3) { setMsg('Erreur sous-systèmes: ' + e3.message); return; }

    setMsg(`✅ Import OK – ${systemNames.length} système(s) & ${subsPayload.length} sous-système(s).`);
  }

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Import Systèmes / Sous‑systèmes (par projet)</h1>

      <label className="block">
        <span className="text-sm">Projet</span>
        <select
          className="mt-1 border rounded px-3 py-2"
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
        >
          <option value="">Sélectionnez un projet…</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>

      <label className="inline-block mt-2 px-3 py-2 border rounded cursor-pointer">
        Choisir un fichier
        <input
          type="file"
          className="hidden"
          accept=".xlsx,.xls"
          onChange={(e) => e.target.files && readFile(e.target.files[0])}
        />
      </label>

      {rows.length > 0 && (
        <div>
          <button className="px-4 py-2 border rounded" onClick={importNow}>Importer</button>
          <details className="mt-3">
            <summary className="cursor-pointer">Voir les 10 premières lignes</summary>
            <pre className="text-xs bg-slate-50 p-2 rounded mt-2">
{JSON.stringify(rows.slice(0,10), null, 2)}
            </pre>
          </details>
        </div>
      )}

      {msg && <p className="mt-2">{msg}</p>}
    </main>
  );
}
