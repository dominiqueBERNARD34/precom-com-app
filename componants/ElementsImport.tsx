'use client'
import * as XLSX from 'xlsx';
import { useState } from 'react';
import supabase from '@/lib/supabaseClient';

type Props = {
  subsystemId: string;
  systemId: string;
  phase: 'precomm'|'comm'|'reserve';
  category: 'conformity'|'static'|'functional'|'operational'|'reserve';
};

export default function ElementImport({ subsystemId, systemId, phase, category }:Props) {
  const [busy,setBusy] = useState(false);
  const [msg,setMsg] = useState<string>();

  async function handle(file: File) {
    setBusy(true); setMsg(undefined);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, {type:'array'});
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string,any>>(ws, {defval:''});

      const alias: Record<string,string[]> = {
        physical_tag: ['tag','repere','répere','répère','physical tag','identifiant'],
        denomination: ['denomination','désignation','designation','libellé','libelle','name','nom'],
        cancelled:    ['annulé','annule','cancelled','status','etat','état']
      };
      const norm = (s:string)=> String(s??'').trim().toLowerCase();
      const map = (h:string) => {
        const k = norm(h);
        for (const [dst,list] of Object.entries(alias)) if (list.some(x=>norm(x)===k)) return dst;
        return h;
      };
      const normalized = rows.map(r => {
        const o:any = {}; for (const [k,v] of Object.entries(r)) o[map(k)] = v; return o;
      });

      const payload = normalized
        .filter(r => String(r.physical_tag||'').trim() !== '')
        .map(r => ({
          system_id: systemId,
          subsystem_id: subsystemId,
          phase, category,
          physical_tag: String(r.physical_tag).trim(),
          denomination: String(r.denomination ?? '').trim(),
          cancelled: /^annul|^cancel/i.test(String(r.cancelled ?? ''))
        }));

      if (!payload.length) { setMsg('Aucun élément détecté.'); setBusy(false); return; }

      const { error } = await supabase
        .from('elements')
        .upsert(payload, { onConflict: 'subsystem_id,phase,category,physical_tag' });
      if (error) throw error;

      setMsg(`${payload.length} élément(s) importé(s)`);
    } catch (e:any) {
      setMsg('Erreur: ' + e.message);
    } finally { setBusy(false); }
  }

  return (
    <div className="border rounded p-2">
      <label className="inline-block mt-1 px-3 py-2 border rounded cursor-pointer">
        Choisir un fichier Excel
        <input type="file" className="hidden" accept=".xlsx,.xls"
               onChange={e => e.target.files && handle(e.target.files[0])}/>
      </label>
      {msg && <p className="text-sm mt-2">{msg}</p>}
    </div>
  );
}
