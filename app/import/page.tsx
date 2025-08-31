'use client';

import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import supabase from '@/lib/supabaseClient'; // export default
// Si vous avez aussi un export nommé :
// import supabaseDefault, { supabase as supabaseNamed } from '@/lib/supabaseClient';

type Row = { system_name: string; subsystem_code?: string; subsystem_name?: string };
type Project = { id: string; name: string };

const NO_SS_CODE = '__NO_SS__';
const NO_SS_NAME = 'Sans sous-système';

const ALIASES: Record<string, string[]> = {
  system_name:    ['system','système','sys','system name','nom systeme','systeme'],
  subsystem_code: ['sub-system','subsystem','sous-système','ss','code ss','ss code','code','subsystem code','sub-system code'],
  subsystem_name: ['sub-system name','subsystem name','nom ss','libellé ss','libelle ss','sous système','sous systeme'],
};

const norm = (s: any) => String(s ?? '').trim().toLowerCase();
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
  const [fileName, setFileName] = useState<string>('');
  const [msg, setMsg] = useState<string>('');
  const [busy, setBusy] = useState(false);

  // Charger les projets de l'utilisateur connecté
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id,name')
        .order('name', { ascending: true });
      if (error) {
        setMsg('Erreur chargement projets : ' + error.message);
      } else {
        setProjects(data ?? []);
      }
    })();
  }, []);

  async function readFile(f: File) {
    setFileName(f.name);
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const js = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });

    const mapped = js
      .map((r) => {
        const o: Record<string, any> = {};
        Object.entries(r).forEach(([k, v]) => (o[mapHeader(k)] = v));
        return o;
      })
      .map((r) => ({
        system_name: String(r.system_name || '').trim(),
        subsystem_code: String(r.subsystem_code || '').trim(),
        subsystem_name: String(r.subsystem_name || '').trim(),
      }))
      .filter((r) => r.system_name);

    // Lignes sans SS -> regrouper dans "Sans sous-système"
    mapped.forEach((r) => {
      if (!r.subsystem_code && !r.subsystem_name) {
        r.subsystem_code = NO_SS_CODE;
        r.subsystem_name = NO_SS_NAME;
      }
      if (r.subsystem_code && !r.subsystem_name) r.subsystem_name = r.subsystem_code;
    });

    setRows(mapped);
    setMsg('');
  }

  async function importNow() {
    if (!projectId) {
      setMsg('Veuillez choisir un projet.');
      return;
    }
    if (!rows.length) {
      setMsg('Aucune donnée à importer.');
      return;
    }

    try {
      setBusy(true);
      setMsg('Import en cours…');

      // 1) Upsert des systèmes
      const systemNames = Array.from(new Set(rows.map((r) => r.system_name)));
      const systemsPayload = systemNames.map((name) => ({
        project_id: projectId,
        name,
      }));

      {
        const { error } = await supabase
          .from('systems')
          .upsert(systemsPayload, { onConflict: 'project_id,name' });
        if (error) throw new Error('Systèmes : ' + error.message);
      }

      // Récupérer id des systèmes
      const { data: systems } = await supabase
        .from('systems')
        .select('id,name')
        .eq('project_id', projectId)
        .in('name', systemNames);

      const sysByName = new Map<string, string>((systems ?? []).map((s) => [s.name, s.id]));

      // 2) Upsert des sous-systèmes
      const subsPayloadMap = new Map<string, any>();
      for (const r of rows) {
        const sId = sysByName.get(r.system_name);
        if (!sId) continue;
        const key = `${sId}__${r.subsystem_name}`;
        subsPayloadMap.set(key, {
          project_id: projectId,
          system_id: sId,
          name: r.subsystem_name || NO_SS_NAME,
          code: r.subsystem_code || null,
        });
      }
      const subsPayload = Array.from(subsPayloadMap.values());
      if (subsPayload.length) {
        const { error } = await supabase
          .from('subsystems')
          .upsert(subsPayload, { onConflict: 'project_id,system_id,name' });
        if (error) throw new Error('Sous‑systèmes : ' + error.message);
      }

      setMsg(`✅ Import terminé : ${systemsPayload.length} système(s), ${subsPayload.length} sous‑système(s).`);
    } catch (e: any) {
      setMsg('❌ ' + e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="p-6 max-w-5xl mx-auto text-slate-100">
      <h1 className="text-2xl font-bold mb-2">Import Systèmes / Sous‑systèmes</h1>

      <div className="mt-4 flex gap-3 items-end">
        <label className="text-sm">
          Projet
          <select
            className="ml-2 rounded border border-slate-600 bg-slate-800 px-2 py-1"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            <option value="">— Choisir —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="inline-block">
          <span className="text-sm mr-2">Fichier Excel (.xlsx/.xls)</span>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => e.target.files && readFile(e.target.files[0])}
          />
        </label>

        <button
          disabled={!projectId || !rows.length || busy}
          onClick={importNow}
          className="px-4 py-2 rounded bg-cyan-600 disabled:opacity-50"
        >
          {busy ? 'Import…' : 'Importer'}
        </button>
      </div>

      {fileName && (
        <p className="mt-2 text-sm text-slate-400">
          Fichier : <b>{fileName}</b> — {rows.length} lignes détectées
        </p>
      )}

      {rows.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer">Voir les 10 premières lignes</summary>
          <pre className="text-xs bg-slate-900 p-3 rounded mt-2 overflow-auto">
            {JSON.stringify(rows.slice(0, 10), null, 2)}
          </pre>
        </details>
      )}

      {msg && <p className="mt-4">{msg}</p>}
    </main>
  );
}
