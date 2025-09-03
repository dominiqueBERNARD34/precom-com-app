'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Props = {
  open: boolean
  onClose: () => void
  plan?: 'free' | 'pro' | 'enterprise' | string
}

export default function SignupModal({ open, onClose, plan = 'pro' }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [optIn, setOptIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [lang, setLang] = useState<'fr' | 'en'>('fr')
  const dialogRef = useRef<HTMLDivElement>(null)

  // fermer sur Échap + click hors modal
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    const onClick = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('keydown', onKey)
    setTimeout(() => document.addEventListener('mousedown', onClick), 0)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const t = (k: string) => {
    const dict: Record<string, { fr: string; en: string }> = {
      title: { fr: "Inscrivez‑vous à PRECOM‑COM", en: "Sign up to PRECOM‑COM" },
      selectedPlan: { fr: "Plan sélectionné", en: "Selected plan" },
      email: { fr: "Adresse email", en: "Email address" },
      password: { fr: "Mot de passe (au moins 6 caractères)", en: "Password (at least 6 characters)" },
      marketing: { fr: "Vous pouvez m’envoyer des emails concernant PRECOM‑COM.", en: "You may send me emails about PRECOM‑COM." },
      tos1: { fr: "En cliquant sur S’inscrire, vous acceptez", en: "By clicking Sign up, you agree to" },
      tos2: { fr: "les conditions générales", en: "the Terms of Service" },
      tos3: { fr: "et la politique de confidentialité", en: "and the Privacy Policy" },
      signup: { fr: "S’inscrire", en: "Sign up" },
      or: { fr: "ou", en: "or" },
      continueGoogle: { fr: "Connectez‑vous avec Google", en: "Continue with Google" },
      haveAccount: { fr: "Déjà un compte ?", en: "Already have an account?" },
      signIn: { fr: "Se connecter", en: "Sign in" },
      okCheckEmail: { fr: "Compte créé. Vérifie ta boîte mail pour confirmer ton adresse.", en: "Account created. Check your inbox to confirm your email." }
    }
    return dict[k]?.[lang] ?? k
  }

  const valid = /^\S+@\S+\.\S+$/.test(email) && password.length >= 6

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!valid || loading) return
    try {
      setLoading(true)
      setMsg(null)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
          data: { plan, marketing_opt_in: optIn }
        }
      })
      if (error) throw error
      setMsg(t('okCheckEmail'))
    } catch (err: any) {
      setMsg(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    try {
      setLoading(true)
      setMsg(null)
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
          queryParams: { prompt: 'select_account' }
        }
      })
      // La redirection OAuth prend le relais
    } catch (err: any) {
      setMsg(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div style={styles.backdrop} aria-modal role="dialog" aria-labelledby="signup-title">
      <div ref={dialogRef} style={styles.card}>
        {/* Close button */}
        <button onClick={onClose} aria-label="Fermer" style={styles.closeBtn}>×</button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={styles.logoCircle}>PC</div>
          <h2 id="signup-title" style={{ margin: 0, fontSize: 22 }}>{t('title')}</h2>
        </div>

        {/* Plan */}
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
          {t('selectedPlan')} : <b>{String(plan)}</b>
        </div>

        {/* Google */}
        <button onClick={handleGoogle} disabled={loading} style={{ ...styles.secondaryBtn, width: '100%' }}>
          <GoogleIcon />
          <span>{t('continueGoogle')}</span>
        </button>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerText}>{t('or')}</span>
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailSignup} style={{ display: 'grid', gap: 10 }}>
          <label style={styles.label}>{t('email')}</label>
          <div style={styles.inputWrap}>
            <span style={styles.prefixAt}>@</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="contact@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <label style={styles.label}>{t('password')}</label>
          <div style={styles.inputWrap}>
            <span style={styles.prefixIcon}><LockIcon /></span>
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
              minLength={6}
            />
            <button
              type="button"
              aria-label={showPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              onClick={() => setShowPw(s => !s)}
              style={styles.eyeBtn}
            >
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: '#334155', marginTop: 4 }}>
            <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} />
            <span>{t('marketing')}</span>
          </label>

          <p style={{ fontSize: 12, color: '#475569', margin: '4px 0 0' }}>
            {t('tos1')} <a href="/conditions-generales" style={styles.link}>{t('tos2')}</a> {t('tos3')} (<a href="/confidentialite" style={styles.link}>Privacy</a>).
          </p>

          <button
            type="submit"
            disabled={!valid || loading}
            style={{ ...styles.primaryBtn, opacity: (!valid || loading) ? 0.7 : 1 }}
          >
            {loading ? '…' : t('signup')}
          </button>
        </form>

        {/* Footer: sign in link + language */}
        <div style={styles.footerRow}>
          <div style={{ fontSize: 13 }}>
            {t('haveAccount')} <a href="/login" style={styles.link}>{t('signIn')}</a>
          </div>
          <div>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              style={styles.langSelect}
              aria-label="Langue"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Message / erreurs */}
        {msg && (
          <div role="status" style={styles.message}>
            {msg}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- SVG icônes (inline) ---------- */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden focusable="false" style={{ marginRight: 8 }}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.7 6.1 29.7 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.2-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.3 18.9 14 24 14c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.7 6.1 29.7 4 24 4 16 4 9 8.5 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.3-5.2l-6.1-5c-2 1.5-4.6 2.2-7.2 2.2-5.3 0-9.8-3.4-11.4-8l-6.3 4.9C9 39.5 15.9 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.7-5.3 6-9.3 6-5.3 0-9.8-3.4-11.4-8l-6.3 4.9C9 39.5 15.9 44 24 44c8.7 0 18-6.3 18-20 0-1.3-.1-2.2-.4-3.5z" />
    </svg>
  )
}
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#64748b" strokeWidth="2">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#64748b" strokeWidth="2">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#64748b" strokeWidth="2">
      <path d="M1 1l22 22" />
      <path d="M10.6 10.6A3 3 0 0 0 12 15c5 0 9-3 11-7-1-2-2.5-3.7-4.2-4.9" />
      <path d="M6.8 6.8C3.8 8.2 2 10.5 1 12c0 0 4 7 11 7 1.5 0 2.9-.3 4.2-.9" />
    </svg>
  )
}

