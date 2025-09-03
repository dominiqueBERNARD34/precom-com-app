// src/components/PricingModal.tsx
'use client'
import { useEffect } from 'react'
import Pricing from '@/components/PricingSection' // on factorise la grille ci‑dessous

export default function PricingModal({ open, onClose }:{
  open: boolean; onClose: ()=>void
}) {
  useEffect(()=>{
    document.body.style.overflow = open ? 'hidden' : ''
    return ()=>{ document.body.style.overflow = '' }
  },[open])

  if (!open) return null
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(2,6,23,.85)',
      display:'grid', placeItems:'center', zIndex:1000, padding:'24px'
    }}>
      <div style={{
        width:'min(1200px, 100%)', background:'#0b1220', border:'1px solid #1e293b',
        borderRadius:16, boxShadow:'0 20px 60px rgba(0,0,0,.5)', padding:24
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <h2 style={{ margin:0 }}>Choisissez votre formule</h2>
          <button onClick={onClose} style={{
            background:'transparent', color:'#e2e8f0', border:'1px solid #334155',
            borderRadius:8, padding:'6px 10px', cursor:'pointer'
          }}>Fermer</button>
        </div>
        <Pricing />
      </div>
    </div>
  )
}
