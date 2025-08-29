// components/Pricing.tsx
'use client';
import { useRouter } from 'next/navigation';
import { PLANS } from '@/lib/plans';

export default function Pricing({ defaultEmail='' }: { defaultEmail?: string }) {
  const router = useRouter();
  const plans = ([
    ['free','starter','growth','business','pro'] as const
  ])[0];

  const go = (plan: string) => {
    // 1) on passe par /signup pour créer le compte, puis checkout (si payant)
    router.push(`/signup?plan=${plan}`);
  };

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {plans.map((key) => {
        const p = PLANS[key];
        return (
          <div key={key} className="border rounded p-5">
            <h3 className="font-semibold text-lg">{p.label}</h3>
            <p className="text-slate-600 mt-1">{p.price}</p>
            <ul className="mt-3 text-sm leading-6">
              <li>Projets: {p.limits.max_projects}</li>
              <li>Systèmes / projet: {p.limits.max_systems}</li>
              <li>Sous-systèmes / système: {p.limits.max_subsystems_per_system}</li>
            </ul>
            <button
              className="mt-4 px-4 py-2 border rounded"
              onClick={() => go(key)}
            >
              Choisir
            </button>
          </div>
        );
      })}
    </div>
  );
}
