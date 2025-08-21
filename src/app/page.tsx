
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type KPIs = { systems: number; subsystems: number; elements: number }

export default function Home() {
  const [kpi, setKpi] = useState<KPIs>({ systems:0, subsystems:0, elements:0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      const { count: elementsCount } = await supabase
        .from('elements')
        .select('id', { count:'exact', head:true })

      const { data: ss } = await supabase
        .from('elements')
        .select('subsystem_id')
      const uniqueSS = new Set((ss ?? []).map((r: any) => r.subsystem_id))

      const { data: systs } = await supabase
        .from('elements')
        .select('system_name')
      const uniqueSys = new Set((systs ?? []).map((r: any) => r.system_name).filter(Boolean))

      setKpi({ systems: uniqueSys.size, subsystems: uniqueSS.size, elements: elementsCount ?? 0 })
      setLoading(false)
    }
    run()
  }, [])

  return (
    <div>
      <h1 style={{ fontSize:28, marginBottom:4 }}>Bienvenue sur precom-com</h1>
      <p style={{ color:'#475569', marginTop:0 }}>
        Arborescence Systèmes → Sous-systèmes → Onglets (Pré-commissioning / Commissioning / Réserves).
        Import massif depuis Excel.
      </p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12, marginTop:16 }}>
        {[
          { label:'Systèmes', value:kpi.systems, href:'/systems' },
          { label:'Sous-systèmes', value:kpi.subsystems, href:'/systems' },
          { label:'Éléments (tags)', value:kpi.elements, href:'/systems' },
          { label:'Importer', value:'→', href:'/tab-lab' }
        ].map((c,i)=>(
          <a key={i} href={c.href} style={{
            display:'block', padding:16, border:'1px solid #e5e7eb', borderRadius:12, textDecoration:'none', color:'#0f172a'
          }}>
            <div style={{ fontSize:14, color:'#64748b' }}>{c.label}</div>
            <div style={{ fontSize:28, fontWeight:700 }}>{loading ? '…' : String(c.value)}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
