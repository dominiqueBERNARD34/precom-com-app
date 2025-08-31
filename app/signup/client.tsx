// app/signup/client.tsx  (Client Component)
'use client';

import { useSearchParams } from 'next/navigation';

export default function Client() {
  const params = useSearchParams();
  const plan = params.get('plan') ?? 'free';

  return (
    <main className="p-6">
      <h1>Inscription</h1>
      <p>Plan sélectionné : {plan}</p>
      {/* TODO: ton formulaire / UI d’inscription */}
    </main>
  );
}
