// ═══════════════════════════════════════════════════════════════
// HeritGoa — Supabase Client
// Uses VITE_ env variables — never exposes service role key
// ═══════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[HeritGoa] Supabase env vars not set. ' +
    'Copy .env.example → .env and fill in your project credentials.'
  );
}

export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseKey  || 'placeholder-key',
  {
    auth: { persistSession: true },
    global: { headers: { 'x-application-name': 'heritgoa' } },
  }
);

export default supabase;
