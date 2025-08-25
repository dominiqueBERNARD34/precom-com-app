'use client';s

import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabaseClient'; // <-- export nommé

type Row = Record<string, any>;

const REQUIRED = ['system_name', 'subsystem_code'] as const;

const ALIASES: Record<(typeof REQUIRED)[number] | 'subsystem_name', string[]> = {
  system_name: ['system_name', 'systeme', 'système', 'sys', 'system'],
  subsystem_code: ['subsystem_code', 'ss', 'code ss', 'ss code', 'code_ss'],
  subsystem_name: ['subsystem_name', 'nom ss', 'libellé ss', 'libelle ss'],
};

const NO_SS_CODE = '__NO_SS__';
const NO_SS_NAME = 'Sans sous‑système';

function normalize(s?: string | number | null) {
  return String(s ?? '').trim();
}

function normalizeHeader(h: string) {
  const key = h.trim().toLowerCase();
  for (const [std, list] of Object.entries(ALIASES)) {
    if (list.some(a => a.toLowerCase() === key)) return std;
  }
  return key;
}

async function readFile(file: File): Promise<Row[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Row>(ws, { defval: '' });

  if (rows.length === 0) return [];

  // Renomme les en‑têtes selon nos clés standard
  const originalHeaders = Object.keys(rows[0]);
  const headerMap = new Map(originalHeaders.map(h => [h, normalizeHeader(h)]));

  return rows.map(r => {
    const obj: Row = {};
    for (const [orig, std] of headerMap) obj[std] = r[orig];
    return obj;
  });
}

export default function ImportPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const counts = useMemo(() => {
    const systems = new Set<string>();
    const subs = new Set<string>();
    for (const r of rows) {
      const s = normalize(r.system_name);
      if (!s) continue;
      systems.add(s);
      const code = normalize(r.subsystem_code) || NO_SS_CODE;
      subs.add(`${s}::${code}`);
    }
    return { systems: systems.size, subsystems: subs.size };
  }, [rows]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLog([]);
    const data = await readFile(f);

    // Vérif colonnes minimales
    const hasRequired = REQUIRED.every(k =>
      data.some(row => Object.prototype.hasOwnProperty.call(row, k))
    );
    if (!hasRequired) {
      setRows([]);
      setLog([
        'Colonnes manquantes.',
        `Colonnes minimales attendues: ${REQUIRED.join(', ')}`,
      ]);
      return;
    }
    setRows(data);
  }

  async function runImport() {
    if (rows.length === 0) return;

    setBusy(true);
    setLog(['Import en cours…']);

    try {
      // 1) Upsert des systèmes (unicité sur name)
      const systemNames = Array.from(
        new Set(rows.map(r => normalize(r.system_name)).filter(Boolean))
      );
      const systemsPayload = systemNames.map(name => ({ name }));
      const { error: e1 } = await supabase
        .from('systems')
        .upsert(systemsPayload, { onConflict: 'name', ignoreDuplicates: false, returning: 'minimal' });
      if (e1) throw e1;

      // 2) Récupère les ids des systèmes
      const { data: systems, error: e2 } = await supabase
        .from('systems')
        .select('id,name')
        .in('name', systemNames);
      if (e2) throw e2;

      const idByName = new Map<string, string>(systems!.map(s => [s.name, s.id]));

      // 3) Prépare les sous‑systèmes (unicité sur (system_id, code))
      const subsMap = new Map<string, { system_id: string; code: string; name: string }>();
      for (const r of rows) {
        const sname = normalize(r.system_name);
        if (!sname) continue;
        const system_id = idByName.get(sname);
        if (!system_id) continue;

        let code = normalize(r.subsystem_code);
        let name = normalize(r.subsystem_name);

        if (!code) {
          code = NO_SS_CODE;
          if (!name) name = NO_SS_NAME;
        }
        if (!name) name = code;

        const key = `${system_id}|${code}`;
        if (!subsMap.has(key)) subsMap.set(key, { system_id, code, name });
      }

      const subsPayload = Array.from(subsMap.values());
      const { error: e3 } = await supabase
        .from('subsystems')
        .upsert(subsPayload, { onConflict: 'system_id,code', ignoreDuplicates: false, returning: 'minimal' });
      if (e3) throw e3;

      setLog([
        '✅ Import terminé.',
        `→ ${systemNames.length} système(s)`,
        `→ ${subsPayload.length} sous‑système(s)`,
        `→ Les lignes sans code SS vont dans le groupe « ${NO_SS_NAME} ».`,
      ]);
    } catch (err: any) {
      setLog([`❌ ${err?.message || err}`]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h1>Import Systèmes & Sous‑systèmes (Excel)</h1>

      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFile}
        disabled={busy}
      />

      <div style={{ marginTop: 8, color: '#555' }}>
        {rows.length > 0 ? (
          <>
            <div>Pré‑lecture : {rows.length} lignes</div>
            <div>
              {counts.systems} système(s) – {counts.subsystems} sous‑système(s)
              (dont « {NO_SS_NAME} » si nécessaire)
            </div>
          </>
        ) : (
          <div>Aucun fichier chargé.</div>
        )}
      </div>

      <button
        style={{ marginTop: 12 }}
        onClick={runImport}
        disabled={busy || rows.length === 0}
      >
        {busy ? 'Import…' : 'Importer'}
      </button>

      {log.length > 0 && (
        <pre style={{ marginTop: 12, padding: 10, background: '#f6f6f6' }}>
{log.join('\n')}
        </pre>
      )}
    </div>
  );
}
