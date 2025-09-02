// components/Header.tsx
import { usePathname } from 'next/navigation';
export function Header() {
  const pathname = usePathname();
  const onSignup = pathname?.startsWith('/signup');

  return (
    <nav className="...">
      <div className="font-extrabold">precom-com</div>
      {!onSignup && (
        <a href="/signup" className="bg-brand text-[#06202A] px-4 py-2 rounded-lg">
          Créer un compte
        </a>
      )}
    </nav>
  );
}
