'use client';

import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import supabase from '@/lib/supabaseClient'; // chemin identique à ton projet

type Row = Record<string, any>;

type Mapping = {
  system_name: string;
  subsystem_code: string;
  subsystem_name?: string;
  physical_tag: string;
  denomination: string;
  cancelled?: string; // colonne optionnelle "Annulé ?"
};

const REQUIRED = ['system_name','subsystem_code','physical_tag','denomination'] as const;

// Synonymes d'en-têtes (auto-détection). Tu peux en ajouter tranquillement.
const ALIASES: Record<keyof Mapping, string[]> = {
  system_name:    ['system','système','systeme','system name','sys','system_name'],
  subsystem_code: ['sous-système','subsystem','ss','code ss','subsystem_code','ss code'],
  subsystem_name: ['subsystem name','nom sous-système','libellé ss','subsystem_name'],
  physical_tag:   ['repere','repère','repere physique','physical tag','physical_tag','tag','identifiant'],
  denomination:   ['dénomination','denomination','designation','désignation','libellé','libelle'],
  cancelled:      ['annulé','annule','annule?','cancel','cancelled','status','etat'],
};

function normalize(s: string) {
  return s
    ?.toLowerCase()
    ?.normalize('NFD')
    ?.replace(/\p{Diacritic}/gu, '')
    ?.trim();
}

function autoMap(headers: string[]): Mapping {
  const map: Partial<Mapping> = {};
  const norm = headers.map(h => ({raw: h, n: normalize(h)}));

  (Object.keys(ALIASES) as (keyof Mapping)[]).forEach(key => {
    const hit = norm.find(h => ALIASES[key].map(normalize).includes(h.n));
    if (hit) (map as any)[key] = hit.raw;
  });

  return map as Mapping;
}

function parseCancelled(v: any): boolean {
  if (v === true) return true;
  const s = normalize(String(v ?? ''));
  return ['x','1','oui','true','annule','annulee','annulé','annuleé','cancel','cancelled'].includes(s);
}

