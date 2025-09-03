// src/app/layout.tsx
import { Suspense } from 'react'; // ⬅️ AJOUT

export const metadata = { title: 'precom-com', description: 'Commissioning assisté IA' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin:0, fontFamily:'Inter, system-ui, Arial' }}>
        <header>…</header>
        <main style={{ maxWidth:1160, margin:'24px auto', padding:'0 16px' }}>
          {/* ⬇️ AJOUT : Suspense global */}
          <Suspense fallback={<div />}>
            {children}
          </Suspense>
        </main>
      </body>
    </html>
  )
}
