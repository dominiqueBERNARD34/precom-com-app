// src/app/layout.tsx
export const metadata = { title: 'precom-com', description: 'Commissioning assisté IA' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin:0, fontFamily:'Inter, system-ui, Arial' }}>
        <header style={{
          position:'sticky', top:0, zIndex:10, background:'#0b1220', color:'#fff',
          padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between'
        }}>
          <div style={{ fontWeight:700 }}>precom-com</div>

          <nav style={{ display:'flex', gap:16 }}>
             <a href="/"          style={{ color:'#fff', textDecoration:'none' }}>Accueil</a>
             <a href="/systems"   style={{ color:'#fff', textDecoration:'none' }}>Systèmes</a>
             <a href="/tab-lab"   style={{ color:'#fff', textDecoration:'none' }}>Import</a>
             <a href="/pricing"   style={{ color:'#fff', textDecoration:'none' }}>Tarifs</a>
          </nav>


          {/* Actions à droite : SEULEMENT "Se connecter" */}
          <div style={{ display:'flex', gap:12 }}>
            <a href="/auth/sign-in" style={{
              color:'#fff', textDecoration:'none', padding:'6px 10px',
              border:'1px solid rgba(255,255,255,.2)', borderRadius:8
            }}>
              Se connecter
            </a>
            {/* ⛔️ Pas de bouton "Créer un compte" */}
          </div>
        </header>

        <main style={{ maxWidth:1160, margin:'24px auto', padding:'0 16px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
