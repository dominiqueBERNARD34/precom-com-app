// lib/supabaseBrowser.ts
'use client';

import { createBrowserClient } from '@supabase/ssr';
// Si vous avez un type Database généré par Supabase :
// import type { Database } from './types/supabase';

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Export par défaut pratique si votre code s'attend à `import supabase from ...`
const supabase = createSupabaseBrowserClient();
export default supabase;
