export type BossKey = "ignis" | "vortex" | "malakor" | "leviathan";

export function normalizeBossKey(bossId: string): BossKey {
  const id = (bossId || "").toLowerCase();
  if (id.includes("ignis")) return "ignis";
  if (id.includes("vortex")) return "vortex";
  if (id.includes("leviathan")) return "leviathan";
  if (id.includes("malakor") || id.includes("malakar")) return "malakor";
  return "malakor";
}

export const BOSS_IMAGE_MAP: Record<BossKey, string> = {
  ignis: "/images/bosses/ignis.jpg",
  vortex: "/images/bosses/vortex.jpg",
  malakor: "/images/bosses/malakar.jpg", // Note: verified filename is malakar.jpg
  leviathan: "/images/bosses/leviathan.jpg",
};

export function getBossArtwork(bossId: string): string {
  const key = normalizeBossKey(bossId);
  return BOSS_IMAGE_MAP[key] || "/images/bosses/ignis.jpg";
}

