export type BossKey = "ignis" | "vortex" | "malakor" | "leviathan";

export function normalizeBossKey(bossId: string): BossKey {
  const id = bossId.toLowerCase();
  if (id.includes("ignis")) return "ignis";
  if (id.includes("vortex")) return "vortex";
  if (id.includes("leviathan")) return "leviathan";
  if (id.includes("malakor")) return "malakor";
  return "malakor";
}

