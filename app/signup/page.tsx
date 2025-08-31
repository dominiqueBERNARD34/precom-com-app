// app/signup/page.tsx (Server Component possible)
import { Suspense } from 'react';
import Client from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Client />
    </Suspense>
  );
}

// app/signup/client.tsx (Client Component)
'use client';
import { useSearchParams } from 'next/navigation';

export default function Client() {
  const params = useSearchParams();
  // ... ton JSX
}
