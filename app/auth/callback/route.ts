import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Lecture de tous les cookies (forme attendue par @supabase/ssr)
        getAll: () => cookieStore.getAll(),

        // Écriture/suppression sous forme de "batch"
        // (on applique chaque set fourni par Supabase)
        setAll: (
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
          });
        },
      },
    }
  );

  // Échange le code OAuth/magic-link contre une session
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirige vers l’onboarding projets
  return NextResponse.redirect(`${url.origin}/projects?onboard=1`);
}
