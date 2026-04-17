// =============================================================================
// lib/supabase.ts
// Creates the correct Supabase client depending on context.
//
//  • getPublicClient()  → browser-safe, anon key, RLS enforced
//  • getAdminClient()   → server-only, service_role key, bypasses RLS
// =============================================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY      = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// ---------------------------------------------------------------------------
// Browser / Client-Component client (anon key — RLS applied)
// ---------------------------------------------------------------------------
let _browserClient: SupabaseClient | null = null;

export function getPublicClient(): SupabaseClient {
  if (!_browserClient) {
    _browserClient = createClient(SUPABASE_URL, ANON_KEY);
  }
  return _browserClient;
}

// ---------------------------------------------------------------------------
// Server-only client (service_role key — bypasses RLS)
// Only import this in Server Components or API routes.
// ---------------------------------------------------------------------------
export function getAdminClient(): SupabaseClient {
  if (!SERVICE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY — do not call getAdminClient() on the browser');
  }
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
