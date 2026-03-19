import { createClient } from "@supabase/supabase-js";

export const supabaseServerClient = () =>
  createClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"),
    {
      auth: {
        persistSession: false,
      },
    }
  );

function getRequiredEnv(
  name:
    | "NEXT_PUBLIC_SUPABASE_URL"
    | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"
) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}
