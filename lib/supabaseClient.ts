// lib/supabaseClient.ts
'use client';

import { createClient } from '@supabase/supabase-js';
// import type { Database } from './types/supabase'; // si vous avez les types générés

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export default supabase;
