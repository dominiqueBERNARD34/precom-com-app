import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const next = url.searchParams.get('next') || '/projects';
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        },
      } as CookieMethodsServer,
    },
  );

  // Échange le code OAuth / magic-link contre une session
  await supabase.auth.exchangeCodeForSession();
  return NextResponse.redirect(new URL(next, url.origin));
}
