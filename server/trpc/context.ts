import { createClient } from "@/lib/supabase/server";

export async function createContext() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return {
    supabase,
    user: data?.claims ?? null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
