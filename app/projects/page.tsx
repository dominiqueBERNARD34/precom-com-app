// app/projects/page.tsx
import Client from './Client';

export const dynamic = 'force-dynamic';

export default function ProjectsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold mb-6">Projets</h1>
      <Client />
    </div>
  );
}
