import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Export nommé (déjà utilisé par nos nouvelles pages)
export const supabase = createClient(url, anon)

// Export par défaut (pour les fichiers existants qui font "import supabase from …")
export default supabase
