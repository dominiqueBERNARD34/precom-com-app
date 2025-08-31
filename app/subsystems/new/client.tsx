'use client';

import { useSearchParams } from 'next/navigation';

export default function Client() {
  const params = useSearchParams();
  const projectId = params.get('project_id') ?? '';

  return (
    <main className="p-6">
      <h1>Nouveau sous‑système</h1>
      {projectId && <p>Projet : {projectId}</p>}
      {/* TODO: ta UI de création */}
    </main>
  );
}
