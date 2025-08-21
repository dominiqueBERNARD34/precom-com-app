
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
type ElementRow = { id:string; physical_tag:string; denomination:string|null; system_name:string|null }
type SS = { id:string; name:string }
export default function SubsystemPage({ params }: { params: { id: string } }) {
  const ssId = params.id
  const [ss, setSs] = useState<SS | null>(null)
  const [elements, setElements] = useState<ElementRow[]>([])
  const [tab, setTab] = useState<'pre'|'com'|'res'>('pre')
  const [loading, setLoading] = useState(true)
  useEffect(()=>{(async()=>{
    const { data: s1 } = await supabase.from('subsystems').select('id,name').eq('id', ssId).single(); setSs(s1 as any)
    const { data: els } = await supabase.from('elements').select('id, physical_tag, denomination, system_name').eq('subsystem_id', ssId).order('physical_tag',{ ascending:true })
    setElements((els ?? []) as any); setLoading(false)
  })()},[ssId])
  const count = elements.length; const title = ss?.name ?? '—'
  const tabButton = (key:'pre'|'com'|'res',label:string)=>(<button onClick={()=>setTab(key)} style={{padding:'8px 12px',border:'1px solid #e5e7eb',background: tab===key ? '#e2e8f0':'#fff',borderRadius:8,cursor:'pointer'}}>{label}</button>)
  const commonPanel = (<div style={{ border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' }}>
    <table style={{ width:'100%', borderCollapse:'collapse' }}><thead><tr style={{ background:'#f8fafc' }}>
      <th style={{ padding:8, borderBottom:'1px solid #e5e7eb', textAlign:'left' }}>Repère</th>
      <th style={{ padding:8, borderBottom:'1px solid #e5e7eb', textAlign:'left' }}>Dénomination</th>
      <th style={{ padding:8, borderBottom:'1px solid #e5e7eb', textAlign:'left' }}>Système</th>
    </tr></thead><tbody>
      {elements.map(el=>(<tr key={el.id}>
        <td style={{ padding:8, borderBottom:'1px solid #f1f5f9' }}>{el.physical_tag}</td>
        <td style={{ padding:8, borderBottom:'1px solid #f1f5f9' }}>{el.denomination ?? ''}</td>
        <td style={{ padding:8, borderBottom:'1px solid #f1f5f9' }}>{el.system_name ?? ''}</td>
      </tr>))}
    </tbody></table>
  </div>)
  return (<div>
    <a href="/systems" style={{ textDecoration:'none' }}>← Retour aux systèmes</a>
    <h1 style={{ fontSize:24, margin:'8px 0' }}>{title}</h1>
    <p style={{ color:'#64748b', marginTop:0 }}>{loading ? 'Chargement…' : `${count} élément(s)`}</p>
    <div style={{ display:'flex', gap:8, marginBottom:12 }}>
      {tabButton('pre','Pré-commissioning')}{tabButton('com','Commissioning')}{tabButton('res','Réserves')}
    </div>
    {tab==='pre' && (<div style={{ display:'grid', gap:12 }}>
      <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}><h3 style={{ margin:'4px 0 8px' }}>Contrôle conformité</h3></div>
      <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}><h3 style={{ margin:'4px 0 8px' }}>Essais statiques</h3></div>
      <h3>Éléments concernés</h3>{commonPanel}
    </div>)}
    {tab==='com' && (<div style={{ display:'grid', gap:12 }}>
      <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}><h3 style={{ margin:'4px 0 8px' }}>Tests fonctionnels</h3></div>
      <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}><h3 style={{ margin:'4px 0 8px' }}>Mise en service opérationnel</h3></div>
      <h3>Éléments concernés</h3>{commonPanel}
    </div>)}
    {tab==='res' && (<div style={{ display:'grid', gap:12 }}>
      <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:12 }}><h3 style={{ margin:'4px 0 8px' }}>Fiches réserves</h3>
      <p style={{ color:'#64748b' }}>Les réserves sont liées à une fiche de test (anomalie NOK).</p></div>
    </div>)}
  </div>)
}
