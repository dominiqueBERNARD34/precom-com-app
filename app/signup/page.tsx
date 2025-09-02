// app/signup/page.tsx
import { Suspense } from 'react';
import Client from './Client';

export const dynamic = 'force-dynamic';

export default function Page({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
  const plan = searchParams?.plan ?? 'free';

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 text-white">
      <h1 className="mb-2 text-3xl font-bold">Inscrivez‑vous à PRECOM‑COM</h1>
      <p className="mb-8 text-white/70">
        Plan sélectionné&nbsp;: <span className="text-teal-300">{plan}</span>
      </p>

      {/* Le client ouvre la modale automatiquement si non connecté */}
      <Suspense>
        <Client plan={plan} />
      </Suspense>
    </main>
  );
}
