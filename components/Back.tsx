'use client'

import { useRouter } from 'next/navigation';

export default function Back({ href, children }:{
  href?: string; children?: React.ReactNode
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => href ? router.push(href) : router.back()}
      className="text-sm text-slate-600 hover:underline"
    >
      {children ?? 'Retour'}
    </button>
  );
}
