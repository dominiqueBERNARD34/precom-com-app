'use client';

import { useSearchParams } from 'next/navigation';

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  // …ton UI ici (ex: lecture des params, affichage du panier, etc.)
  return <div>Checkout {sessionId ? `#${sessionId}` : ''}</div>;
}
