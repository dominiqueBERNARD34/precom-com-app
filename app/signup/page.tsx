// app/signup/page.tsx
import { Suspense } from 'react';
import Client from './Client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = { searchParams?: { plan?: string } };

export default function Page({ searchParams }: Props) {
  const plan = (searchParams?.plan ?? 'free').toLowerCase();
  return (
    <main className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-[#0B1728] to-[#0A1422]">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          Inscrivez‑vous à <span className="text-brand">PRECOM‑COM</span>
        </h1>

        <Suspense fallback={null}>
          <Client initialPlan={plan} />
        </Suspense>
      </div>
    </main>
  );
}
