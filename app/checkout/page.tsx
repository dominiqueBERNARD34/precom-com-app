import { Suspense } from 'react';
import CheckoutClient from './checkout-client';

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement du checkout…</div>}>
      <CheckoutClient />
    </Suspense>
  );
}
