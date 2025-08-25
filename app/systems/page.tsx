
'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabaseClient'
type Row = { system_name: string | null; subsystems: { id:string, name:string }[]; count: number }
export default function SystemsPage() {
  const [rows, setRows] = useState<Row[]>([]); const [loading, setLoading] = useState(true)
  useEffect(()=>{(async()=>{
    const { data } = await supabase.from('elements').select('id, system_name, subsystems(id,name)')
    const map = new Map<string, { subs: Map<string,{id:string,name:string}>, count:number }>() 
    for (const r of (data??[])) {
      const sys = (r as any).system_name ?? '—'; const ss = (r as any).subsystems
      if (!map.has(sys)) map.set(sys, { subs:new Map(), count:0 })
      const slot = map.get(sys)!; slot.count++; if (ss?.id) slot.subs.set(ss.id, { id:ss.id, name:ss.name })
    }
    const rows_: Row[] = Array.from(map.entries()).map(([sys,val])=>({system_name:sys,subsystems:Array.from(val.subs.values()),count:val.count}))
      .sort((a,b)=> String(a.system_name).localeCompare(String(b.system_name)))
    setRows(rows_); setLoading(false)
  })()},[])
  const total = useMemo(()=> rows.reduce((s,r)=> s+r.count,0), [rows])
  return (<div>
    <h1 style={{ fontSize:24, marginBottom:8 }}>Systèmes</h1>
    <p style={{ color:'#64748b', marginTop:0 }}>{loading ? 'Chargement…' : `${rows.length} système(s), ${total} éléments.`}</p>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:12 }}>
      {rows.map((r,idx)=>(<div key={idx} style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
          <h3 style={{ margin:'4px 0 8px' }}>Système {r.system_name || '—'}</h3>
          <span style={{ fontSize:12, color:'#64748b' }}>{r.count} éléments</span>
        </div>
        <ul style={{ listStyle:'none', padding:0, margin:0, display:'grid', gap:6 }}>
          {r.subsystems.map(ss=>(<li key={ss.id}>
            <a href={`/systems/${encodeURIComponent(r.system_name ?? '-') }?ss=${ss.id}`} style={{ textDecoration:'none', color:'#0f172a' }}>{ss.name}</a>
          </li>))}
        </ul>
      </div>))}
    </div>
  </div>)
}
