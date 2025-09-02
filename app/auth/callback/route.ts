// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  const cookieStore = cookies();

  // Crée le client SSR avec les méthodes cookies attendues par @supabase/ssr
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // renvoie la valeur (string) d'un cookie
        get: (name: string) => cookieStore.get(name)?.value,

        // renvoie toutes les occurrences d’un cookie (signature récente de @supabase/ssr)
        getAll: (name: string) => cookieStore.getAll(name),

        // set / remove doivent utiliser cookieStore.set
        set: (name: string, value: string, options: any) =>
          cookieStore.set({ name, value, ...options }),

        remove: (name: string, options: any) =>
          cookieStore.set({ name, value: '', ...options, maxAge: 0 }),
      },
    }
  );

  if (code) {
    // échange le code OAuth contre une session
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirection après callback (à ajuster si besoin)
  return NextResponse.redirect(`${url.origin}/projects?onboard=1`);
}
