'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

export default function NewProjectPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!name.trim()) { setMsg('Veuillez saisir un nom de projet.'); return; }
    setLoading(true);

    // Grâce au default 'owner = auth.uid()' et à la policy RLS,
    // un simple insert suffit :
    const { data, error } = await supabase
      .from('projects')
      .insert({ name: name.trim() })
      .select('id')
      .single();

    setLoading(false);
    if (error) { setMsg(error.message); return; }

    // On enchaine directement vers l’import
    router.push(`/import?project=${data!.id}`);
  }

  return (
    <main className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Nouveau projet</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Nom du projet</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. : Projet Démo"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded bg-cyan-600 text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Création…' : 'Créer le projet'}
        </button>

        {msg && <p className="text-red-600">{msg}</p>}
      </form>
    </main>
  );
}
