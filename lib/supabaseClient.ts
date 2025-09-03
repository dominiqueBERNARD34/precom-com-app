import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// export nommé (pour ceux qui font: import { supabase } from '@/lib/supabaseClient')
export const supabase = createClient(url, anon)

// export par défaut (pour ceux qui font: import supabase from '@/lib/supabaseClient')
export default supabase
