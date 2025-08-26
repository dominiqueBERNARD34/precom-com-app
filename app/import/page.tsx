'use client'
import { useState } from 'react';
import * as XLSX from 'xlsx';
import supabase from '@/lib/supabaseClient';
import Back from '@/componants/Back';

type Row = Record<string, any>;
const NO_SS_CODE = '__NO_SS__';
const NO_SS_NAME = 'Sans sous‑système';

const ALIASES: Record<string, string[]> = {
  system_name:    ['system','système','sys','system name','nom systeme'],
  subsystem_code: ['sub-system','subsystem','sous-système','ss','code ss','ss code','code'],
  subsystem_name: ['sub-system name','subsystem name','nom ss','libellé ss','libelle ss']
};

const norm = (s:any) => String(s ?? '').trim().toLowerCase();
const mapHeader = (h:string) => {
  const k = norm(h);
  for (const [dst, list] of Object.entries(ALIASES))
    if (list.some(x => norm(x) === k)) return dst;
  return h;
};

export default function ImportSystems() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState<string>();

  async function read(f: File) {
    const buf = await f.arrayBuffer();
    const wb  = XLSX.read(buf, { type:'array' });
    const ws  = wb.Sheets[wb.SheetNames[0]];
    const js  = XLSX.utils.sheet_to_json<Row>(ws, { defval: '' });

    const mapped = js.map(r => {
      const o: Row = {};
      Object.entries(r).forEach(([k,v]) => o[mapHeader(k)] = v);
      return o;
    }).map(r => ({
      system_name:    String(r.system_name || '').trim(),
      subsystem_code: String(r.subsystem_code || '').trim(),
      subsystem_name: String(r.subsystem_name || '').trim()
    })).filter(r => r.system_name);

    // Sans SS → cas "groupe sans sous‑système"
    mapped.forEach(r => {
      if (!r.subsystem_code && !r.subsystem_name) {
        r.subsystem_code = NO_SS_CODE;
        r.subsystem_name = NO_SS_NAME;
      }
      if (r.subsystem_code && !r.subsystem_name) r.subsystem_name = r.subsystem_code;
    });

    setRows(mapped); setFile(f); setMsg(undefined);
  }

  async function importNow() {
    if (!rows.length) return;

    setMsg('Import…');
    const systemsList = Array.from(new Set(rows.map(r => r.system_name))).map(name => ({ name }));

    // 1) systems
    const { error: e1 } = await supabase
      .from('systems').upsert(systemsList, { onConflict: 'name', ignoreDuplicates: true });
    if (e1) return setMsg('Erreur systèmes: ' + e1.message);

    const { data: systems } = await supabase
      .from('systems').select('id,name').in('name', systemsList.map(s => s.name));
    const byName = new Map(systems?.map(s => [s.name, s.id]));

    // 2) subsystems
    const subsPayload = Array.from(new Map(rows.map(r => {
      const key = `${r.system_name}__${r.subsystem_name}`;
      return [key, {
        system_id: byName.get(r.system_name)!,
        name:      r.subsystem_name,
        code:      r.subsystem_code || null
      }];
    })).values());

    const { error: e2 } = await supabase
      .from('subsystems').upsert(subsPayload, { onConflict: 'system_id,name', ignoreDuplicates: true });
    if (e2) return setMsg('Erreur sous‑systèmes: ' + e2.message);

    setMsg(`OK – ${systemsList.length} système(s) et ${subsPayload.length} sous‑système(s) mis à jour.`);
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <Back href="/" />
      <h1 className="text-2xl font-bold">Import Systèmes / Sous‑systèmes</h1>
      <p className="text-sm text-slate-600 mt-2">
        Colonnes Excel attendues : <b>System</b>, facultatif <b>Sub‑System</b> & <b>Sub‑System Name</b>.<br />
        Les lignes sans sous‑système seront rangées dans <i>{NO_SS_NAME}</i>.
      </p>

      <label className="inline-block mt-4 px-3 py-2 border rounded cursor-pointer">
        Choisir un fichier
        <input type="file" className="hidden" accept=".xlsx,.xls"
               onChange={(e)=> e.target.files && read(e.target.files[0])}/>
      </label>

      {rows.length > 0 && (
        <>
          <div className="mt-4">
            <button className="px-4 py-2 border rounded" onClick={importNow}>
              Importer
            </button>
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer">Voir les 10 premières lignes</summary>
            <pre className="text-xs bg-slate-50 p-2 rounded mt-2">
{JSON.stringify(rows.slice(0,10), null, 2)}
            </pre>
          </details>
        </>
      )}
      {msg && <p className="mt-4">{msg}</p>}
    </main>
  );
}
