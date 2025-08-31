'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Empêche le pré‑rendu statique : la page est calculée à la requête
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function SignupInner() {
  // ← si tu lis ?plan=starter, etc.
  const params = useSearchParams();
  const plan = params.get('plan') ?? 'free';

  // TODO: mets ici ton JSX existant de la page /signup
  // en utilisant "plan" si besoin
  return (
    <main className="p-6">
      <h1>Inscription</h1>
      <p>Plan sélectionné : {plan}</p>
      {/* ...le reste de ton contenu existant... */}
    </main>
  );
}

export default function SignupPage() {
  // ⬇️ la Suspense lève la contrainte de Next pour useSearchParams()
  return (
    <Suspense fallback={null}>
      <SignupInner />
    </Suspense>
  );
}
