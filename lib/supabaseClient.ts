// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// on crée le client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ⚠️ Export par défaut + export nommé pour satisfaire tout le code existant
export default supabase;