export default function ImportPage() {
  const [fileName, setFileName] = useState<string>('');
  const [rows, setRows] = useState<Row[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Mapping>();
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string>('');

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data: Row[] = XLSX.utils.sheet_to_json(ws, { raw: false, defval: '' });
    const hdrs = XLSX.utils.sheet_to_json<Row>(ws, { header: 1 })[0] as string[];
    setRows(data);
    setHeaders(hdrs);
    setMapping(autoMap(hdrs));
    setLog(`Fichier "${f.name}" chargé : ${data.length} lignes`);
  }

  const missing = useMemo(() => {
    if (!mapping) return REQUIRED;
    return REQUIRED.filter(k => !(mapping as any)[k]);
  }, [mapping]);

  const preview = useMemo(() => {
    if (!rows.length || !mapping) return [];
    return rows.slice(0, 10).map(r => ({
      system_name   : r[mapping.system_name],
      subsystem_code: r[mapping.subsystem_code],
      subsystem_name: mapping.subsystem_name ? r[mapping.subsystem_name] : '',
      physical_tag  : r[mapping.physical_tag],
      denomination  : r[mapping.denomination],
      cancelled     : mapping.cancelled ? parseCancelled(r[mapping.cancelled]) : false,
    }));
  }, [rows, mapping]);

  async function runImport() {
    if (!mapping) return;
    if (missing.length) {
      alert(`Colonnes manquantes: ${missing.join(', ')}`);
      return;
    }

    setBusy(true);
    setLog('Création du lot…');

    // 1) Créer un "batch" d’import
    const { data: batch, error: e1 } = await supabase
      .from('import_batches')
      .insert([{ source: 'Excel', status: 'uploaded', total_rows: rows.length }])
      .select('id')
      .single();

    if (e1 || !batch) {
      setBusy(false);
      setLog(`Erreur création lot: ${e1?.message}`);
      return;
    }

    const batchId = batch.id as string;

    // 2) Normaliser et envoyer en staging (par paquets pour éviter 413)
    setLog('Envoi des données en staging…');

    const normalized = rows.map(r => ({
      batch_id       : batchId,
      system_name    : String(r[mapping.system_name] ?? '').trim(),
      subsystem_code : String(r[mapping.subsystem_code] ?? '').trim(),
      subsystem_name : mapping.subsystem_name ? String(r[mapping.subsystem_name] ?? '').trim() : null,
      physical_tag   : String(r[mapping.physical_tag] ?? '').trim(),
      denomination   : String(r[mapping.denomination] ?? '').trim(),
      cancelled      : mapping.cancelled ? parseCancelled(r[mapping.cancelled]) : false,
    }));

    // petits garde-fous
    const filtered = normalized.filter(n => n.system_name && n.physical_tag);

    const CHUNK = 500;
    for (let i = 0; i < filtered.length; i += CHUNK) {
      const slice = filtered.slice(i, i + CHUNK);
      const { error } = await supabase.from('staging_elements').insert(slice);
      if (error) {
        setBusy(false);
        setLog(`Erreur staging (chunk ${i/CHUNK+1}): ${error.message}`);
        return;
      }
    }

    // 3) Déclencher le traitement serveur
    setLog('Traitement serveur…');

    const { data: counts, error: e2 } = await supabase
      .rpc('process_import_batch', { p_batch: batchId });

    if (e2) {
      setBusy(false);
      setLog(`Erreur process_import_batch: ${e2.message}`);
      return;
    }

    setBusy(false);
    setLog(`Import OK.
  Systèmes créés: ${counts?.[0]?.inserted_systems ?? 0}
  SS upsertés   : ${counts?.[0]?.upserted_subsystems ?? 0}
  Éléments upsertés : ${counts?.[0]?.upserted_elements ?? 0}`);
  }

  return (
    <main style={{ maxWidth: 980, margin: '40px auto', padding: 24 }}>
      <h1>Import Excel — Systèmes / Sous‑systèmes / Éléments</h1>

      <ol>
        <li><b>Choisir un fichier Excel</b> (première feuille lue)</li>
        <li><b>Mapper</b> les colonnes si besoin</li>
        <li><b>Prévisualiser</b></li>
        <li><b>Importer</b></li>
      </ol>

      <input type="file" accept=".xlsx,.xls" onChange={onPickFile} disabled={busy} />
      {fileName && <p>Fichier : {fileName}</p>}

      {!!headers.length && (
        <>
          <h3>Mapping colonnes</h3>
          {(['system_name','subsystem_code','subsystem_name','physical_tag','denomination','cancelled'] as (keyof Mapping)[])
            .map(key => (
              <div key={key} style={{ marginBottom: 8 }}>
                <label style={{ width: 180, display: 'inline-block' }}>
                  {key}{REQUIRED.includes(key as any) ? ' *' : ''} :
                </label>
                <select
                  value={(mapping as any)?.[key] ?? ''}
                  onChange={e => setMapping(m => ({ ...(m ?? {}), [key]: e.target.value || undefined } as any))}
                >
                  <option value="">— (aucune)</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
          ))}

          {!!missing.length && <p style={{ color: 'crimson' }}>
            Colonnes obligatoires manquantes : {missing.join(', ')}
          </p>}
        </>
      )}

      {!!preview.length && (
        <>
          <h3>Aperçu (10 lignes)</h3>
          <pre style={{ background:'#f7f7f7', padding:12 }}>
            {preview.map((r,i) => JSON.stringify(r, null, 2)).join('\n')}
          </pre>
        </>
      )}

      <button onClick={runImport} disabled={busy || !rows.length || !!missing.length}>
        {busy ? 'Import…' : 'Lancer l’import'}
      </button>

      {!!log && (
        <>
          <h3>Journal</h3>
          <pre style={{ whiteSpace:'pre-wrap' }}>{log}</pre>
        </>
      )}
    </main>
  );
}
