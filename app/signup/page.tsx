import { Suspense } from 'react';
import Client from './Client';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] grid place-items-center text-slate-400">Chargement…</div>}>
      <Client />
    </Suspense>
  );
}
