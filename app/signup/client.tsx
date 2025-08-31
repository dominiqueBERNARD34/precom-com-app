'use client';

import { useSearchParams } from 'next/navigation';

export default function Client() {
  const params = useSearchParams();
  const plan = params.get('plan') ?? 'free';

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Inscription</h1>
      <p>Plan sélectionné : <b>{plan}</b></p>
      {/* le reste de votre UI */}
    </main>
  );
}