/* ---------- Styles ---------- */
const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(2,6,23,.72)',
    backdropFilter: 'blur(2px)', display: 'grid', placeItems: 'center', padding: 16, zIndex: 50
  },
  card: {
    position: 'relative',
    width: '100%', maxWidth: 520,
    background: '#fff', borderRadius: 20,
    boxShadow: '0 20px 60px rgba(2,6,23,.35)',
    padding: 20
  },
  closeBtn: {
    position: 'absolute', top: 10, right: 12, width: 36, height: 36,
    borderRadius: 999, border: '1px solid #e2e8f0', background: '#fff',
    cursor: 'pointer', fontSize: 22, lineHeight: 1
  },
  logoCircle: {
    width: 36, height: 36, borderRadius: 8,
    background: 'linear-gradient(135deg,#22c55e,#0ea5e9)',
    color: '#fff', fontWeight: 800, display: 'grid', placeItems: 'center', fontSize: 14
  },
  secondaryBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    height: 44, padding: '0 12px',
    border: '1px solid #e2e8f0', background: '#fff', borderRadius: 10,
    fontWeight: 600, cursor: 'pointer'
  },
  divider: {
    position: 'relative', height: 18, margin: '14px 0 8px',
    borderTop: '1px solid #e5e7eb'
  },
  dividerText: {
    position: 'absolute', left: '50%', transform: 'translate(-50%,-50%)',
    top: 0, background: '#fff', padding: '0 8px', fontSize: 12, color: '#64748b'
  },
  label: { fontSize: 13, color: '#0f172a', marginTop: 2 },
  inputWrap: { position: 'relative' },
  prefixAt: {
    position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
    color: '#64748b', fontWeight: 600, fontSize: 14
  },
  prefixIcon: {
    position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)'
  },
  input: {
    width: '100%', height: 44, borderRadius: 10,
    border: '1px solid #e2e8f0', padding: '0 12px 0 34px',
    outline: 'none', fontSize: 14
  },
  eyeBtn: {
    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    border: 'none', background: 'transparent', cursor: 'pointer'
  },
  primaryBtn: {
    height: 46, borderRadius: 12, border: '1px solid #2563eb',
    background: 'linear-gradient(180deg,#3b82f6,#2563eb)',
    color: '#fff', fontWeight: 700, cursor: 'pointer', marginTop: 8
  },
  footerRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 12
  },
  langSelect: {
    border: '1px solid #e2e8f0', borderRadius: 10, padding: '6px 10px', background: '#fff'
  },
  link: { color: '#2563eb', textDecoration: 'none' },
  message: {
    marginTop: 12, padding: 10,
    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
    fontSize: 13, color: '#0f172a'
  }
}
