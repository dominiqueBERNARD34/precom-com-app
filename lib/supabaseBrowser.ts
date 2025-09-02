// lib/supabaseBrowser.ts
'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Default export pratique si certains fichiers font `import supabase from ...`
const supabase = createSupabaseBrowser();
export default supabase;
