import { createClient } from "@supabase/supabase-js";

// Service role client for server-side operations that bypass RLS
// WARNING: This exposes service role key to client-side - FOR DEVELOPMENT ONLY!
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

// Regular browser client for normal operations
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
