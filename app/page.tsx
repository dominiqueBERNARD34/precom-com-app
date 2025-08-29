// app/page.tsx  (www.precom-com.com)
'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Pricing from '@/components/Pricing';

export default function Home() {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''));
  }, []);

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">precom-com</h1>
        <nav className="space-x-4">
          <Link href="/login" className="underline">Se connecter</Link>
          <Link href="/signup" className="underline">Créer un compte</Link>
        </nav>
      </header>

      <section className="mt-12">
        <h2 className="text-xl font-bold">Choisissez votre formule</h2>
        <Pricing defaultEmail={email} />
      </section>
    </main>
  );
}
