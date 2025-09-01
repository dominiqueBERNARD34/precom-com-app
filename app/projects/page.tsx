import { Suspense } from 'react';
import ProjectsClient from './Client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<div className="py-12 text-center">Chargement…</div>}>
      <ProjectsClient />
    </Suspense>
  );
}
