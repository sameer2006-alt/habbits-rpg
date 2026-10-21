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

/**
 * Detects if an error is due to an offline network state, local mock environment,
 * or placeholder connection string, preserving the app's offline functionality.
 */
export function isNetworkOrMockError(err: unknown): boolean {
  if (!err) return false;
  const anyErr = err as { message?: string; details?: string; hint?: string; code?: string };
  const msg = String(anyErr.message || "");
  const details = String(anyErr.details || "");
  const hint = String(anyErr.hint || "");
  const code = String(anyErr.code || "");

  return (
    msg.includes("fetch failed") ||
    msg.includes("Failed to fetch") ||
    msg.includes("NetworkError") ||
    msg.includes("ENOTFOUND") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("placeholder") ||
    details.includes("ENOTFOUND") ||
    details.includes("fetch failed") ||
    hint.includes("placeholder") ||
    code === "ENOTFOUND" ||
    code === "ECONNREFUSED"
  );
}
