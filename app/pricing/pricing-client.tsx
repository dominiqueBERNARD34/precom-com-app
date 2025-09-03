'use client';

import { useSearchParams } from 'next/navigation';

export default function PricingClient() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') ?? 'starter';
  // …ton UI ici (sélection de plan, etc.)
  return <div>Tarifs – plan sélectionné : {plan}</div>;
}
