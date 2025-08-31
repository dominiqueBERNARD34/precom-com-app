'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function NewSubsystemInner() {
  const params = useSearchParams();
  // Exemple : lecture d’un éventuel project_id dans l’URL
  const projectId = params.get('project_id') ?? '';

  // TODO: mets ici ton JSX existant pour la création d’un SS
  return (
    <main className="p-6">
      <h1>Nouveau sous‑système</h1>
      <p>Projet : {projectId || '—'}</p>
      {/* ...le reste de ton contenu existant... */}
    </main>
  );
}

export default function NewSubsystemPage() {
  return (
    <Suspense fallback={null}>
      <NewSubsystemInner />
    </Suspense>
  );
}
