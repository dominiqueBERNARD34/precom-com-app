'use client';

import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabaseClient';

/* ------------------------------------------------------------------ */
/*  Types et normalisation                                             */
/* ------------------------------------------------------------------ */

type Row = {
  system_name: string;
  subsystem_code: string;   // si vide dans le fichier => __NO_SS__
  subsystem_name?: string;  // optionnel
};

const NO_SS_CODE = '__NO_SS__';
const NO_SS_NAME = 'Sans sous-système';

const ALIASES: Record<string, string[]> = {
  // nom du système
  system_name: [
    'system_name', 'système', 'systeme', 'system', 'sys', 'nom système',
    'system name', 'nom systeme'
  ],
  // code du sous-système
  subsystem_code: [
    'subsystem_code', 'ss', 'code ss', 'ss code', 'code_ss', 'code',
    'sous-système', 'sous-systeme', 'code sous-système', 'code sous-systeme'
  ],
  // libellé du sous-système (facultatif)
  subsystem_name: [
    'subsystem_name', 'nom ss', 'libellé ss', 'libelle ss', 'ss name',
    'libellé_sous-système', 'designation ss', 'désignation ss'
  ],
};

const REQUIRED_KEYS = ['system_name']; // subsystem_code sera rempli par défaut si absent

function norm(v: unknown): string {
  return String(v ?? '').trim();
}

function normHeader(h: string): string {
  const key = norm(h).toLowerCase();
  for (const [std, list] of Object.entries(ALIASES)) {
    if (list.some(a => a.toLowerCase() === key)) return std;
  }
  return key;
}

/* ------------------------------------------------------------------ */
/*  Composant page                                                     */
/* ------------------------------------------------------------------ */

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    const systems = new Set(rows.map(r => r.system_name));
    const subs = new Set(rows.map(r => `${r.system_name}::${r.subsystem_code || NO_SS_CODE}`));
    return { systems: systems.size, subsystems: subs.size, rows: rows.length };
  }, [rows]);

  /* -------------------------- lecture Excel ------------------------- */

  async function onPickFile(f: File) {
    setFile(f);
    setStatus('Lecture du fichier…');

    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

    // remap des en‑têtes + normalisation
    const mapped = raw.map((r) => {
      const obj: Record<string, string> = {};
      for (const [k, v] of Object.entries(r)) {
        const hk = normHeader(k);
        obj[hk] = norm(v);
      }
      return obj;
    });

    // validation minimale + valeurs par défaut
    const out: Row[] = mapped
      .filter((r) => REQUIRED_KEYS.every(k => norm(r[k]) !== ''))
      .map((r) => {
        const sys = norm(r['system_name']);
        const code = norm(r['subsystem_code']) || NO_SS_CODE;
        const name =
          norm(r['subsystem_name']) ||
          (code === NO_SS_CODE ? NO_SS_NAME : '');
        return {
          system_name: sys,
          subsystem_code: code,
          ...(name ? { subsystem_name: name } : {}),
        };
      });

    setRows(out);
    setStatus(`Fichier lu : ${out.length} ligne(s) valide(s).`);
  }

  /* ---------------------------- import DB --------------------------- */

  async function runImport() {
    if (!rows.length) return;
    setLoading(true);
    setStatus('Import en cours…');

    try {
      // 1) Upsert des systèmes
      const uniqueSystems = Array.from(new Set(rows.map(r => r.system_name))).filter(Boolean);
      const systemsPayload = uniqueSystems.map((name) => ({ name }));

      const { error: upSysErr } = await supabase
        .from('systems')
        .upsert(systemsPayload, { onConflict: 'name' }); // v2 : pas de 'returning'
      if (upSysErr) throw upSysErr;

      // Récupérer leurs ids
      const { data: sysRows, error: selSysErr } = await supabase
        .from('systems')
        .select('id, name')
        .in('name', uniqueSystems);
      if (selSysErr) throw selSysErr;

      const sysIdByName = new Map<string, string>();
      (sysRows ?? []).forEach(s => sysIdByName.set(s.name, s.id));

      // 2) Upsert des sous‑systèmes (unique par (system_id, code))
      const subMap = new Map<string, { system_id: string; code: string; name?: string }>();
      for (const r of rows) {
        const system_id = sysIdByName.get(r.system_name);
        if (!system_id) continue; // sécurité
        const code = r.subsystem_code || NO_SS_CODE;
        const key = `${system_id}::${code}`;
        if (!subMap.has(key)) {
          subMap.set(key, {
            system_id,
            code,
            ...(r.subsystem_name ? { name: r.subsystem_name } : {}),
          });
        }
      }
      const subsystemsPayload = Array.from(subMap.values());

      const { error: upSubErr } = await supabase
        .from('subsystems')
        .upsert(subsystemsPayload, { onConflict: 'system_id,code' });
      if (upSubErr) throw upSubErr;

      setStatus(
        `✅ Import terminé : ${uniqueSystems.length} système(s), ` +
        `${subsystemsPayload.length} sous‑système(s).`
      );
    } catch (e: any) {
      console.error(e);
      setStatus(`❌ Erreur import : ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }

  /* ----------------------------- rendu UI --------------------------- */

  return (
    <div style={{ padding: 16, maxWidth: 920 }}>
      <h1>Import Systèmes / Sous‑systèmes</h1>
      <p>
        Sélectionnez un fichier Excel (.xlsx/.xls) contenant au minimum
        la colonne <code>system_name</code>. Si <code>subsystem_code</code> est
        vide, la ligne sera rangée dans le groupe <b>{NO_SS_NAME}</b>.
      </p>

      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          margin: '12px 0',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            if (f) onPickFile(f);
          }}
        />
        {file && <span>Fichier : <b>{file.name}</b></span>}
        <button
          onClick={runImport}
          disabled={!rows.length || loading}
          style={{ padding: '8px 14px' }}
        >
          {loading ? 'Import…' : 'Importer'}
        </button>
      </div>

      <div style={{ margin: '8px 0', color: '#555' }}>{status}</div>

      {rows.length > 0 && (
        <div
          style={{
            marginTop: 8,
            padding: 12,
            border: '1px solid #eee',
            borderRadius: 8,
            background: '#fafafa',
          }}
        >
          <b>Aperçu</b>
          <ul>
            <li>{stats.rows} ligne(s) valide(s) détectée(s)</li>
            <li>{stats.systems} système(s) unique(s)</li>
            <li>{stats.subsystems} sous‑système(s) unique(s)</li>
          </ul>
          <details>
            <summary>Voir les 10 premières lignes</summary>
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(rows.slice(0, 10), null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
