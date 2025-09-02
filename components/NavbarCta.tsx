// components/NavbarCta.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavbarCta() {
  const pathname = usePathname();
  const hide =
    pathname?.startsWith('/signup') ||
    pathname?.startsWith('/auth'); // évite le double affichage

  if (hide) return null;

  return (
    <Link
      href="/signup?plan=free"
      className="rounded-lg bg-brand px-4 py-2 font-semibold text-[#06202A] hover:brightness-110"
    >
      Créer un compte
    </Link>
  );
}
