// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // renvoie la valeur (string) d'un cookie
        get: (name: string) => cookieStore.get(name)?.value,

        // IMPORTANT : doit accepter 0 ou 1 argument
        getAll: (name?: string) =>
          name ? cookieStore.getAll(name) : cookieStore.getAll(),

        // set / remove utilisent cookieStore.set
        set: (name: string, value: string, options: any) =>
          cookieStore.set({ name, value, ...options }),

        remove: (name: string, options: any) =>
          cookieStore.set({ name, value: '', ...options, maxAge: 0 }),
      },
    }
  );

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${url.origin}/projects?onboard=1`);
}
