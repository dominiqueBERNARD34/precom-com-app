
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useSearchParams } from 'next/navigation'
type SS = { id:string, name:string, count:number }
export default function SystemDetail({ params }: { params: { system: string } }) {
  const system = decodeURIComponent(params.system)
  const [ssList, setSsList] = useState<SS[]>([]); const [loading, setLoading] = useState(true)
  const sp = useSearchParams(); const highlight = sp.get('ss')
  useEffect(()=>{(async()=>{
    const { data } = await supabase.from('elements').select('id, system_name, subsystems(id,name)').eq('system_name', system === '-' ? null : system)
    const map = new Map<string, SS>(); for (const r of (data??[])) { const ss = (r as any).subsystems; if (!ss?.id) continue
      if (!map.has(ss.id)) map.set(ss.id, { id:ss.id, name:ss.name, count:0 }); map.get(ss.id)!.count++ }
    setSsList(Array.from(map.values()).sort((a,b)=> a.name.localeCompare(b.name))); setLoading(false)
  })()},[system])
  return (<div>
    <a href="/systems" style={{ textDecoration:'none' }}>← Retour systèmes</a>
    <h1 style={{ fontSize:24, margin:'8px 0' }}>Système {system}</h1>
    <p style={{ color:'#64748b', marginTop:0 }}>{loading ? 'Chargement…' : `${ssList.length} sous-système(s)`}</p>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:12 }}>
      {ssList.map(ss=>(<a key={ss.id} href={`/subsystems/${ss.id}`} style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12, textDecoration:'none', color:'#0f172a', outline: highlight===ss.id ? '2px solid #22c55e' : 'none' }}>
        <div style={{ fontWeight:600 }}>{ss.name}</div>
        <div style={{ fontSize:12, color:'#64748b' }}>{ss.count} éléments</div>
      </a>))}
    </div>
  </div>)
}
