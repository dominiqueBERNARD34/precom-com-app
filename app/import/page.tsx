'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import * as XLSX from 'xlsx';
import supabase from '@/lib/supabaseClient';

type AnyRow = Record<string, any>;
type Row = { system_name: string; subsystem_code?: string; subsystem_name?: string };

const NO_SS_CODE = '__NO_SS__';
const NO_SS_NAME = 'Sans sous‑système';

const ALIASES: Record<string, string[]> = {
  system_name:    ['system', 'système', 'sys', 'system name', 'nom systeme'],
  subsystem_code: ['sub-system', 'subsystem', 'sous-système', 'ss', 'code ss', 'ss code', 'code'],
  subsystem_name: ['sub-system name', 'subsystem name', 'nom ss', 'libellé ss', 'libelle ss'],
};

const norm = (s: any) => String(s ?? '').trim().toLowerCase();
const mapHeader = (h: string) => {
  const k = norm(h);
  for (const [dst, list] of Object.entries(ALIASES)) {
    if ((list as string[]).some((x: string) => norm(x) === k)) return dst;
  }
  return k;
};

export default function ImportPage() {
  // projet depuis l’URL (?project=...) si présent
  const search = useSearchParams();
  const initialProject = search.get('project') || '';

  const [session, setSession] = useState<null | { user: any }>(null);
  const [ready, setReady] = useState(false);

  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [projectId, setProjectId] = useState<string>(initialProject);

  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState<string>();

  // --- Auth & chargement des projets
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      if (!mounted) return;
      setSession(s);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (!session) return;
      const { data, error } = await supabase
        .from('projects')
        .select('id,name')
        .order('created_at');
      if (!error) setProjects(data || []);
    })();
  }, [session]);

  // --- Lecture du XLSX
  async function read(f: File) {
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const js = XLSX.utils.sheet_to_json<AnyRow>(ws, { defval: '' });

    const mapped: Row[] = js
      .map((r) => {
        const o: AnyRow = {};
        Object.entries(r).forEach(([k, v]) => (o[mapHeader(k)] = v));
        return o;
      })
      .map((r) => ({
        system_name: String(r.system_name || '').trim(),
        subsystem_code: String(r.subsystem_code || '').trim(),
        subsystem_name: String(r.subsystem_name || '').trim(),
      }))
      .filter((r) => r.system_name);

    // Lignes sans sous‑système -> dossier "Sans sous‑système"
    mapped.forEach((r) => {
      if (!r.subsystem_code && !r.subsystem_name) {
        r.subsystem_code = NO_SS_CODE;
        r.subsystem_name = NO_SS_NAME;
      }
      if (r.subsystem_code && !r.subsystem_name) r.subsystem_name = r.subsystem_code;
    });

    setRows(mapped);
    setFile(f);
    setMsg(undefined);
  }

  // --- Import en base
  async function importNow() {
    if (!rows.length) return;
    if (!projectId) {
      setMsg('Veuillez choisir un projet.');
      return;
    }

    setMsg('Import en cours…');

    // 1) Systems (uniques par projet)
    const systemsList = Array.from(new Set(rows.map((r) => r.system_name))).map((name) => ({
      project_id: projectId,
      name,
    }));

    const { error: e1 } = await supabase
      .from('systems')
      .upsert(systemsList, { onConflict: 'project_id,name' });
    if (e1) {
      setMsg('Erreur systèmes: ' + e1.message);
      return;
    }

    // Relire les systèmes pour construire la map name -> id
    const { data: systems, error: eRead } = await supabase
      .from('systems')
      .select('id,name')
      .eq('project_id', projectId);
    if (eRead) {
      setMsg('Erreur lecture systèmes: ' + eRead.message);
      return;
    }
    const byName = new Map(systems?.map((s) => [s.name, s.id]));

    // 2) Subsystems (uniques par projet + système + nom)
    const subsPayload = Array.from(
      new Map(
        rows.map((r) => {
          const key = `${r.system_name}__${r.subsystem_name}`;
          return [
            key,
            {
              project_id: projectId,
              system_id: byName.get(r.system_name)!,
              name: r.subsystem_name,
              code: r.subsystem_code || null,
            },
          ];
        })
      ).values()
    );

    const { error: e2 } = await supabase
      .from('subsystems')
      .upsert(subsPayload, { onConflict: 'project_id,system_id,name' });
    if (e2) {
      setMsg('Erreur sous‑systèmes: ' + e2.message);
      return;
    }

    setMsg(
      `OK – ${systemsList.length} système(s) et ${subsPayload.length} sous‑système(s) importés pour le projet sélectionné.`
    );
  }

  if (!ready) return null;

  if (!session) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">Import Systèmes / Sous‑systèmes</h1>
        <p className="mt-2">Vous devez être connecté pour importer.</p>
        <Link href="/login" className="text-cyan-600 underline">
          Se connecter
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Import Systèmes / Sous‑systèmes</h1>
      <p className="text-sm text-slate-600 mt-2">
        Colonnes Excel attendues : <b>System</b>, facultatif <b>Sub‑System</b> & <b>Sub‑System Name</b> (alias FR
        acceptés). Les lignes sans sous‑système seront rangées dans <i>{NO_SS_NAME}</i>.
      </p>

      {/* Sélecteur de projet */}
      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">Projet cible</label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">— choisir —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {projectId && (
          <Link href={`/systems?project=${projectId}`} className="ml-3 text-cyan-600 underline">
            Retour au projet
          </Link>
        )}
      </div>

      {/* Choix du fichier */}
      <label className="inline-block mt-5 px-3 py-2 border rounded cursor-pointer">
        Choisir un fichier
        <input
          type="file"
          className="hidden"
          accept=".xlsx,.xls"
          onChange={(e) => e.target.files && read(e.target.files[0])}
        />
      </label>
      {file && <span className="ml-3 text-sm text-slate-600">{file.name}</span>}

      {/* Actions & aperçu */}
      {rows.length > 0 && (
        <>
          <div className="mt-4">
            <button
              className="px-4 py-2 rounded bg-cyan-600 text-white disabled:opacity-50"
              onClick={importNow}
              disabled={!projectId}
            >
              Importer
            </button>
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer">Voir les 10 premières lignes détectées</summary>
            <pre className="text-xs bg-slate-50 p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(rows.slice(0, 10), null, 2)}
            </pre>
          </details>
        </>
      )}

      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </main>
  );
}
