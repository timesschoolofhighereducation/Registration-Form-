import { createClient } from "@supabase/supabase-js";

export function supabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim();

  if (!url) {
    throw new Error("Missing required env var: NEXT_PUBLIC_SUPABASE_URL");
  }

  const key = serviceRoleKey || publishableKey;
  if (!key) {
    throw new Error(
      "Missing Supabase key: set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
