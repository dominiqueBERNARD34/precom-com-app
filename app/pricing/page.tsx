import { Suspense } from 'react';
import PricingClient from './pricing-client';

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement des offres…</div>}>
      <PricingClient />
    </Suspense>
  );
}
