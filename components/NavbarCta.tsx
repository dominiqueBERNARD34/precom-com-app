// components/Navbar.tsx (exemple)
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const onSignup = pathname?.startsWith('/signup');

  return (
    <header className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-6">
      <Link href="/" className="font-semibold">precom-com</Link>
      <nav className="ml-auto flex items-center gap-3">
        <Link href="/login" className="text-slate-200 hover:text-white">Se connecter</Link>
        {!onSignup && (
          <Link href="/signup?plan=free" className="inline-flex items-center rounded-lg bg-primary text-slate-900 font-semibold px-4 py-2 hover:bg-primary/90">
            Créer un compte
          </Link>
        )}
      </nav>
    </header>
  );
}
