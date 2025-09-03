'use client'

import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Props = {
  open: boolean
  onClose: () => void
  plan?: string            // ex. 'Pro', 'Essai', etc.
  priceLabel?: string      // ex. '12,00 €'
}

export default function SignUpModal({ open, onClose, plan = 'Pro', priceLabel }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [optIn, setOptIn] = useState(false)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  // Empêche le scroll de la page quand la modale est ouverte + focus initial
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => firstFieldRef.current?.focus(), 0)
    return () => { document.body.style.overflow = prev; clearTimeout(t) }
  }, [open])

  // ESC pour fermer + focus trap au TAB
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') trapFocus(e)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const trapFocus = (e: KeyboardEvent) => {
    const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
    if (!nodes || nodes.length === 0) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    const active = document.activeElement
    if (e.shiftKey && active === first) { last.focus(); e.preventDefault() }
    else if (!e.shiftKey && active === last) { first.focus(); e.preventDefault() }
  }

  const siteUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL ?? '')

  const handleEmailSignup = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setBusy(true); setError(null); setInfo(null)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
        data: { marketing_opt_in: optIn, plan }
      }
    })
    if (error) setError(error.message)
    else setInfo('Un e‑mail de confirmation vous a été envoyé. Ouvrez-le pour activer votre compte.')
    setBusy(false)
  }

  const handleGoogle = async () => {
    setBusy(true); setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${siteUrl}/auth/callback`, queryParams: { access_type: 'offline', prompt: 'consent' } }
    })
    if (error) { setBusy(false); setError(error.message) }
  }

  if (!open) return null

  return (
    <div
      aria-hidden={!open}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={overlay}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="signup-title" ref={dialogRef} style={card}>
        {/* Close */}
        <button aria-label="Fermer" onClick={onClose} style={btnClose}>×</button>

        {/* En‑tête */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
          <div style={logoBubble}>PC</div>
          <h2 id="signup-title" style={{ margin:0, fontSize:22, lineHeight:1.2 }}>
            Inscrivez‑vous à <strong>PRECOM‑COM</strong>
          </h2>
        </div>

        {plan && (
          <div style={{ fontSize:13, color:'#475569', marginBottom:8 }}>
            Plan sélectionné : <strong style={{ color:'#0f172a' }}>{plan}</strong>
            {priceLabel ? <span> — {priceLabel}</span> : null}
          </div>
        )}

        {/* Google */}
        <button onClick={handleGoogle} disabled={busy} style={btnGoogle}>
          <span style={gIcon}>G</span> Connectez‑vous avec Google
        </button>

        <div style={sep}><span style={sepText}>ou</span></div>

        {/* Formulaire */}
        <form onSubmit={handleEmailSignup}>
          <label style={label}>ADRESSE EMAIL</label>
          <input
            ref={firstFieldRef}
            type="email"
            required
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="contact@votreentreprise.com"
            style={input}
          />

          <label style={label}>MOT DE PASSE <span style={{ opacity:.6 }}>(AU MOINS 6 CARACTÈRES)</span></label>
          <div style={{ position:'relative' }}>
            <input
              type={showPwd ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={e=>setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ ...input, paddingRight:40 }}
            />
            <button
              type="button"
              aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              onClick={()=>setShowPwd(p=>!p)}
              style={eyeBtn}
            >
              {showPwd ? '🙈' : '👁️'}
            </button>
          </div>

          <label style={optinRow}>
            <input type="checkbox" checked={optIn} onChange={e=>setOptIn(e.target.checked)} />
            <span>Vous pouvez m’envoyer des e‑mails concernant PRECOM‑COM.</span>
          </label>

          {error && <div style={alertError}>{error}</div>}
          {info &&  <div style={alertInfo}>{info}</div>}

          <button type="submit" disabled={busy} style={btnPrimary}>
            {busy ? 'Création en cours…' : 'S’inscrire'}
          </button>
        </form>

        <div style={legal}>
          En cliquant sur <b>S’inscrire</b>, vous acceptez nos&nbsp;
          <a href="/conditions" style={a}>conditions générales</a> et notre&nbsp;
          <a href="/confidentialite" style={a}>politique de confidentialité</a>.
        </div>

        <div style={footerRow}>
          <div>Déjà un compte ? <a href="/login" style={a}>Se connecter</a></div>
          <div>
            <select aria-label="Langue" defaultValue="fr" style={langSelect}>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---- styles (sans lib) ---- */
const overlay: React.CSSProperties = {
  position:'fixed', inset:0, background:'rgba(2,6,23,.60)',
  display:'flex', alignItems:'center', justifyContent:'center', padding:16, zIndex:60
}
const card: React.CSSProperties = {
  width:520, maxWidth:'100%', background:'#fff', borderRadius:20,
  boxShadow:'0 15px 40px rgba(0,0,0,.25)', padding:24, position:'relative', color:'#0f172a'
}
const btnClose: React.CSSProperties = {
  position:'absolute', top:8, right:10, width:36, height:36, border:'none',
  background:'transparent', fontSize:28, lineHeight:1, cursor:'pointer', color:'#64748b'
}
const logoBubble: React.CSSProperties = {
  width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#3b82f6,#22c55e)',
  color:'#fff', fontWeight:700, display:'grid', placeItems:'center', fontSize:14
}
const btnGoogle: React.CSSProperties = {
  width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
  border:'1px solid #e2e8f0', background:'#fff', padding:'12px 14px', borderRadius:12,
  fontSize:15, cursor:'pointer'
}
const gIcon: React.CSSProperties = {
  width:22, height:22, borderRadius:'50%', background:'#fff', border:'1px solid #e2e8f0',
  display:'grid', placeItems:'center', fontWeight:700
}
const sep: React.CSSProperties = { position:'relative', margin:'14px 0' }
const sepText: React.CSSProperties = {
  position:'relative', zIndex:1, background:'#fff', padding:'0 10px', color:'#94a3b8', fontSize:12,
  display:'inline-block', marginLeft:8
}
Object.assign(sep, { height:1, background:'#e2e8f0', marginTop:18 })
const label: React.CSSProperties = { display:'block', fontSize:12, letterSpacing:.4, color:'#64748b', margin:'10px 0 6px' }
const input: React.CSSProperties = {
  width:'100%', border:'1px solid #e2e8f0', borderRadius:12, padding:'12px 12px',
  outline:'none', fontSize:15
}
const eyeBtn: React.CSSProperties = {
  position:'absolute', right:6, top:6, height:32, minWidth:32, padding:'0 6px',
  border:'1px solid #e2e8f0', background:'#fff', borderRadius:8, cursor:'pointer'
}
const optinRow: React.CSSProperties = { display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#475569', margin:'10px 0 6px' }
const alertError: React.CSSProperties = { background:'#fee2e2', color:'#991b1b', border:'1px solid #fecaca', padding:'8px 10px', borderRadius:10, fontSize:13, marginTop:8 }
const alertInfo:  React.CSSProperties = { background:'#ecfeff', color:'#155e75', border:'1px solid #a5f3fc', padding:'8px 10px', borderRadius:10, fontSize:13, marginTop:8 }
const btnPrimary: React.CSSProperties = {
  width:'100%', marginTop:12, padding:'12px 14px', borderRadius:12,
  background:'#2563eb', color:'#fff', border:'1px solid #1d4ed8', cursor:'pointer', fontSize:15, fontWeight:600
}
const legal: React.CSSProperties = { fontSize:12, color:'#64748b', marginTop:10, lineHeight:1.45 }
const a: React.CSSProperties = { color:'#2563eb', textDecoration:'none' }
const footerRow: React.CSSProperties = { marginTop:14, display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:13, color:'#475569' }
const langSelect: React.CSSProperties = { border:'1px solid #e2e8f0', borderRadius:10, padding:'6px 10px', background:'#fff' }
