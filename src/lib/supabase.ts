import { createClient } from "@supabase/supabase-js";
const env = typeof import.meta !== "undefined" ? import.meta.env : undefined;
const globalEnv =
  typeof globalThis !== "undefined"
    ? (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env
    : undefined;
const supabaseUrl =
  env?.VITE_SUPABASE_URL ||
  globalEnv?.VITE_SUPABASE_URL ||
  "https://kefnamfsbklponaustef.supabase.co";
const supabaseAnonKey =
  env?.VITE_SUPABASE_ANON_KEY ||
  globalEnv?.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_r-K6LiYoxqjFHFipiFgSwQ_rPYEXhHW";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
